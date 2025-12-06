import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2, Play, TrendingUp, BarChart2 } from "lucide-react";
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

const watchlistData = [
  {
    id: 1,
    symbol: "NIFTY-NIFTY B",
    badges: ["OPTION", "INFOTECH", "BANK", "FII"],
    quantity: "Qty: 75x2 + 150",
    exchange: "NFO",
    stoploss: "0 NA",
    target: "0 NA",
    ordertype: "MARKET",
    product: "MIS",
    strategy: "Pendulum",
  },
  {
    id: 2,
    symbol: "NIFTY-NIFTY B",
    badges: ["OPTION", "INFOTECH", "BANK", "FII"],
    quantity: "Qty: 75x2 + 150",
    exchange: "NFO",
    stoploss: "0 NA",
    target: "0 NA",
    ordertype: "MARKET",
    product: "MIS",
    strategy: "Pendulum",
  },
  {
    id: 3,
    symbol: "NIFTY-NIFTY B",
    badges: ["OPTION", "INFOTECH", "BANK", "CE"],
    quantity: "Qty: 75x2 + 150",
    exchange: "NFO",
    stoploss: "0 NA",
    target: "0 NA",
    ordertype: "MARKET",
    product: "MIS",
    strategy: "Pendulum",
  },
  {
    id: 4,
    symbol: "NIFTY-NIFTY B",
    badges: ["OPTION", "INFOTECH", "BANK", "CE"],
    quantity: "Qty: 75x1 + 75",
    exchange: "NFO",
    stoploss: "0 NA",
    target: "0 NA",
    ordertype: "MARKET",
    product: "MIS",
    strategy: "Pendulum",
  },
  {
    id: 5,
    symbol: "NIFTY-NIFTY B",
    badges: ["OPTION", "INFOTECH", "BANK", "CE"],
    quantity: "Qty: 75x1 + 75",
    exchange: "NFO",
    stoploss: "0 NA",
    target: "0 NA",
    ordertype: "MARKET",
    product: "MIS",
    strategy: "Pendulum",
  },
];

const Trades = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                  Administrator Watchlist
                </div>
                <Button size="sm" className="bg-primary">
                  My Watchlist
                </Button>
              </div>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
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
                  {watchlistData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">{item.symbol}</div>
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
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
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
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
                          >
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                          >
                            <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="border-t p-4">
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

export default Trades;
