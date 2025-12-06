import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RefreshCw, Globe, User, ChevronUp, ChevronDown, MoreVertical, Zap, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  id: number;
  symbol: string;
  product: string;
  avgPrice: number;
  sl: number;
  ltp: number;
  tgt: number;
  position: number;
  pnl: number;
  strategy: string;
  fetchTime: string;
}

type ProductMode = "MIS" | "CNC" | "NRML";

const Positions = () => {
  const [symbol, setSymbol] = useState("");
  const [selectedMode, setSelectedMode] = useState<ProductMode>("MIS");
  const [positions, setPositions] = useState<Position[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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

  // Summary calculations
  const summary = {
    activeMTM: 0,
    cumulative: 0.0,
    realizedMTM: 0,
    activeTrades: 0,
    longPosition: 0,
    shortPosition: 0,
    buy: 0,
    sell: 0,
    short: 0,
    cover: 0,
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
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">Positions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage your trading positions
              </p>
            </div>

            {/* Top Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <Label htmlFor="symbols" className="sr-only">Symbols</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger id="symbols" className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Symbols" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIFTY">NIFTY</SelectItem>
                      <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                      <SelectItem value="FINNIFTY">FINNIFTY</SelectItem>
                      <SelectItem value="SENSEX">SENSEX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                  Refresh Positions
                </Button>
              </div>

              {/* Mode Selection */}
              <div className="flex gap-2">
                <Button
                  variant={selectedMode === "MIS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMode("MIS")}
                  className={cn(
                    selectedMode === "MIS" && "bg-primary text-primary-foreground"
                  )}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  MIS
                </Button>
                <Button
                  variant={selectedMode === "CNC" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMode("CNC")}
                  className={cn(
                    selectedMode === "CNC" && "bg-primary text-primary-foreground"
                  )}
                >
                  <User className="mr-2 h-4 w-4" />
                  CNC
                </Button>
                <Button
                  variant={selectedMode === "NRML" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMode("NRML")}
                  className={cn(
                    selectedMode === "NRML" && "bg-primary text-primary-foreground"
                  )}
                >
                  <User className="mr-2 h-4 w-4" />
                  NRML
                </Button>
              </div>
            </div>

            {/* Positions Table */}
            <div className="mb-6 rounded-lg border bg-card overflow-x-auto">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("symbol")}
                      >
                        <div className="flex items-center">
                          Symbol
                          <SortIcon column="symbol" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("product")}
                      >
                        <div className="flex items-center">
                          Product
                          <SortIcon column="product" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("avgPrice")}
                      >
                        <div className="flex items-center">
                          AvgPrice
                          <SortIcon column="avgPrice" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("sl")}
                      >
                        <div className="flex items-center">
                          SL | LTP | TGT
                          <SortIcon column="sl" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("position")}
                      >
                        <div className="flex items-center">
                          Position
                          <SortIcon column="position" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("pnl")}
                      >
                        <div className="flex items-center">
                          PnL
                          <SortIcon column="pnl" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("strategy")}
                      >
                        <div className="flex items-center">
                          Strategy
                          <SortIcon column="strategy" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("fetchTime")}
                      >
                        <div className="flex items-center">
                          Fetch Time
                          <SortIcon column="fetchTime" />
                        </div>
                      </TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground relative">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>{position.product}</TableCell>
                          <TableCell>{position.avgPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span>SL: {position.sl.toFixed(2)}</span>
                              <span>LTP: {position.ltp.toFixed(2)}</span>
                              <span>TGT: {position.tgt.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            position.position > 0 ? "text-success" : 
                            position.position < 0 ? "text-destructive" : ""
                          )}>
                            {position.position > 0 ? "+" : ""}{position.position}
                          </TableCell>
                          <TableCell className={cn(
                            position.pnl >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {position.pnl >= 0 ? "+" : ""}{position.pnl.toFixed(2)}
                          </TableCell>
                          <TableCell>{position.strategy}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {position.fetchTime}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mb-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            {/* Summary Bar */}
            <div className="rounded-lg bg-primary p-4 text-primary-foreground">
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4 text-center">
                <div>
                  <div className="text-xs opacity-80 mb-1">Active MTM</div>
                  <div className="text-sm font-semibold">{summary.activeMTM}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Cumulative</div>
                  <div className="text-sm font-semibold">{summary.cumulative.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Realized MTM</div>
                  <div className="text-sm font-semibold">{summary.realizedMTM}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Active Trades</div>
                  <div className="text-sm font-semibold">{summary.activeTrades}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Long Position</div>
                  <div className="text-sm font-semibold">{summary.longPosition}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Short Position</div>
                  <div className="text-sm font-semibold">{summary.shortPosition}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Buy</div>
                  <div className="text-sm font-semibold">{summary.buy}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Sell</div>
                  <div className="text-sm font-semibold">{summary.sell}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Short</div>
                  <div className="text-sm font-semibold">{summary.short}</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Cover</div>
                  <div className="text-sm font-semibold">{summary.cover}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Positions;

