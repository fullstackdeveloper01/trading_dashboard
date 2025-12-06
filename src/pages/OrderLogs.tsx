import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderLog {
  id: number;
  symbol: string;
  inst: string;
  signal: string;
  source: string;
  type: string;
  inputPrice: number;
  qty: number;
  stag: string;
  created: string;
  message: string;
}

const OrderLogs = () => {
  const [symbol, setSymbol] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(2025, 10, 15, 0, 0, 0), // November 15, 2025 12:00 AM
    to: new Date(2025, 10, 15, 23, 59, 59), // November 15, 2025 11:59 PM
  });
  const [orderLogs, setOrderLogs] = useState<OrderLog[]>([
    {
      id: 1,
      symbol: "",
      inst: "",
      signal: "COVER",
      source: "",
      type: "",
      inputPrice: 0,
      qty: 0,
      stag: "",
      created: "15 Nov 2025 08:33:54 PM",
      message: "Internal Error: Expiry must h",
    },
  ]);
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

  const getSignalVariant = (signal: string) => {
    const upperSignal = signal.toUpperCase();
    if (upperSignal === "BUY" || upperSignal === "COVER") {
      return "bg-success text-success-foreground";
    } else if (upperSignal === "SELL" || upperSignal === "SHORT") {
      return "bg-destructive text-destructive-foreground";
    }
    return "bg-muted text-muted-foreground";
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
              <h1 className="text-2xl sm:text-3xl font-bold">Order Logs</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and track your order execution logs
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="symbols">Symbols</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger id="symbols" className="w-full sm:w-[200px]">
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

              <div className="w-full sm:w-auto">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        dateRange.from.getTime() === dateRange.to.getTime() ? (
                          <>
                            {format(dateRange.from, "d MMMM h:mm a")} - {format(dateRange.to, "h:mm a")}
                          </>
                        ) : (
                          <>
                            {format(dateRange.from, "d MMMM h:mm a")} - {format(dateRange.to, "d MMMM h:mm a")}
                          </>
                        )
                      ) : (
                        <span>Pick a date range</span>
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
            </div>

            {/* Order Logs Table */}
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
                        onClick={() => handleSort("source")}
                      >
                        <div className="flex items-center">
                          Source
                          <SortIcon column="source" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          <SortIcon column="type" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("inputPrice")}
                      >
                        <div className="flex items-center">
                          Input Price
                          <SortIcon column="inputPrice" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("qty")}
                      >
                        <div className="flex items-center">
                          Qty
                          <SortIcon column="qty" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("stag")}
                      >
                        <div className="flex items-center">
                          Stag
                          <SortIcon column="stag" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("created")}
                      >
                        <div className="flex items-center">
                          Created
                          <SortIcon column="created" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("message")}
                      >
                        <div className="flex items-center">
                          Message
                          <SortIcon column="message" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orderLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.symbol || "-"}</TableCell>
                          <TableCell>{log.inst || "-"}</TableCell>
                          <TableCell>
                            {log.signal ? (
                              <span className={cn(
                                "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                                getSignalVariant(log.signal)
                              )}>
                                {log.signal}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{log.source || "-"}</TableCell>
                          <TableCell>{log.type || "-"}</TableCell>
                          <TableCell>{log.inputPrice}</TableCell>
                          <TableCell>{log.qty}</TableCell>
                          <TableCell>{log.stag || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.created}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {log.message || "-"}
                          </TableCell>
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

export default OrderLogs;

