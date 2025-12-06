import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2, Play, TrendingUp, BarChart2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AddSymbolDialog } from "@/components/watchlist/AddSymbolDialog";

interface WatchlistItem {
  id: string;
  exchangeSymbol: string;
  mappingName: string;
  badges: string[];
  quantity: string;
  exchange: string;
  stoploss: string;
  target: string;
  ordertype: string;
  product: string;
  strategy: string;
  tgt: number | null;
  sl: number | null;
  lotSize: number;
  qtyMultiplier: number;
  tgtType?: string;
  slType?: string;
  productType?: string;
  orderType?: string;
  isActive?: boolean;
}

// Helper function to map API response to WatchlistItem
const mapApiItemToWatchlistItem = (item: any): WatchlistItem => {
  const calculatedQty = (item.lotSize || 0) * (item.qtyMultiplier || 1);
  const quantity = `Qty: ${item.lotSize || 0}x${item.qtyMultiplier || 1} + ${calculatedQty}`;
  
  // Format stoploss and target
  const stoploss = item.stopLoss !== null && item.stopLoss !== undefined
    ? `${item.stopLoss} ${item.slType || "Points"}`
    : "0 NA";
  const target = item.target !== null && item.target !== undefined
    ? `${item.target} ${item.tgtType || "Points"}`
    : "0 NA";

  // Generate badges from exchangeSymbol (you can customize this logic)
  const badges = ["OPTION"]; // Default badge, you can add more logic based on symbol

  return {
    id: item.id || item._id || "",
    exchangeSymbol: item.exchangeSymbol || "",
    mappingName: item.mappingName || "",
    badges,
    quantity,
    exchange: "NFO", // You might want to get this from API
    stoploss,
    target,
    ordertype: item.orderType || "NA",
    product: item.productType || "MIS",
    strategy: item.strategy || "",
    tgt: item.target || null,
    sl: item.stopLoss || null,
    lotSize: item.lotSize || 0,
    qtyMultiplier: item.qtyMultiplier || 1,
    tgtType: item.tgtType,
    slType: item.slType,
    productType: item.productType,
    orderType: item.orderType,
    isActive: item.isActive,
  };
};

