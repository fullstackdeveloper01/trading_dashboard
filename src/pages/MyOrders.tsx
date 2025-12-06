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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: number;
  symbol: string;
  inst: string;
  signal: string;
  status: string;
  order: string;
  product: string;
  price: number;
  oQty: number;
  tQty: number;
  pnl: number;
  orderId: string;
  tradeId: string;
  strategy: string;
}

const MyOrders = () => {
  const [symbol, setSymbol] = useState("");
  const [strategy, setStrategy] = useState("");
  const [productType, setProductType] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(2024, 10, 15), // November 15, 2024
    to: new Date(2024, 10, 15), // November 15, 2024
  });
  const [realisedPnL, setRealisedPnL] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
              <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage your trading orders
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-6 rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbols">Symbols</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger id="symbols">
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIFTY">NIFTY</SelectItem>
                      <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                      <SelectItem value="FINNIFTY">FINNIFTY</SelectItem>
                      <SelectItem value="SENSEX">SENSEX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategies">Strategies</Label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger id="strategies">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendulum">Pendulum</SelectItem>
                      <SelectItem value="Scalping">Scalping</SelectItem>
                      <SelectItem value="Swing">Swing</SelectItem>
                      <SelectItem value="Intraday">Intraday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">ProductType</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger id="productType">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIS">MIS</SelectItem>
                      <SelectItem value="NRML">NRML</SelectItem>
                      <SelectItem value="CNC">CNC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from && dateRange.to ? (
                          dateRange.from.getTime() === dateRange.to.getTime() ? (
                            format(dateRange.from, "d MMMM")
                          ) : (
                            <>
                              {format(dateRange.from, "d MMMM")} - {format(dateRange.to, "d MMMM")}
                            </>
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange.from || new Date()}
                        selected={
                          dateRange.from && dateRange.to
                            ? {
                                from: dateRange.from,
                                to: dateRange.to,
                              }
                            : undefined
                        }
                        onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                          setDateRange({
                            from: range?.from || null,
                            to: range?.to || null,
                          });
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="realisedPnL">Realised PnL:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="realisedPnL"
                      type="number"
                      value={realisedPnL}
                      onChange={(e) => setRealisedPnL(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <div className="h-10 w-10 rounded bg-green-100 border border-green-300"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <Button size="sm" className="bg-primary">
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg border bg-card overflow-x-auto">
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
                        onClick={() => handleSort("inst")}
                      >
                        <div className="flex items-center">
                          Inst
                          <SortIcon column="inst" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("signal")}
                      >
                        <div className="flex items-center">
                          Signal
                          <SortIcon column="signal" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon column="status" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("order")}
                      >
                        <div className="flex items-center">
                          Order
                          <SortIcon column="order" />
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
                        onClick={() => handleSort("price")}
                      >
                        <div className="flex items-center">
                          Price
                          <SortIcon column="price" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("oQty")}
                      >
                        <div className="flex items-center">
                          O-Qty
                          <SortIcon column="oQty" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("tQty")}
                      >
                        <div className="flex items-center">
                          T-Qty
                          <SortIcon column="tQty" />
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
                        onClick={() => handleSort("orderId")}
                      >
                        <div className="flex items-center">
                          OrderID
                          <SortIcon column="orderId" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("tradeId")}
                      >
                        <div className="flex items-center">
                          TradeID
                          <SortIcon column="tradeId" />
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.symbol}</TableCell>
                          <TableCell>{order.inst}</TableCell>
                          <TableCell>{order.signal}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded text-xs",
                              order.status === "Completed" ? "bg-success/10 text-success" :
                              order.status === "Pending" ? "bg-warning/10 text-warning" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>{order.order}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>{order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.oQty}</TableCell>
                          <TableCell>{order.tQty}</TableCell>
                          <TableCell className={cn(
                            order.pnl >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {order.pnl >= 0 ? "+" : ""}{order.pnl.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                          <TableCell className="font-mono text-xs">{order.tradeId}</TableCell>
                          <TableCell>{order.strategy}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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

export default MyOrders;

