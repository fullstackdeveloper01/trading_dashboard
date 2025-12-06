import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Header } from "@/components/layout/Header";
import { Outlet, useLocation, Navigate } from "react-router-dom";

const Admin = () => {
  const location = useLocation();

  // Redirect /admin to /admin/Dashboard
  if (location.pathname === "/admin" || location.pathname === "/admin-panel") {
    return <Navigate to="/admin/Dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
