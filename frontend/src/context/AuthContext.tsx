import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import {
  firebaseLoginUser,
  firebaseRegisterUser,
  firebaseGoogleSignIn,
  firebaseSignOut,
  auth,
} from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (fullName: string, email: string, pass: string) => Promise<User>;
  googleSignIn: () => Promise<User>;
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
      const stored = localStorage.getItem("certichain_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial local read
    refreshMe();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const stored = localStorage.getItem("certichain_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const newUser: User = {
            id: fbUser.uid,
            email: fbUser.email || "user@certichain.io",
            fullName: fbUser.displayName || fbUser.email?.split("@")[0] || "Verified User",
            role: "STUDENT",
            status: "ACTIVE",
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem("certichain_user", JSON.stringify(newUser));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const loggedUser = await firebaseLoginUser(email, pass);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (fullName: string, email: string, pass: string): Promise<User> => {
    const newUser = await firebaseRegisterUser(email, pass, fullName, "STUDENT");
    setUser(newUser);
    return newUser;
  };

  const googleSignIn = async (): Promise<User> => {
    const googleUser = await firebaseGoogleSignIn();
    setUser(googleUser);
    return googleUser;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitIssuerApplication = async (data: any) => {
    const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`;
    return {
      applicationId,
      message: "Accreditation application submitted successfully to CertiChain Governance Board.",
    };
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleSignIn,
        submitIssuerApplication,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
