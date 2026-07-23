import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    user?.passwordChangeRequired &&
    location.pathname !== "/profile"
  ) {
    return <Navigate to="/profile?passwordFlow=expired" replace />;
  }

  return <Outlet />;
}
