import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "1", orders: 2 },
  { month: "2", orders: 3 },
  { month: "3", orders: 1 },
  { month: "4", orders: 4 },
  { month: "5", orders: 2 },
];

export const MonthlyTradesChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Monthly Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200} className="min-h-[200px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">avg orders per month</p>
      </CardContent>
    </Card>
  );
};
