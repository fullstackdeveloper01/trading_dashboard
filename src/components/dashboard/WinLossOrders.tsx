import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, XSquare } from "lucide-react";

export const WinLossOrders = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">WinLoss Orders</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
        <div className="text-3xl sm:text-4xl font-bold">0</div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Orders</p>
        
        <div className="w-full mt-6 sm:mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm">Win</span>
            </div>
            <span className="text-xs sm:text-sm font-medium">0</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XSquare className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
              <span className="text-xs sm:text-sm">Loss</span>
            </div>
            <span className="text-xs sm:text-sm font-medium">0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
