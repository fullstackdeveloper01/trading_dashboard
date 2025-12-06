import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Save, Zap, Volume2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Strategy {
  id: number;
  name: string;
  quantityMultiplier: number;
  createdOn: string;
  isActive: boolean;
  isSoundEnabled: boolean;
}

const MyStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: 1,
      name: "DarkPool",
      quantityMultiplier: 1,
      createdOn: "08 Oct 2025 09:47:43 AM",
      isActive: false,
      isSoundEnabled: false,
    },
  ]);

  const handleQuantityChange = (id: number, value: number) => {
    setStrategies(
      strategies.map((strategy) =>
        strategy.id === id
          ? { ...strategy, quantityMultiplier: value }
          : strategy
      )
    );
  };

  const handleSave = (id: number) => {
    // Handle save logic
    console.log("Saving strategy:", id);
  };

  const toggleActive = (id: number) => {
    setStrategies(
      strategies.map((strategy) =>
        strategy.id === id
          ? { ...strategy, isActive: !strategy.isActive }
          : strategy
      )
    );
  };

  const toggleSound = (id: number) => {
    setStrategies(
      strategies.map((strategy) =>
        strategy.id === id
          ? { ...strategy, isSoundEnabled: !strategy.isSoundEnabled }
          : strategy
      )
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
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">My Strategies</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your trading strategies and settings
              </p>
            </div>

            <div className="space-y-6">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Strategy Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Strategy
                      </Label>
                      <div className="text-lg font-semibold">{strategy.name}</div>
                    </div>

                    {/* Quantity Multiplier */}
                    <div className="space-y-2">
                      <Label htmlFor={`qty-${strategy.id}`} className="text-sm font-medium text-muted-foreground">
                        Quantity Multiplier
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`qty-${strategy.id}`}
                          type="number"
                          value={strategy.quantityMultiplier}
                          onChange={(e) =>
                            handleQuantityChange(strategy.id, Number(e.target.value))
                          }
                          className="w-20"
                          min="1"
                        />
                        <Button
                          size="icon"
                          className="bg-success text-success-foreground hover:bg-success/90 h-10 w-10"
                          onClick={() => handleSave(strategy.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Created On */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created On
                      </Label>
                      <div className="text-sm">{strategy.createdOn}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-lg bg-gray-800 text-white hover:bg-gray-700",
                        strategy.isActive && "bg-primary hover:bg-primary/90"
                      )}
                      onClick={() => toggleActive(strategy.id)}
                      title={strategy.isActive ? "Disable Strategy" : "Enable Strategy"}
                    >
                      <Zap className={cn("h-5 w-5", strategy.isActive && "text-white")} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-lg bg-gray-800 text-white hover:bg-gray-700",
                        strategy.isSoundEnabled && "bg-primary hover:bg-primary/90"
                      )}
                      onClick={() => toggleSound(strategy.id)}
                      title={strategy.isSoundEnabled ? "Disable Sound" : "Enable Sound"}
                    >
                      <Volume2 className={cn("h-5 w-5", strategy.isSoundEnabled && "text-white")} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                      title="More Options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}

              {strategies.length === 0 && (
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    No strategies found. Create your first strategy to get started.
                  </div>
                </Card>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
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

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyStrategies;

