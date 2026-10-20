import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenManager } from "@/services/tokenManager";

// Protected route guard based on tokenManager authentication
const ProtectedRoute = () => {
  if (!tokenManager.hasToken()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
