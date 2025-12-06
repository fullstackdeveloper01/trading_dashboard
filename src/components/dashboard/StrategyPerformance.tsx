import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyPerformanceProps {
  title: string;
}

export const StrategyPerformance = ({ title }: StrategyPerformanceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-center pb-4 sm:pb-6">
        <div className="w-full h-24 sm:h-32 bg-success rounded-lg flex items-end justify-center pb-3 sm:pb-4">
          <span className="text-white text-xs sm:text-sm">Pendulum</span>
        </div>
      </CardContent>
    </Card>
  );
};
