"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE, UserProfile, AuthResponse } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTraveler: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
    homeCity?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  authModalOpen: boolean;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "register";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "tourflow_jwt_token";
const REFRESH_TOKEN_KEY = "tourflow_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Restore authenticated session from localStorage or refresh token on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        const savedRefreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        setToken(savedToken);
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const userData: UserProfile = await res.json();
          setUser(userData);
        } else if (savedRefreshToken) {
          // Token expired - attempt seamless refresh
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: savedToken, refreshToken: savedRefreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData: AuthResponse = await refreshRes.json();
              setToken(refreshData.token);
              setUser(refreshData.user);
              localStorage.setItem(TOKEN_KEY, refreshData.token);
              if (refreshData.refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
              }
            } else {
              // Refresh token invalid or expired
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              setToken(null);
              setUser(null);
            }
          } catch {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Invalid credentials." };
      }

      const authData: AuthResponse = data;
      setToken(authData.token);
      setUser(authData.user);
      localStorage.setItem(TOKEN_KEY, authData.token);
      if (authData.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      }
      setAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
    homeCity?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phoneNumber, homeCity }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Registration failed." };
      }

      const authData: AuthResponse = data;
      setToken(authData.token);
      setUser(authData.user);
      localStorage.setItem(TOKEN_KEY, authData.token);
      if (authData.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      }
      setAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      console.error("Registration request failed:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (savedToken) {
      fetch(`${API_BASE}/auth/revoke-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${savedToken}` },
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!token) return { success: false, error: "Not authenticated" };

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        return { success: false, error: "Failed to update profile." };
      }

      const updatedUser: UserProfile = await res.json();
      setUser(updatedUser);
      return { success: true };
    } catch {
      return { success: false, error: "Network error." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        isSuperAdmin: user?.role === "SuperAdmin",
        isAdmin: user?.role === "Admin" || user?.role === "SuperAdmin",
        isTraveler: user?.role === "User" || !user?.role,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
