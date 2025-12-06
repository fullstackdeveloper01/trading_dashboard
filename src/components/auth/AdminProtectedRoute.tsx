import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({
  children,
}: AdminProtectedRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for admin authentication
    const checkAuth = () => {
      const adminToken = localStorage.getItem("adminToken");
      const adminUser = localStorage.getItem("adminUser");

      console.log("AdminProtectedRoute check:", {
        hasToken: !!adminToken,
        hasUser: !!adminUser,
        token: adminToken ? adminToken.substring(0, 20) + "..." : null
      });

      if (adminToken && adminUser) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    // Check immediately
    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin-login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

