import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./LoadingState";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState fullScreen message="Restoring your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
