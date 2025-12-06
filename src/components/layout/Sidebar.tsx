import { 
  Home, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  History, 
  Brain, 
  Briefcase, 
  Settings, 
  Key,
  Wifi,
  WifiOff
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const tradingItems = [
  { name: "Watchlist", href: "/watchlist", icon: Clock },
  { name: "My Orders", href: "/orders", icon: BookOpen },
  { name: "Positions", href: "/positions", icon: TrendingUp },
  { name: "Order Logs", href: "/order-logs", icon: History },
];

const managementItems = [
  { name: "My Strategies", href: "/strategies", icon: Brain },
  { name: "My Activity", href: "/activity", icon: Briefcase },
  { name: "Broker Settings", href: "/brokers", icon: Settings },
  { name: "Trade Settings", href: "/trade-settings", icon: Key },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true);

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const isDashboardActive = location.pathname === "/";

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
          <span className="text-sm font-semibold text-sidebar-foreground leading-tight">TradingPanel</span>
          <span className="text-xs text-muted-foreground leading-tight">Trading Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Dashboard */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isDashboardActive
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Home className={cn("h-5 w-5", isDashboardActive ? "text-sidebar-primary" : "text-sidebar-foreground")} />
          Dashboard
        </Link>

        {/* TRADING Section */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            TRADING
          </h3>
          {tradingItems.map((item) => {
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

        {/* MANAGEMENT Section */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            MANAGEMENT
          </h3>
          {managementItems.map((item) => {
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

      {/* Online Status */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-red-500 flex-shrink-0" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm text-sidebar-foreground truncate">You are online</span>
          </div>
          <Switch
            checked={isOnline}
            onCheckedChange={setIsOnline}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
