import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api, setAccessToken, getAccessToken } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (fullName: string, email: string, pass: string) => Promise<User>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitIssuerApplication: (data: any) => Promise<{ applicationId: string; message: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    try {
      if (!getAccessToken()) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get<{ success: boolean; data: { user: User } }>("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>("/auth/login", {
      email,
      password: pass,
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (fullName: string, email: string, pass: string): Promise<User> => {
    const res = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>("/auth/register", {
      fullName,
      email,
      password: pass,
      role: "STUDENT",
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitIssuerApplication = async (data: any) => {
    const res = await api.post<{ success: boolean; message: string; data: { applicationId: string } }>(
      "/auth/issuer-application",
      data
    );
    return { applicationId: res.data.applicationId, message: res.message };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        submitIssuerApplication,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
