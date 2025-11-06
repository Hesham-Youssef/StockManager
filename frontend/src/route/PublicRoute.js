import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PublicRoute({ children }) {
  const token = localStorage.getItem("jwtToken");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp > now) {
        // User already logged in → redirect away
        return <Navigate to="/exchanges" replace />;
      } else {
        localStorage.removeItem("jwtToken");
      }
    } catch {
      localStorage.removeItem("jwtToken");
    }
  }

  return children;
}

export default PublicRoute;
