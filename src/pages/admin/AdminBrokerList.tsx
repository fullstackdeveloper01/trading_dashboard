import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Loader2, Database, User } from "lucide-react";
import { toast } from "sonner";
import { adminApiFetch, checkAdminTokenExpiration } from "@/lib/adminApi";
import { getApiBaseUrl } from "@/lib/api";
import { format } from "date-fns";

interface UserInfo {
  id: string;
  email: string;
  username: string;
  fullname: string;
}

interface BrokerSession {
  id: string;
  userId: string;
  user: UserInfo;
  brokerName: string;
  brokerDisplayName: string;
  isActive: boolean;
  accountNumber: string | null;
  accountName: string | null;
  lastUsed: string;
  loginTime: string;
  expiresAt: string | null;
  status: string;
}

const AdminBrokerList = () => {
  const [brokers, setBrokers] = useState<BrokerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchBrokers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all broker sessions from admin API
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append("search", search);
      }
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      const response = await adminApiFetch(
        `${getApiBaseUrl()}/api/admin/brokers?${queryParams.toString()}`,
        { method: "GET" }
      );

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const brokerSessions = data.data.brokerSessions || [];
          setBrokers(brokerSessions);
          
          if (data.data.pagination) {
            setPagination(data.data.pagination);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to fetch brokers");
      }
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to fetch brokers");
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Broker List</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all broker connections
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brokers</CardTitle>
          <CardDescription>
            All broker connections across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search brokers by name or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Brokers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Expires At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading brokers...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : brokers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? "No broker connections found matching your search."
                          : "No broker connections found."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  brokers.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell>
                        <div className="font-medium">
                          {broker.brokerDisplayName || broker.brokerName?.toUpperCase() || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {broker.brokerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">
                              {broker.user?.fullname || broker.user?.username || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {broker.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={broker.isActive && broker.status === "active" ? "default" : "secondary"}
                        >
                          {broker.isActive && broker.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {broker.accountNumber || (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {broker.lastUsed
                          ? format(new Date(broker.lastUsed), "MMM dd, yyyy HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {broker.loginTime
                          ? format(new Date(broker.loginTime), "MMM dd, yyyy HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {broker.expiresAt
                          ? format(new Date(broker.expiresAt), "MMM dd, yyyy HH:mm")
                          : (
                            <span className="text-muted-foreground text-sm">Never</span>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {brokers.length} of {pagination.total} broker connections
              {pagination.totalPages > 1 && (
                <span> (Page {pagination.page} of {pagination.totalPages})</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrokerList;

