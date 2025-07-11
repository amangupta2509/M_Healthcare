import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("currentUser"));
  } catch (err) {
    console.error("Invalid user data in localStorage:", err);
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize roles
  const userRole = (user.role || "").toLowerCase();
  const allowed = allowedRoles.map((role) => role.toLowerCase());

  if (!allowed.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
