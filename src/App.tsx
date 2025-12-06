import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Brokers from "./pages/Brokers";
import Trades from "./pages/Trades";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import Positions from "./pages/Positions";
import OrderLogs from "./pages/OrderLogs";
import MyStrategies from "./pages/MyStrategies";
import MyActivity from "./pages/MyActivity";
import TradeSettings from "./pages/TradeSettings";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminBrokerList from "./pages/admin/AdminBrokerList";
import AdminPricingPlans from "./pages/admin/AdminPricingPlans";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStrategies from "./pages/admin/AdminStrategies";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminAuth />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brokers"
            element={
              <ProtectedRoute>
                <Brokers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trades"
            element={
              <ProtectedRoute>
                <Trades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/positions"
            element={
              <ProtectedRoute>
                <Positions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-logs"
            element={
              <ProtectedRoute>
                <OrderLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategies"
            element={
              <ProtectedRoute>
                <MyStrategies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <MyActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trade-settings"
            element={
              <ProtectedRoute>
                <TradeSettings />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <Admin />
              </AdminProtectedRoute>
            }
          >
            <Route path="Dashboard" element={<AdminDashboard />} />
            <Route path="UserList" element={<AdminUserList />} />
            <Route path="BrokerList" element={<AdminBrokerList />} />
            <Route path="Strategies" element={<AdminStrategies />} />
            <Route path="PricingPlans" element={<AdminPricingPlans />} />
            <Route path="Activity" element={<AdminActivity />} />
            <Route path="Settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="/admin/Dashboard" replace />} />
          </Route>
          
          {/* Legacy admin-panel route redirect */}
          <Route
            path="/admin-panel"
            element={
              <AdminProtectedRoute>
                <Navigate to="/admin/Dashboard" replace />
              </AdminProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard if authenticated, otherwise to auth */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
