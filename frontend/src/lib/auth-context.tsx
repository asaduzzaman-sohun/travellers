"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  savedTripsCount: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (name?: string, email?: string) => void;
  logout: () => void;
  toggleAuthState: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  toggleAuthState: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tourflow_bd_auth");
    if (saved === "true") {
      setIsLoggedIn(true);
      setUser({
        name: "Rahim Chowdhury",
        email: "rahim.chowdhury@gmail.com",
        role: "Verified Explorer",
        savedTripsCount: 4,
      });
    }
  }, []);

  const login = (name = "Rahim Chowdhury", email = "rahim.chowdhury@gmail.com") => {
    setIsLoggedIn(true);
    setUser({
      name,
      email,
      role: "Verified Explorer",
      savedTripsCount: 4,
    });
    localStorage.setItem("tourflow_bd_auth", "true");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("tourflow_bd_auth");
  };

  const toggleAuthState = () => {
    if (isLoggedIn) logout();
    else login();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, toggleAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
