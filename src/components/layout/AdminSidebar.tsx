import { 
  BarChart3,
  Users,
  Activity,
  Settings,
  Shield,
  LogOut,
  Database,
  DollarSign,
  Brain
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const adminItems = [
  { name: "Dashboard", href: "/admin/Dashboard", icon: BarChart3 },
  { name: "User List", href: "/admin/UserList", icon: Users },
  { name: "Broker List", href: "/admin/BrokerList", icon: Database },
  { name: "Strategies", href: "/admin/Strategies", icon: Brain },
  { name: "Pricing Plans", href: "/admin/PricingPlans", icon: DollarSign },
  { name: "Activity", href: "/admin/Activity", icon: Activity },
  { name: "Settings", href: "/admin/Settings", icon: Settings },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminTokenType");
    localStorage.removeItem("adminUser");
    toast.success("Admin logged out successfully");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="h-full w-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sidebar-border">
        <div className="grid grid-cols-3 gap-0.5 w-10 h-10 flex-shrink-0">
          <div className="w-full h-full bg-red-500 rounded-tl"></div>
          <div className="w-full h-full bg-blue-500"></div>
          <div className="w-full h-full bg-yellow-500 rounded-tr"></div>
          <div className="w-full h-full bg-cyan-400"></div>
          <div className="w-full h-full bg-orange-500"></div>
          <div className="w-full h-full bg-green-500"></div>
          <div className="w-full h-full bg-purple-500 rounded-bl"></div>
          <div className="w-full h-full bg-pink-500"></div>
          <div className="w-full h-full bg-indigo-500 rounded-br"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground leading-tight">Admin Panel</span>
          <span className="text-xs text-muted-foreground leading-tight">Administration</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* ADMIN Section */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            ADMIN
          </h3>
          {adminItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

