// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from token if present
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.sub,
          roles: decoded.roles || [],
        });
      } catch {
        localStorage.removeItem("jwtToken");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("jwtToken", token);
    const decoded = jwtDecode(token);
    setUser({
      username: decoded.sub,
      roles: decoded.roles || [],
    });
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}