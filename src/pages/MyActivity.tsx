import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
import { CalendarIcon, ChevronUp, ChevronDown, Search, MoreVertical, Volume2, Mic, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration, getApiBaseUrl } from "@/lib/api";

interface ActivityLog {
  id: string | number;
  log: string;
  data: string;
  actionType?: string;
  timestamp?: string;
  createdAt?: string;
  [key: string]: any;
}

const MyActivity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [actionType, setActionType] = useState<string>("");
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
      createdAt: item.createdAt || item.timestamp || item.date || "",
    };
  };

  // Fetch activity logs from API
  const fetchActivityLogs = useCallback(async (page: number = 1, search: string = "", action: string = "", startDateParam: string = "") => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }
      if (action) {
        params.append("actionType", action);
      }
      if (startDateParam) {
        params.append("startDate", startDateParam);
      }

      const response = await apiFetch(
        `${getApiBaseUrl()}/api/activity?${params.toString()}`,
        { method: "GET" }
      );

      if (checkTokenExpiration(response)) {
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
          // If data is an array
          logs = data.data.map(mapApiItemToActivityLog);
          paginationInfo = {
            totalPages: Math.ceil(logs.length / limit) || 1,
            totalItems: logs.length,
          };
        } else if (data.data.activities || data.data.logs || data.data.items) {
          // If data has nested array
          const items = data.data.activities || data.data.logs || data.data.items || [];
          logs = items.map(mapApiItemToActivityLog);
          paginationInfo = {
            totalPages: data.data.totalPages || data.data.pages || Math.ceil((data.data.total || items.length) / limit) || 1,
            totalItems: data.data.total || data.data.totalItems || items.length,
          };
        } else if (data.data.pagination) {
          // If pagination info is separate
          const items = Array.isArray(data.data.data) ? data.data.data : [];
          logs = items.map(mapApiItemToActivityLog);
          paginationInfo = {
            totalPages: data.data.pagination.totalPages || Math.ceil((data.data.pagination.total || items.length) / limit) || 1,
            totalItems: data.data.pagination.total || data.data.pagination.totalItems || items.length,
          };
        } else {
          // Try to extract any array from data
          const keys = Object.keys(data.data);
          const arrayKey = keys.find(key => Array.isArray(data.data[key]));
          if (arrayKey) {
            logs = data.data[arrayKey].map(mapApiItemToActivityLog);
            paginationInfo = {
              totalPages: data.data.totalPages || Math.ceil(logs.length / limit) || 1,
              totalItems: data.data.total || logs.length,
            };
          }
        }
      } else if (Array.isArray(data)) {
        // If response is directly an array
        logs = data.map(mapApiItemToActivityLog);
        paginationInfo = {
          totalPages: Math.ceil(logs.length / limit) || 1,
          totalItems: logs.length,
        };
      }

      setActivityLogs(logs);
      setTotalPages(paginationInfo.totalPages);
      setTotalItems(paginationInfo.totalItems);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch activity logs");
      setActivityLogs([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Fetch logs when filters change
  useEffect(() => {
    const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : "";
    fetchActivityLogs(currentPage, searchQuery, actionType, startDateStr);
  }, [currentPage, searchQuery, actionType, startDate, fetchActivityLogs]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="h-3 w-3 text-gray-400" />
          <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
        </div>
      );
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 text-primary" />
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Sort logs locally (if needed)
  const sortedLogs = [...activityLogs].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];
    
    if (sortColumn === "id") {
      aValue = Number(aValue);
      bValue = Number(bValue);
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
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">My Activity</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View your account activity and system logs
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="search" className="sr-only">Search logs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <Label htmlFor="actionType">Action Type</Label>
                <Select value={actionType || undefined} onValueChange={(value) => {
                  setActionType(value === "all" ? "" : value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger id="actionType" className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="WATCHLIST_CREATED">Watchlist Created</SelectItem>
                    <SelectItem value="WATCHLIST_UPDATED">Watchlist Updated</SelectItem>
                    <SelectItem value="WATCHLIST_DELETED">Watchlist Deleted</SelectItem>
                    <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                    <SelectItem value="ORDER_EXECUTED">Order Executed</SelectItem>
                    <SelectItem value="ORDER_CANCELLED">Order Cancelled</SelectItem>
                    <SelectItem value="STRATEGY_CREATED">Strategy Created</SelectItem>
                    <SelectItem value="STRATEGY_UPDATED">Strategy Updated</SelectItem>
                    <SelectItem value="BROKER_CONNECTED">Broker Connected</SelectItem>
                    <SelectItem value="BROKER_DISCONNECTED">Broker Disconnected</SelectItem>
                    <SelectItem value="SETTINGS_UPDATED">Settings Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[250px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => {
                        setStartDate(date || null);
                        setCurrentPage(1);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Activity Logs Table */}
            <div className="rounded-lg border bg-card overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center">
                            ID
                            <SortIcon column="id" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("log")}
                        >
                          <div className="flex items-center">
                            Log
                            <SortIcon column="log" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("data")}
                        >
                          <div className="flex items-center">
                            Data
                            <SortIcon column="data" />
                          </div>
                        </TableHead>
                        {sortedLogs.some(log => log.actionType) && (
                          <TableHead 
                            className="cursor-pointer select-none"
                            onClick={() => handleSort("actionType")}
                          >
                            <div className="flex items-center">
                              Action Type
                              <SortIcon column="actionType" />
                            </div>
                          </TableHead>
                        )}
                        {sortedLogs.some(log => log.timestamp || log.createdAt) && (
                          <TableHead 
                            className="cursor-pointer select-none"
                            onClick={() => handleSort("timestamp")}
                          >
                            <div className="flex items-center">
                              Timestamp
                              <SortIcon column="timestamp" />
                            </div>
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            No activity logs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedLogs.map((log) => (
                          <TableRow key={log.id} className="relative group">
                            <TableCell className="font-mono text-sm">{log.id}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{log.log}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                                  >
                                    <Mic className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <div className="font-mono text-xs text-muted-foreground truncate">
                                {log.data}
                              </div>
                            </TableCell>
                            {sortedLogs.some(l => l.actionType) && (
                              <TableCell className="text-sm">
                                {log.actionType || "-"}
                              </TableCell>
                            )}
                            {sortedLogs.some(l => l.timestamp || l.createdAt) && (
                              <TableCell className="text-sm text-muted-foreground">
                                {log.timestamp || log.createdAt 
                                  ? format(new Date(log.timestamp || log.createdAt), "PPp")
                                  : "-"}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing page {currentPage} of {totalPages} ({totalItems} total items)
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
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
                            onClick={() => handlePageChange(pageNum)}
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyActivity;

