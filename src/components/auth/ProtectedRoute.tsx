import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const accessToken = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  // Check if user is authenticated
  if (!accessToken || !user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

