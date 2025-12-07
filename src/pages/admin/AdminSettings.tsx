import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Globe,
  Database,
  Save,
  RefreshCw,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { adminApiFetch, checkAdminTokenExpiration } from "@/lib/adminApi";
import { getApiBaseUrl } from "@/lib/api";

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Trading Panel",
    siteDescription: "Advanced Trading Platform",
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsers: 1000,
  });

  // User Panel Settings
  const [userPanelSettings, setUserPanelSettings] = useState({
    enableDashboard: true,
    enableWatchlist: true,
    enableOrders: true,
    enablePositions: true,
    enableStrategies: true,
    enableActivity: true,
    enableProfile: true,
    defaultTheme: "light",
    allowThemeToggle: true,
  });

  // Trading Settings
  const [tradingSettings, setTradingSettings] = useState({
    enableAutoTrading: false,
    maxOrdersPerDay: 100,
    minOrderAmount: 1000,
    maxOrderAmount: 1000000,
    enableStopLoss: true,
    enableTakeProfit: true,
    defaultBroker: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderAlerts: true,
    priceAlerts: false,
    systemAlerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    enableIpWhitelist: false,
    apiKey: "sk_live_xxxxxxxxxxxxxxxxxxxx",
    rateLimit: 100,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    apiBaseUrl: getApiBaseUrl(),
    databaseBackup: true,
    logLevel: "info",
    enableAnalytics: true,
    enableErrorTracking: true,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // Here you would call the API to save settings
      // const response = await adminApiFetch(`${getApiBaseUrl()}/api/admin/settings/${section}`, {
      //   method: "PUT",
      //   body: JSON.stringify(settings)
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (section: string) => {
    toast.info(`Resetting ${section} settings to defaults`);
    // Reset logic here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure system-wide settings and user panel preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("general")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("general")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Basic system configuration and site information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={generalSettings.siteName}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={generalSettings.maxUsers}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    maxUsers: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={generalSettings.siteDescription}
              onChange={(e) =>
                setGeneralSettings({
                  ...generalSettings,
                  siteDescription: e.target.value,
                })
              }
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable access for all users
              </p>
            </div>
            <Switch
              checked={generalSettings.maintenanceMode}
              onCheckedChange={(checked) =>
                setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Registration Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register
              </p>
            </div>
            <Switch
              checked={generalSettings.registrationEnabled}
              onCheckedChange={(checked) =>
                setGeneralSettings({
                  ...generalSettings,
                  registrationEnabled: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* User Panel Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Panel Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("userPanel")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("userPanel")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure features and options available in the user panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dashboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dashboard page
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableDashboard}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableDashboard: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Watchlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable watchlist feature
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableWatchlist}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableWatchlist: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable orders management
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableOrders}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableOrders: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Positions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable positions tracking
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enablePositions}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enablePositions: checked,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Strategies</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable strategies feature
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableStrategies}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableStrategies: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable activity logs
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableActivity}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableActivity: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable profile management
                  </p>
                </div>
                <Switch
                  checked={userPanelSettings.enableProfile}
                  onCheckedChange={(checked) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      enableProfile: checked,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Default Theme</Label>
                <Select
                  value={userPanelSettings.defaultTheme}
                  onValueChange={(value) =>
                    setUserPanelSettings({
                      ...userPanelSettings,
                      defaultTheme: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Theme Toggle</Label>
              <p className="text-sm text-muted-foreground">
                Let users switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={userPanelSettings.allowThemeToggle}
              onCheckedChange={(checked) =>
                setUserPanelSettings({
                  ...userPanelSettings,
                  allowThemeToggle: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Trading Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Trading Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("trading")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("trading")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure trading limits and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxOrdersPerDay">Max Orders Per Day</Label>
              <Input
                id="maxOrdersPerDay"
                type="number"
                value={tradingSettings.maxOrdersPerDay}
                onChange={(e) =>
                  setTradingSettings({
                    ...tradingSettings,
                    maxOrdersPerDay: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Min Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={tradingSettings.minOrderAmount}
                onChange={(e) =>
                  setTradingSettings({
                    ...tradingSettings,
                    minOrderAmount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOrderAmount">Max Order Amount (₹)</Label>
              <Input
                id="maxOrderAmount"
                type="number"
                value={tradingSettings.maxOrderAmount}
                onChange={(e) =>
                  setTradingSettings({
                    ...tradingSettings,
                    maxOrderAmount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultBroker">Default Broker</Label>
              <Select
                value={tradingSettings.defaultBroker}
                onValueChange={(value) =>
                  setTradingSettings({
                    ...tradingSettings,
                    defaultBroker: value,
                  })
                }
              >
                <SelectTrigger id="defaultBroker">
                  <SelectValue placeholder="Select default broker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="angelone">Angel One</SelectItem>
                  <SelectItem value="zerodha">Zerodha</SelectItem>
                  <SelectItem value="upstox">Upstox</SelectItem>
                  <SelectItem value="dhan">Dhan</SelectItem>
                  <SelectItem value="fyers">Fyers</SelectItem>
                  <SelectItem value="aliceblue">Alice Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Trading</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic order execution
              </p>
            </div>
            <Switch
              checked={tradingSettings.enableAutoTrading}
              onCheckedChange={(checked) =>
                setTradingSettings({
                  ...tradingSettings,
                  enableAutoTrading: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stop Loss</Label>
              <p className="text-sm text-muted-foreground">
                Enable stop loss orders
              </p>
            </div>
            <Switch
              checked={tradingSettings.enableStopLoss}
              onCheckedChange={(checked) =>
                setTradingSettings({
                  ...tradingSettings,
                  enableStopLoss: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Take Profit</Label>
              <p className="text-sm text-muted-foreground">
                Enable take profit orders
              </p>
            </div>
            <Switch
              checked={tradingSettings.enableTakeProfit}
              onCheckedChange={(checked) =>
                setTradingSettings({
                  ...tradingSettings,
                  enableTakeProfit: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("notifications")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("notifications")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure notification preferences for users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send SMS alerts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify on order execution
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.orderAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      orderAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify on price changes
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.priceAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      priceAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify on system events
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      systemAlerts: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("security")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("security")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure security and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Password Min Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    passwordMinLength: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">API Rate Limit (per minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={securitySettings.rateLimit}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    rateLimit: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={securitySettings.apiKey}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all users
              </p>
            </div>
            <Switch
              checked={securitySettings.requireTwoFactor}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  requireTwoFactor: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Whitelist</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to whitelisted IPs
              </p>
            </div>
            <Switch
              checked={securitySettings.enableIpWhitelist}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  enableIpWhitelist: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset("system")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("system")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure system-level settings and integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="apiBaseUrl">API Base URL</Label>
              <Input
                id="apiBaseUrl"
                value={systemSettings.apiBaseUrl}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    apiBaseUrl: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select
                value={systemSettings.logLevel}
                onValueChange={(value) =>
                  setSystemSettings({
                    ...systemSettings,
                    logLevel: value,
                  })
                }
              >
                <SelectTrigger id="logLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Database Backup</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic database backups
              </p>
            </div>
            <Switch
              checked={systemSettings.databaseBackup}
              onCheckedChange={(checked) =>
                setSystemSettings({
                  ...systemSettings,
                  databaseBackup: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Enable usage analytics tracking
              </p>
            </div>
            <Switch
              checked={systemSettings.enableAnalytics}
              onCheckedChange={(checked) =>
                setSystemSettings({
                  ...systemSettings,
                  enableAnalytics: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Error Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable error tracking and reporting
              </p>
            </div>
            <Switch
              checked={systemSettings.enableErrorTracking}
              onCheckedChange={(checked) =>
                setSystemSettings({
                  ...systemSettings,
                  enableErrorTracking: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
