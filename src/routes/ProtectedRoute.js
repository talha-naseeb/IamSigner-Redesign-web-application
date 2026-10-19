import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Simple protected route guard based on presence of session token
const ProtectedRoute = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
