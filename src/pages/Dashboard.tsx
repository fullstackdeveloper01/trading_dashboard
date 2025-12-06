import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MonthlyTradesChart } from "@/components/dashboard/MonthlyTradesChart";
import { WinLossOrders } from "@/components/dashboard/WinLossOrders";
import { TradingSummary } from "@/components/dashboard/TradingSummary";
import { StrategyPerformance } from "@/components/dashboard/StrategyPerformance";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { TrendingUp, Target, BarChart3 } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Top Metrics */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <MetricCard icon={TrendingUp} value="0" label="Trades Today" />
              <MetricCard icon={Target} value="0" label="Positions Today" />
              <MetricCard icon={BarChart3} value="0" label="Trades Today" />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <MonthlyTradesChart />
                <PerformanceChart />
              </div>

              {/* Right Column - Stats */}
              <div className="space-y-4 sm:space-y-6">
                <WinLossOrders />
                <TradingSummary />
              </div>
            </div>

            {/* Strategy Performance */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <StrategyPerformance title="Strategies My Performance" />
              <StrategyPerformance title="Strategies Overall Performance" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
