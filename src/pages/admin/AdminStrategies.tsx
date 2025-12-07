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
import { Search, Loader2, Brain, Plus, Edit, Trash2 } from "lucide-react";
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

interface Strategy {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  user: UserInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchStrategies = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append("search", search);
      }
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      const response = await adminApiFetch(
        `${getApiBaseUrl()}/api/admin/strategies?${queryParams.toString()}`,
        { method: "GET" }
      );

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const strategiesList = data.data.strategies || data.data || [];
          setStrategies(strategiesList);
          
          if (data.data.pagination) {
            setPagination(data.data.pagination);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to fetch strategies");
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
      toast.error("Failed to fetch strategies");
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strategies Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all user strategies
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Strategy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strategies List</CardTitle>
          <CardDescription>
            A list of all strategies created by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search strategies by name, user..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : strategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No strategies found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Strategy Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {strategies.map((strategy) => (
                        <TableRow key={strategy.id}>
                          <TableCell className="font-medium">
                            {strategy.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {strategy.description || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {strategy.user?.fullname || strategy.user?.username || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {strategy.user?.email || ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={strategy.isActive ? "default" : "secondary"}
                              className={
                                strategy.isActive
                                  ? "bg-success text-white"
                                  : "bg-muted"
                              }
                            >
                              {strategy.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {strategy.createdAt
                              ? format(new Date(strategy.createdAt), "MMM dd, yyyy HH:mm")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {strategy.updatedAt
                              ? format(new Date(strategy.updatedAt), "MMM dd, yyyy HH:mm")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit strategy"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                title="Delete strategy"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total strategies)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStrategies;


