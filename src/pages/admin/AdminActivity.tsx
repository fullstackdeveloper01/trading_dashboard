import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  CalendarIcon,
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
  Activity,
  User,
  Database,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminApiFetch, checkAdminTokenExpiration } from "@/lib/adminApi";
import { getApiBaseUrl } from "@/lib/api";

interface ActivityLog {
  id: string | number;
  log: string;
  data: string;
  actionType?: string;
  timestamp?: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    fullname?: string;
    username?: string;
  };
  [key: string]: any;
}

const AdminActivity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [actionType, setActionType] = useState<string>("all");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50;
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Map API response to ActivityLog format
  const mapApiItemToActivityLog = (item: any): ActivityLog => {
    return {
      id: item.id || item._id || Math.random(),
      log: item.log || item.message || item.action || item.description || "",
      data: typeof item.data === "string" ? item.data : JSON.stringify(item.data || item.metadata || {}),
      actionType: item.actionType || item.type || "",
      timestamp: item.timestamp || item.createdAt || item.date || "",
      userId: item.userId || item.user?.id || "",
      user: item.user || null,
    };
  };

  // Fetch activity logs from API
  const fetchActivityLogs = useCallback(
    async (page: number, search: string, action: string, startDateParam: Date | null) => {
      setIsLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) {
          params.append("search", search);
        }
        if (action && action !== "all") {
          params.append("actionType", action);
        }
        if (startDateParam) {
          params.append("startDate", format(startDateParam, "yyyy-MM-dd"));
        }

        const response = await adminApiFetch(
          `${getApiBaseUrl()}/api/admin/activity?${params.toString()}`,
          { method: "GET" }
        );

        if (checkAdminTokenExpiration(response)) {
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch activity logs");
        }

        const data = await response.json();

        // Handle different response structures
        let logs: ActivityLog[] = [];
        let paginationInfo = {
          totalPages: 1,
          totalItems: 0,
        };

        if (data.success && data.data) {
          if (Array.isArray(data.data)) {
            logs = data.data.map(mapApiItemToActivityLog);
          } else if (data.data.logs || data.data.activities) {
            logs = (data.data.logs || data.data.activities).map(mapApiItemToActivityLog);
          } else if (data.data.items) {
            logs = data.data.items.map(mapApiItemToActivityLog);
          }

          // Handle pagination
          if (data.data.pagination) {
            paginationInfo = {
              totalPages: data.data.pagination.totalPages || data.data.pagination.total_pages || 1,
              totalItems: data.data.pagination.total || data.data.pagination.total_items || logs.length,
            };
          } else if (data.pagination) {
            paginationInfo = {
              totalPages: data.pagination.totalPages || data.pagination.total_pages || 1,
              totalItems: data.pagination.total || data.pagination.total_items || logs.length,
            };
          }
        } else if (Array.isArray(data)) {
          logs = data.map(mapApiItemToActivityLog);
        }

        setActivityLogs(logs);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        toast.error("Failed to fetch activity logs");
        setActivityLogs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchActivityLogs(currentPage, searchQuery, actionType === "all" ? "" : actionType, startDate);
  }, [currentPage, searchQuery, actionType, startDate, fetchActivityLogs]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleActionTypeChange = (value: string) => {
    setActionType(value);
    setCurrentPage(1);
  };

  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date || null);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getActionIcon = (actionType: string) => {
    const action = actionType?.toLowerCase() || "";
    if (action.includes("user")) return <User className="h-4 w-4" />;
    if (action.includes("broker") || action.includes("connection")) return <Database className="h-4 w-4" />;
    if (action.includes("order") || action.includes("trade")) return <TrendingUp className="h-4 w-4" />;
    if (action.includes("setting")) return <Settings className="h-4 w-4" />;
    if (action.includes("security") || action.includes("login")) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (actionType: string) => {
    const action = actionType?.toLowerCase() || "";
    if (action.includes("create") || action.includes("success")) return "text-green-600 dark:text-green-400";
    if (action.includes("delete") || action.includes("error")) return "text-red-600 dark:text-red-400";
    if (action.includes("update") || action.includes("modify")) return "text-blue-600 dark:text-blue-400";
    return "text-muted-foreground";
  };

  // Sort logs client-side
  const sortedLogs = [...activityLogs].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    if (sortColumn === "timestamp" || sortColumn === "createdAt") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else {
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor system-wide activity and logs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            View all system activities, user actions, and system events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Action Type Filter */}
            <Select value={actionType} onValueChange={handleActionTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="USER_CREATED">User Created</SelectItem>
                <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                <SelectItem value="BROKER_CONNECTED">Broker Connected</SelectItem>
                <SelectItem value="BROKER_DISCONNECTED">Broker Disconnected</SelectItem>
                <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                <SelectItem value="ORDER_EXECUTED">Order Executed</SelectItem>
                <SelectItem value="WATCHLIST_CREATED">Watchlist Created</SelectItem>
                <SelectItem value="WATCHLIST_UPDATED">Watchlist Updated</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="SETTINGS_UPDATED">Settings Updated</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
                {startDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDateChange(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleSort("actionType")}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3"
                      onClick={() => handleSort("log")}
                    >
                      Activity
                      {sortColumn === "log" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3"
                      onClick={() => handleSort("user")}
                    >
                      User
                      {sortColumn === "user" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3"
                      onClick={() => handleSort("timestamp")}
                    >
                      Timestamp
                      {sortColumn === "timestamp" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading activity logs...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : sortedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || actionType !== "all" || startDate
                          ? "No activity logs found matching your filters."
                          : "No activity logs found."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className={getActionColor(log.actionType || "")}>
                          {getActionIcon(log.actionType || "")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.log}</div>
                        {log.actionType && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.actionType}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="font-medium text-sm">
                              {log.user.fullname || log.user.username || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.user.email}
                            </div>
                          </div>
                        ) : log.userId ? (
                          <div className="text-sm text-muted-foreground">
                            User ID: {log.userId}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate text-sm text-muted-foreground">
                          {log.data && log.data !== "{}" ? (
                            <span title={log.data}>
                              {log.data.length > 50
                                ? `${log.data.substring(0, 50)}...`
                                : log.data}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.timestamp
                          ? format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {activityLogs.length} of {totalItems} activities
                {totalPages > 1 && (
                  <span> (Page {currentPage} of {totalPages})</span>
                )}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivity;
