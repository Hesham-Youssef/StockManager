// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("jwtToken");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const isAdmin = decoded.roles?.includes("ROLE_ADMIN");
    if (adminOnly && !isAdmin) {
      return (
        <div className="container mt-5 text-center text-danger">
          <h4>Access Denied</h4>
          <p>You must be an admin to access this page.</p>
        </div>
      );
    }
    return children;
  } catch (e) {
    localStorage.removeItem("jwtToken");
    return <Navigate to="/login" />;
  }
}

export default PrivateRoute;
