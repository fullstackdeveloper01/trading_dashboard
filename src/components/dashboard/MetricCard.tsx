import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  iconColor?: string;
}

export const MetricCard = ({ icon: Icon, value, label, iconColor = "text-primary" }: MetricCardProps) => {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${iconColor}`} />
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold">{value}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
};
