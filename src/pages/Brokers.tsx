import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration } from "@/lib/api";

interface Broker {
  id: string;
  name: string;
  status: string;
  logo: string;
  connected: boolean;
  accountId?: string;
  balance?: string;
}

// Logo mapping for brokers - using distinct emojis/icons
const brokerLogoMap: Record<string, string> = {
  "aliceblue": "🐟",
  "angelbroking": "👼",
  "angelone": "👼",
  "dhan": "💰",
  "fyers": "🔥",
  "upstox": "📈",
  "zerodha": "⚡",
};

const Brokers = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrokers = async () => {
    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error("User not found in localStorage");
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user._id || user.userId;

      if (!userId) {
        console.error("User ID not found");
        setIsLoading(false);
        return;
      }

      const response = await apiFetch(
        `http://localhost:3000/api/brokers/dashboard/${userId}`,
        {
          method: "GET",
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch broker data");
      }

      const data = await response.json();

      // Update brokers with API data
      if (data.success && data.data) {
        // Map API response to broker format
        const apiBrokers = data.data.brokers || data.data || [];
        
        // Transform API response to Broker format
        const transformedBrokers: Broker[] = apiBrokers.map((apiBroker: any) => {
          const brokerId = apiBroker.id || apiBroker.brokerId || "";
          const brokerName = apiBroker.name || apiBroker.brokerName || "";
          
          return {
            id: brokerId,
            name: brokerName.toUpperCase(),
            status: apiBroker.status || "Not Connected",
            logo: brokerLogoMap[brokerId.toLowerCase()] || "📊",
            connected: apiBroker.connected || apiBroker.status === "Connected",
            accountId: apiBroker.accountId,
            balance: apiBroker.balance?.toString() || apiBroker.balance,
          };
        });

        setBrokers(transformedBrokers);
      } else {
        // If API doesn't return brokers, set empty array
        setBrokers([]);
      }
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to load broker settings");
      // Keep default brokers on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleRefreshBroker = () => {
    // Refetch brokers after refresh
    fetchBrokers();
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : brokers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">No brokers found</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {brokers.map((broker) => (
                  <BrokerCard
                    key={broker.id}
                    name={broker.name}
                    logo={broker.logo}
                    connected={broker.connected}
                    status={broker.status}
                    accountId={broker.accountId}
                    balance={broker.balance}
                    brokerId={broker.id}
                    onRefresh={handleRefreshBroker}
                  />
                ))}
              </div>
            )}
            <div className="mt-6 sm:mt-8 text-center text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Brokers;