const Watchlist = () => {
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([]);
  const [addSymbolOpen, setAddSymbolOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  
  // Action states
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<string | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState<string | null>(null);
  const [executeFormData, setExecuteFormData] = useState({
    action: "BUY",
    brokerName: "",
  });
  const [brokers, setBrokers] = useState<Array<{ id: string; name: string; connected: boolean }>>([]);

  const fetchWatchlist = useCallback(async (page: number = 1, searchTerm: string = "") => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await apiFetch(
        `http://localhost:3000/api/watchlist?${params.toString()}`,
        {
          method: "GET",
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle paginated response
        if (Array.isArray(data.data)) {
          // If data is an array, map it directly
          const mappedItems = data.data.map(mapApiItemToWatchlistItem);
          setWatchlistData(mappedItems);
          
          // Calculate total pages from total count if available
          if (data.total !== undefined) {
            setTotalItems(data.total);
            setTotalPages(Math.ceil(data.total / limit));
          } else {
            setTotalPages(1);
          }
        } else if (data.data.items && Array.isArray(data.data.items)) {
          // If data has items array (paginated response)
          const mappedItems = data.data.items.map(mapApiItemToWatchlistItem);
          setWatchlistData(mappedItems);
          setTotalItems(data.data.total || data.data.count || mappedItems.length);
          setTotalPages(data.data.totalPages || Math.ceil((data.data.total || mappedItems.length) / limit));
        } else {
          // Fallback: treat as single item
          setWatchlistData([mapApiItemToWatchlistItem(data.data)]);
          setTotalPages(1);
          setTotalItems(1);
        }
      } else {
        setWatchlistData([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to fetch watchlist. Please try again.");
      setWatchlistData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch watchlist on mount and when search/page changes
  useEffect(() => {
    fetchWatchlist(currentPage, search);
  }, [currentPage, search, fetchWatchlist]);

  const handleAddSymbol = () => {
    // Refresh watchlist after adding new symbol
    fetchWatchlist(currentPage, search);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fetch brokers for execute order dialog
  const fetchBrokers = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const userId = user.id || user._id || user.userId;
      if (!userId) return;

      const response = await apiFetch(
        `http://localhost:3000/api/brokers/dashboard/${userId}`,
        { method: "GET" }
      );

      if (checkTokenExpiration(response)) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const apiBrokers = data.data.brokers || data.data || [];
          const connectedBrokers = apiBrokers
            .filter((b: any) => b.connected || b.status === "Connected")
            .map((b: any) => ({
              id: (b.id || b.brokerId || "").toLowerCase(),
              name: (b.name || b.brokerName || "").toUpperCase(),
              connected: b.connected || b.status === "Connected",
            }));
          setBrokers(connectedBrokers);
        }
      }
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  }, []);

  // Handle duplicate watchlist item
  const handleDuplicate = async (itemId: string) => {
    setIsDuplicating(itemId);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/watchlist/${itemId}/duplicate`,
        { method: "POST" }
      );

      if (checkTokenExpiration(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to duplicate watchlist item");
      }

      if (data.success) {
        toast.success(data.message || "Watchlist item duplicated successfully");
        // Refresh watchlist
        fetchWatchlist(currentPage, search);
      } else {
        throw new Error(data.message || "Failed to duplicate watchlist item");
      }
    } catch (error) {
      console.error("Duplicate failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to duplicate watchlist item");
    } finally {
      setIsDuplicating(null);
    }
  };

  // Handle execute order
  const handleExecuteOrder = async () => {
    if (!selectedItemId || !executeFormData.brokerName) {
      toast.error("Please select a broker");
      return;
    }

    setIsExecuting(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/watchlist/${selectedItemId}/execute`,
        {
          method: "POST",
          body: JSON.stringify({
            action: executeFormData.action,
            brokerName: executeFormData.brokerName.toLowerCase(),
          }),
        }
      );

      if (checkTokenExpiration(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to execute order");
      }

      if (data.success) {
        toast.success(data.message || "Order executed successfully");
        setExecuteDialogOpen(false);
        setExecuteFormData({ action: "BUY", brokerName: "" });
        setSelectedItemId("");
      } else {
        throw new Error(data.message || "Failed to execute order");
      }
    } catch (error) {
      console.error("Execute order failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to execute order");
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle get analytics
  const handleGetAnalytics = async (itemId: string) => {
    setIsLoadingAnalytics(itemId);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/watchlist/${itemId}/analytics`,
        { method: "GET" }
      );

      if (checkTokenExpiration(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      if (data.success) {
        // Display analytics data (you can create a dialog for this)
        console.log("Analytics data:", data.data);
        toast.success("Analytics data loaded");
        // TODO: Show analytics in a dialog or modal
      } else {
        throw new Error(data.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Get analytics failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch analytics");
    } finally {
      setIsLoadingAnalytics(null);
    }
  };

  // Handle get chart data
  const handleGetChartData = async (itemId: string) => {
    setIsLoadingChart(itemId);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Default to 1 month ago
      const startDateStr = startDate.toISOString().split("T")[0];

      const response = await apiFetch(
        `http://localhost:3000/api/watchlist/${itemId}/chart?startDate=${startDateStr}`,
        { method: "GET" }
      );

      if (checkTokenExpiration(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch chart data");
      }

      if (data.success) {
        // Display chart data (you can create a dialog or chart component for this)
        console.log("Chart data:", data.data);
        toast.success("Chart data loaded");
        // TODO: Show chart in a dialog or modal
      } else {
        throw new Error(data.message || "Failed to fetch chart data");
      }
    } catch (error) {
      console.error("Get chart data failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch chart data");
    } finally {
      setIsLoadingChart(null);
    }
  };

  // Open execute dialog
  const openExecuteDialog = (itemId: string) => {
    setSelectedItemId(itemId);
    setExecuteDialogOpen(true);
    fetchBrokers();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 sm:mb-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                    Administrator Watchlist
                  </div>
                  <Button size="sm" className="bg-primary">
                    My Watchlist
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => setAddSymbolOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </div>
              
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by symbol..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">SYMBOL</TableHead>
                      <TableHead className="hidden sm:table-cell">QUANTITY</TableHead>
                      <TableHead className="hidden md:table-cell">EXCHANGE</TableHead>
                      <TableHead className="hidden lg:table-cell">STOPLOSS</TableHead>
                      <TableHead className="hidden lg:table-cell">TARGET</TableHead>
                      <TableHead className="hidden md:table-cell">ORDERTYPE</TableHead>
                      <TableHead className="hidden sm:table-cell">PRODUCT</TableHead>
                      <TableHead className="hidden lg:table-cell">STRATEGY</TableHead>
                      <TableHead className="min-w-[200px]">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                          <p className="mt-2 text-sm text-muted-foreground">Loading watchlist...</p>
                        </TableCell>
                      </TableRow>
                    ) : watchlistData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            {search ? "No watchlist items found matching your search." : "No watchlist items found. Add your first symbol to get started."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      watchlistData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="font-medium">{item.mappingName}</div>
                            <div className="flex flex-wrap gap-1">
                              {item.badges.map((badge, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-warning/20 text-warning hover:bg-warning/30"
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-warning hidden md:table-cell">
                          {item.exchange}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell">
                          {item.stoploss}
                        </TableCell>
                        <TableCell className="text-primary hidden lg:table-cell">
                          {item.target}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {item.ordertype}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                          {item.product}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell">
                          {item.strategy}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-success/10 text-success hover:bg-success/20"
                              onClick={() => handleDuplicate(item.id)}
                              disabled={isDuplicating === item.id}
                              title="Duplicate"
                            >
                              {isDuplicating === item.id ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-warning/10 text-warning hover:bg-warning/20"
                              onClick={() => openExecuteDialog(item.id)}
                              title="Execute Order"
                            >
                              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
                              onClick={() => handleGetAnalytics(item.id)}
                              disabled={isLoadingAnalytics === item.id}
                              title="View Analytics"
                            >
                              {isLoadingAnalytics === item.id ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                              onClick={() => handleGetChartData(item.id)}
                              disabled={isLoadingChart === item.id}
                              title="View Chart"
                            >
                              {isLoadingChart === item.id ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isLoading && watchlistData.length > 0 && (
                <div className="border-t p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} items
                    </p>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <PaginationPrevious />
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                            <Button
                              variant={currentPage === pageNum ? "default" : "ghost"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          <PaginationNext />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>

      {/* Add Symbol Dialog */}
      <AddSymbolDialog
        open={addSymbolOpen}
        onOpenChange={setAddSymbolOpen}
        onSave={handleAddSymbol}
      />

      {/* Execute Order Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Execute Order</DialogTitle>
            <DialogDescription>
              Select the action and broker to execute the order for this watchlist item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={executeFormData.action}
                onValueChange={(value) =>
                  setExecuteFormData({ ...executeFormData, action: value })
                }
                disabled={isExecuting}
              >
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerName">Broker *</Label>
              <Select
                value={executeFormData.brokerName}
                onValueChange={(value) =>
                  setExecuteFormData({ ...executeFormData, brokerName: value })
                }
                disabled={isExecuting}
              >
                <SelectTrigger id="brokerName">
                  <SelectValue placeholder="Select a broker" />
                </SelectTrigger>
                <SelectContent>
                  {brokers.length === 0 ? (
                    <SelectItem value="" disabled>
                      No connected brokers available
                    </SelectItem>
                  ) : (
                    brokers.map((broker) => (
                      <SelectItem key={broker.id} value={broker.id}>
                        {broker.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {brokers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Please connect a broker first from the Broker Settings page.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExecuteDialogOpen(false);
                setExecuteFormData({ action: "BUY", brokerName: "" });
                setSelectedItemId("");
              }}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteOrder}
              disabled={isExecuting || !executeFormData.brokerName}
              className="bg-primary"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                "Execute Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Watchlist;

