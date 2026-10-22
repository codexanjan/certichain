const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let accessToken: string | null = localStorage.getItem("certichain_token");

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem("certichain_token", token);
  } else {
    localStorage.removeItem("certichain_token");
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface RequestOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Handle Token Refresh on 401
  if (response.status === 401 && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login")) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          headers.set("Authorization", `Bearer ${refreshData.data.accessToken}`);
          const retryRes = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
          });
          return await handleResponse<T>(retryRes);
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/pdf")) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || "Request failed";
    const error = new Error(errorMsg) as Error & { code?: string; details?: unknown };
    error.code = data?.error?.code;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: "GET" }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  postForm: <T>(url: string, formData: FormData, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body: formData }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: "DELETE" }),
};
