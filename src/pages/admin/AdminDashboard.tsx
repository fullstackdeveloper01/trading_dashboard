import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Activity,
  TrendingUp,
  Shield,
  Database,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { adminApiFetch, checkAdminTokenExpiration } from "@/lib/adminApi";
import { getApiBaseUrl } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardData {
  summary: {
    totalUsers: {
      total: number;
      active: number;
    };
    brokers: {
      total: number;
      connected: number;
    };
    totalOrders: {
      allTime: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: number;
    };
    totalTrades: {
      allTime: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: number;
    };
  };
  weeklyOrders: Array<{
    day: string;
    fullDay: string;
    date: string;
    count: number;
  }>;
  brokerStatus: Array<{
    name: string;
    displayName: string;
    total: number;
    connected: number;
    disconnected: number;
    percentage: number;
  }>;
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: {
      totalUsers: { total: 0, active: 0 },
      brokers: { total: 0, connected: 0 },
      totalOrders: { allTime: 0, thisMonth: 0, lastMonth: 0, percentageChange: 0 },
      totalTrades: { allTime: 0, thisMonth: 0, lastMonth: 0, percentageChange: 0 },
    },
    weeklyOrders: [],
    brokerStatus: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await adminApiFetch(
        `${getApiBaseUrl()}/api/admin/dashboard`,
        { method: "GET" }
      );

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDashboardData(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate percentages
  const activeUserPercentage = dashboardData.summary.totalUsers.total > 0 
    ? Math.round((dashboardData.summary.totalUsers.active / dashboardData.summary.totalUsers.total) * 100) 
    : 0;
  const connectedBrokerPercentage = dashboardData.summary.brokers.total > 0 
    ? Math.round((dashboardData.summary.brokers.connected / dashboardData.summary.brokers.total) * 100) 
    : 0;

  // Chart data from API
  const ordersData = dashboardData.weeklyOrders.map((item) => ({
    name: item.day,
    orders: item.count,
  }));

  // Broker status data for pie chart
  const brokerPieData = dashboardData.brokerStatus.flatMap((broker) => [
    { name: `${broker.displayName} Connected`, value: broker.connected, color: "#10b981" },
    { name: `${broker.displayName} Disconnected`, value: broker.disconnected, color: "#ef4444" },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, monitor system, and configure settings
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.summary.totalUsers.total}</div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xs text-muted-foreground">
                {dashboardData.summary.totalUsers.active} active users
              </p>
              {activeUserPercentage > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ({activeUserPercentage}%)
                </span>
              )}
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${activeUserPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brokers</CardTitle>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.summary.brokers.total}</div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xs text-muted-foreground">
                {dashboardData.summary.brokers.connected} connected
              </p>
              {connectedBrokerPercentage > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ({connectedBrokerPercentage}%)
                </span>
              )}
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${connectedBrokerPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.summary.totalOrders.allTime}</div>
            <p className="text-xs text-muted-foreground mt-2">All time orders</p>
            <div className="flex items-center gap-1 mt-2">
              {dashboardData.summary.totalOrders.percentageChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${
                dashboardData.summary.totalOrders.percentageChange >= 0 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {dashboardData.summary.totalOrders.percentageChange >= 0 ? "+" : ""}
                {dashboardData.summary.totalOrders.percentageChange}% from last month
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              This month: {dashboardData.summary.totalOrders.thisMonth} | Last month: {dashboardData.summary.totalOrders.lastMonth}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.summary.totalTrades.allTime}</div>
            <p className="text-xs text-muted-foreground mt-2">All time trades</p>
            <div className="flex items-center gap-1 mt-2">
              {dashboardData.summary.totalTrades.percentageChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${
                dashboardData.summary.totalTrades.percentageChange >= 0 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {dashboardData.summary.totalTrades.percentageChange >= 0 ? "+" : ""}
                {dashboardData.summary.totalTrades.percentageChange}% from last month
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              This month: {dashboardData.summary.totalTrades.thisMonth} | Last month: {dashboardData.summary.totalTrades.lastMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>Weekly order statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Broker Status</CardTitle>
            <CardDescription>Connection distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={brokerPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brokerPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {dashboardData.brokerStatus.map((broker) => (
                <div key={broker.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{broker.displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">{broker.connected} connected</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-red-600 dark:text-red-400">{broker.disconnected} disconnected</span>
                    <span className="text-muted-foreground">({broker.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.totalUsers.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Brokers</CardTitle>
            <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.brokers.connected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {dashboardData.summary.brokers.total} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Online</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Recent activity will be displayed here...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

