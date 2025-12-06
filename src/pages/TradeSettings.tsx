import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, VolumeX, MicOff, MoreVertical, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration } from "@/lib/api";

interface TradingViewSettings {
  tradingKey: string;
  alertMessage: string;
  conditionalAlertData: string;
  webhookUrl: string;
}

interface AmibrokerSettings {
  tradingKey: string;
  signalTemplate: string;
}

interface ChartInkSettings {
  alertData: string;
}

const TradeSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState<"tradingView" | "amibroker" | null>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tradingViewSettings, setTradingViewSettings] = useState<TradingViewSettings>({
    tradingKey: "",
    alertMessage: "{{strategy.order.alert_message}}",
    conditionalAlertData: "",
    webhookUrl: "",
  });
  const [amibrokerSettings, setAmibrokerSettings] = useState<AmibrokerSettings>({
    tradingKey: "",
    signalTemplate: "1,Limit | MIS,{Quantity},EQ,Trade1,",
  });
  const [chartInkSettings, setChartInkSettings] = useState<ChartInkSettings>({
    alertData: "",
  });
  const [webhookUrl, setWebhookUrl] = useState("");

  // Get user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const id = user.id || user._id || user.userId;
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Failed to load user information");
      }
    }
  }, []);

  // Fetch trade settings on component mount
  useEffect(() => {
    if (userId) {
      fetchTradeSettings();
      fetchWebhookUrl();
    }
  }, [userId]);

  // Fetch trade settings
  const fetchTradeSettings = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}`,
        {
          method: "GET",
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch trade settings");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const settings = data.data;
        
        if (settings.tradingView) {
          setTradingViewSettings({
            tradingKey: settings.tradingView.tradingKey || "",
            alertMessage: settings.tradingView.alertMessage || "{{strategy.order.alert_message}}",
            conditionalAlertData: settings.tradingView.conditionalAlertData || "",
            webhookUrl: settings.tradingView.webhookUrl || "",
          });
        }

        if (settings.amibroker) {
          setAmibrokerSettings({
            tradingKey: settings.amibroker.tradingKey || "",
            signalTemplate: settings.amibroker.signalTemplate || "1,Limit | MIS,{Quantity},EQ,Trade1,",
          });
        }

        if (settings.chartInk) {
          setChartInkSettings({
            alertData: settings.chartInk.alertData || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching trade settings:", error);
      toast.error("Failed to load trade settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch webhook URL
  const fetchWebhookUrl = async () => {
    if (!userId) return;

    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}/tradingview/webhook-url`,
        {
          method: "GET",
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.webhookUrl) {
          setWebhookUrl(data.data.webhookUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching webhook URL:", error);
    }
  };

  // Update all trade settings
  const handleSaveAll = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            tradingView: {
              tradingKey: tradingViewSettings.tradingKey,
              alertMessage: tradingViewSettings.alertMessage,
              conditionalAlertData: tradingViewSettings.conditionalAlertData,
              webhookUrl: tradingViewSettings.webhookUrl,
            },
            amibroker: {
              tradingKey: amibrokerSettings.tradingKey,
              signalTemplate: amibrokerSettings.signalTemplate,
            },
            chartInk: {
              alertData: chartInkSettings.alertData,
            },
          }),
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update trade settings");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Trade settings saved successfully");
        // Refresh webhook URL
        fetchWebhookUrl();
      }
    } catch (error) {
      console.error("Error saving trade settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save trade settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Update TradingView settings only
  const handleSaveTradingView = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}/tradingview`,
        {
          method: "PUT",
          body: JSON.stringify({
            tradingKey: tradingViewSettings.tradingKey,
            alertMessage: tradingViewSettings.alertMessage,
            conditionalAlertData: tradingViewSettings.conditionalAlertData,
            webhookUrl: tradingViewSettings.webhookUrl,
          }),
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update TradingView settings");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("TradingView settings saved successfully");
        fetchWebhookUrl();
      }
    } catch (error) {
      console.error("Error saving TradingView settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save TradingView settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Update AmiBroker settings only
  const handleSaveAmibroker = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}/amibroker`,
        {
          method: "PUT",
          body: JSON.stringify({
            tradingKey: amibrokerSettings.tradingKey,
            signalTemplate: amibrokerSettings.signalTemplate,
          }),
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update AmiBroker settings");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("AmiBroker/MT4/MT5 settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving AmiBroker settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save AmiBroker settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Update ChartInk settings only
  const handleSaveChartInk = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch(
        `http://localhost:3000/api/trade-settings/${userId}/chartink`,
        {
          method: "PUT",
          body: JSON.stringify({
            alertData: chartInkSettings.alertData,
          }),
        }
      );

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update ChartInk settings");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("ChartInk settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving ChartInk settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save ChartInk settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate trading key via API
  const handleGenerateKey = async (type: "tradingView" | "amibroker") => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsGeneratingKey(type);
    try {
      const endpoint = type === "tradingView" 
        ? `http://localhost:3000/api/trade-settings/${userId}/tradingview/generate-key`
        : `http://localhost:3000/api/trade-settings/${userId}/amibroker/generate-key`;

      const response = await apiFetch(endpoint, {
        method: "POST",
      });

      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate trading key");
      }

      const data = await response.json();
      if (data.success && data.data?.tradingKey) {
        const newKey = data.data.tradingKey;
        if (type === "tradingView") {
          setTradingViewSettings((prev) => ({ ...prev, tradingKey: newKey }));
        } else {
          setAmibrokerSettings((prev) => ({ ...prev, tradingKey: newKey }));
        }
        toast.success("Trading key generated successfully");
      }
    } catch (error) {
      console.error("Error generating trading key:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate trading key");
    } finally {
      setIsGeneratingKey(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block lg:w-64 lg:border-r">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
            <div className="mx-auto max-w-7xl flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading trade settings...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Trade Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with MT4, MT5, TradingView, ChartInk, AmiBroker
                </p>
              </div>
              <Button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Trading View Settings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Trading View Settings</CardTitle>
                  <Button
                    onClick={handleSaveTradingView}
                    disabled={isSaving}
                    size="sm"
                    variant="outline"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* My Trading Key */}
                  <div className="space-y-2">
                    <Label>My Trading Key</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(tradingViewSettings.tradingKey, "Trading Key")}
                        disabled={!tradingViewSettings.tradingKey}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={tradingViewSettings.tradingKey}
                        onChange={(e) =>
                          setTradingViewSettings((prev) => ({ ...prev, tradingKey: e.target.value }))
                        }
                        className="flex-1"
                        placeholder="Trading key will be generated"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20"
                        onClick={() => handleGenerateKey("tradingView")}
                        disabled={isGeneratingKey === "tradingView"}
                      >
                        {isGeneratingKey === "tradingView" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Trading View Alert Message */}
                  <div className="space-y-2 relative">
                    <Label>Trading View Alert Message</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(tradingViewSettings.alertMessage, "Alert Message")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={tradingViewSettings.alertMessage}
                        onChange={(e) =>
                          setTradingViewSettings((prev) => ({ ...prev, alertMessage: e.target.value }))
                        }
                        onFocus={() => setShowFloatingToolbar(true)}
                        onBlur={() => setTimeout(() => setShowFloatingToolbar(false), 200)}
                        className="flex-1"
                      />
                    </div>
                    
                    {/* Floating Toolbar */}
                    {showFloatingToolbar && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 flex items-center gap-1 bg-gray-800/90 rounded-lg px-2 py-1.5 shadow-lg">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-gray-700"
                          title="Volume Off"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-gray-700"
                          title="Microphone Off"
                        >
                          <MicOff className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-gray-700"
                          title="More Options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Trading View Conditional Alert Data */}
                  <div className="space-y-2">
                    <Label>Trading View Conditional Alert Data</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(tradingViewSettings.conditionalAlertData, "Conditional Alert Data")}
                        disabled={!tradingViewSettings.conditionalAlertData}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={tradingViewSettings.conditionalAlertData}
                        onChange={(e) =>
                          setTradingViewSettings((prev) => ({ ...prev, conditionalAlertData: e.target.value }))
                        }
                        className="flex-1"
                        placeholder="Enter conditional alert data"
                      />
                    </div>
                  </div>

                  {/* Webhook URL */}
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(tradingViewSettings.webhookUrl || webhookUrl, "Webhook URL")}
                        disabled={!tradingViewSettings.webhookUrl && !webhookUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={tradingViewSettings.webhookUrl}
                        onChange={(e) =>
                          setTradingViewSettings((prev) => ({ ...prev, webhookUrl: e.target.value }))
                        }
                        className="flex-1"
                        placeholder={webhookUrl || "Enter webhook URL"}
                      />
                    </div>
                    {webhookUrl && !tradingViewSettings.webhookUrl && (
                      <p className="text-xs text-muted-foreground">
                        Default: {webhookUrl}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AmiBroker / MT4 / MT5 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>AmiBroker / MT4 / MT5</CardTitle>
                  <Button
                    onClick={handleSaveAmibroker}
                    disabled={isSaving}
                    size="sm"
                    variant="outline"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* My Trading Key */}
                  <div className="space-y-2">
                    <Label>My Trading Key</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(amibrokerSettings.tradingKey, "Trading Key")}
                        disabled={!amibrokerSettings.tradingKey}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={amibrokerSettings.tradingKey}
                        onChange={(e) =>
                          setAmibrokerSettings((prev) => ({ ...prev, tradingKey: e.target.value }))
                        }
                        className="flex-1"
                        placeholder="Trading key will be generated"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20"
                        onClick={() => handleGenerateKey("amibroker")}
                        disabled={isGeneratingKey === "amibroker"}
                      >
                        {isGeneratingKey === "amibroker" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Signal Template */}
                  <div className="space-y-2">
                    <Label>Signal Template</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => handleCopy(amibrokerSettings.signalTemplate, "Signal Template")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Input
                        value={amibrokerSettings.signalTemplate}
                        onChange={(e) =>
                          setAmibrokerSettings((prev) => ({ ...prev, signalTemplate: e.target.value }))
                        }
                        className="flex-1"
                        placeholder="Enter signal template"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ChartInk Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>ChartInk Settings</CardTitle>
                <Button
                  onClick={handleSaveChartInk}
                  disabled={isSaving}
                  size="sm"
                  variant="outline"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ChartInk Alert Data</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-success/10 text-success hover:bg-success/20"
                      onClick={() => handleCopy(chartInkSettings.alertData, "ChartInk Alert Data")}
                      disabled={!chartInkSettings.alertData}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Input
                      value={chartInkSettings.alertData}
                      onChange={(e) =>
                        setChartInkSettings((prev) => ({ ...prev, alertData: e.target.value }))
                      }
                      placeholder="Enter ChartInk alert data"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025. All right reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TradeSettings;

