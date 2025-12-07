import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Code, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration, getApiBaseUrl } from "@/lib/api";
import { AngelOneLoginDialog } from "./AngelOneLoginDialog";
import { AliceBlueLoginDialog } from "./AliceBlueLoginDialog";
import { DhanLoginDialog } from "./DhanLoginDialog";
import { FyersLoginDialog } from "./FyersLoginDialog";
import { UpstoxLoginDialog } from "./UpstoxLoginDialog";
import { ZerodhaLoginDialog } from "./ZerodhaLoginDialog";
import { cn } from "@/lib/utils";

interface BrokerCardProps {
  name: string;
  logo: React.ReactNode;
  connected: boolean;
  accountId?: string;
  balance?: string;
  status: string;
  brokerId?: string;
  onRefresh?: () => void;
}

export const BrokerCard = ({ name, logo, connected, accountId, balance, status, brokerId, onRefresh }: BrokerCardProps) => {
  const [isConnected, setIsConnected] = useState(connected);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Normalize broker ID for comparison (case-insensitive)
  const normalizedBrokerId = brokerId?.toLowerCase() || "";
  const normalizedName = name?.toLowerCase() || "";

  // Function to determine broker type from both ID and name
  const getBrokerType = (): string | null => {
    // Check by broker ID first
    if (normalizedBrokerId) {
      if (normalizedBrokerId === "angelbroking" || normalizedBrokerId === "angelone" || normalizedBrokerId.includes("angel")) {
        return "angelone";
      }
      if (normalizedBrokerId === "aliceblue" || normalizedBrokerId.includes("alice")) {
        return "aliceblue";
      }
      if (normalizedBrokerId === "dhan" || normalizedBrokerId.includes("dhan")) {
        return "dhan";
      }
      if (normalizedBrokerId === "fyers" || normalizedBrokerId.includes("fyers")) {
        return "fyers";
      }
      if (normalizedBrokerId === "upstox" || normalizedBrokerId.includes("upstox")) {
        return "upstox";
      }
      if (normalizedBrokerId === "zerodha" || normalizedBrokerId.includes("zerodha")) {
        return "zerodha";
      }
    }
    
    // Fallback: Check by name if ID doesn't match
    if (normalizedName) {
      if (normalizedName.includes("angel") && !normalizedName.includes("alice")) {
        return "angelone";
      }
      if (normalizedName.includes("alice")) {
        return "aliceblue";
      }
      if (normalizedName.includes("dhan")) {
        return "dhan";
      }
      if (normalizedName.includes("fyers")) {
        return "fyers";
      }
      if (normalizedName.includes("upstox")) {
        return "upstox";
      }
      if (normalizedName.includes("zerodha")) {
        return "zerodha";
      }
    }
    
    return null;
  };

  const brokerType = getBrokerType();

  // Debug: Log broker information
  useEffect(() => {
    console.log("BrokerCard mounted/updated:", {
      brokerId,
      normalizedBrokerId,
      name,
      normalizedName,
      brokerType,
      connected,
    });
  }, [brokerId, normalizedBrokerId, name, normalizedName, brokerType, connected]);

  // Map broker IDs to API format
  const getBrokerApiId = (id?: string) => {
    const brokerMap: Record<string, string> = {
      "angelbroking": "angelone",
      "angelone": "angelone",
      "aliceblue": "aliceblue",
      "dhan": "dhan",
      "fyers": "fyers",
      "upstox": "upstox",
      "zerodha": "zerodha",
    };
    return brokerMap[id?.toLowerCase() || ""] || id;
  };

  const handleToggle = async (checked: boolean) => {
    if (!brokerId) {
      toast.error("Broker ID not found");
      return;
    }

    setIsToggling(true);

    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user._id || user.userId;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const brokerApiId = getBrokerApiId(brokerId);

      const response = await apiFetch(
        `${getApiBaseUrl()}/api/brokers/toggle/${userId}/${brokerApiId}`,
        {
          method: "PUT",
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle broker connection");
      }

      if (data.success) {
        // Update local state
        setIsConnected(checked);
        toast.success(data.message || `Broker ${checked ? "connected" : "disconnected"} successfully`);
        
        // Call parent refresh callback to reload broker list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || "Failed to toggle broker connection");
      }
    } catch (error) {
      console.error("Toggle broker error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to toggle broker connection");
      // Revert the state change on error
      setIsConnected(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRefresh = async () => {
    if (!brokerId) {
      toast.error("Broker ID not found");
      return;
    }

    setIsRefreshing(true);

    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user._id || user.userId;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const brokerApiId = getBrokerApiId(brokerId);

      const response = await apiFetch(
        `${getApiBaseUrl()}/api/brokers/refresh/${userId}/${brokerApiId}`,
        {
          method: "POST",
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to refresh broker connection");
      }

      if (data.success) {
        toast.success(data.message || "Broker connection refreshed successfully");
        
        // Update local state if data is returned
        if (data.data) {
          if (data.data.connected !== undefined) {
            setIsConnected(data.data.connected);
          }
          if (data.data.status) {
            // Status update would be handled by parent component
          }
        }

        // Call parent refresh callback to reload broker list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || "Failed to refresh broker connection");
      }
    } catch (error) {
      console.error("Refresh broker error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh broker connection");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Logo Section */}
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-primary/10 text-2xl sm:text-3xl flex-shrink-0">
          {logo}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">{name}</h3>
              {isConnected ? (
                <>
                  {accountId && (
                    <p className="text-sm text-muted-foreground">
                      {accountId}
                    </p>
                  )}
                  {balance !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Balance: {balance}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="default" className="bg-success text-white">
                      {status}
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      title="Refresh connection"
                    >
                      <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {status}
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-primary"
                    onClick={() => {
                      // Debug logging
                      console.log("Login button clicked:", { 
                        brokerId, 
                        normalizedBrokerId, 
                        name,
                        normalizedName,
                        brokerType 
                      });
                      
                      // Check if broker has a login dialog implemented
                      if (brokerType) {
                        console.log("Opening login dialog for:", brokerType);
                        setLoginDialogOpen(true);
                      } else {
                        // Handle other brokers' login here
                        console.log(`Login for ${name} (brokerId: ${brokerId}) - not implemented yet`);
                        toast.info(`Login for ${name} is not yet implemented`);
                      }
                    }}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isConnected && (
                <>
                  <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Switch
                    checked={isConnected}
                    onCheckedChange={handleToggle}
                    disabled={isToggling}
                    className="hidden sm:block"
                  />
                </>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                <Code className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Angel One Login Dialog */}
      {brokerType === "angelone" && (
        <AngelOneLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("Angel One login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* ALICEBLUE Login Dialog */}
      {brokerType === "aliceblue" && (
        <AliceBlueLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("ALICEBLUE login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* DHAN Login Dialog */}
      {brokerType === "dhan" && (
        <DhanLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("DHAN login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* FYERS Login Dialog */}
      {brokerType === "fyers" && (
        <FyersLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("FYERS login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* UPSTOX Login Dialog */}
      {brokerType === "upstox" && (
        <UpstoxLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("UPSTOX login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* ZERODHA Login Dialog */}
      {brokerType === "zerodha" && (
        <ZerodhaLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          brokerId={brokerId}
          onLoginSuccess={(credentials) => {
            console.log("ZERODHA login successful:", credentials);
            setIsConnected(true);
            setLoginDialogOpen(false);
            // Refresh broker list after successful login
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}
    </Card>
  );
};
