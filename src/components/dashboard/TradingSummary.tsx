import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export const TradingSummary = () => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <div className="text-xl sm:text-2xl font-bold">₹0</div>
          <p className="text-xs sm:text-sm text-muted-foreground">Total Trading</p>
          <p className="text-xs text-success mt-1">+2.5% from last month</p>
        </div>
        
        <div>
          <div className="text-xl sm:text-2xl font-bold">₹0.00</div>
          <p className="text-xs sm:text-sm text-muted-foreground">Broker Balance</p>
        </div>
        
        <Button variant="outline" className="w-full gap-2 text-sm">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          Broker Settings
        </Button>
      </CardContent>
    </Card>
  );
};
