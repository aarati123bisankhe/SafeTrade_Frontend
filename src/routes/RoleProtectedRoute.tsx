import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import type { UserRole } from "../types/auth.types";

type RoleProtectedRouteProps = { 
  allowedRoles: UserRole[];
};

export default function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
