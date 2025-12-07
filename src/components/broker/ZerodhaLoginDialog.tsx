import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getApiBaseUrl, getRedirectUri } from "@/lib/api";

interface ZerodhaLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokerId?: string;
  onLoginSuccess?: (credentials: {
    userId: string;
    password: string;
    apiKey: string;
    apiSecret: string;
    pin: string;
  }) => void;
}

export const ZerodhaLoginDialog = ({
  open,
  onOpenChange,
  brokerId,
  onLoginSuccess,
}: ZerodhaLoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    apiKey: "",
    apiSecret: "",
    pin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = "API Key is required";
    }

    if (!formData.apiSecret.trim()) {
      newErrors.apiSecret = "API Secret is required";
    }

    if (!formData.pin.trim()) {
      newErrors.pin = "PIN is required";
    } else if (formData.pin.length < 4) {
      newErrors.pin = "PIN must be at least 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

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

      // Map broker ID to API format
      const brokerName = brokerId?.toLowerCase() || "zerodha";

      // Call broker login API
      const response = await apiFetch(
        `${getApiBaseUrl()}/api/brokers/login`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            brokerName: brokerName,
            redirectURI: getRedirectUri(),
            credentials: formData,
          }),
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login to broker");
      }

      if (data.success) {
        toast.success(data.message || "Broker login successful");
        
        // On success, call the callback
        if (onLoginSuccess) {
          onLoginSuccess(formData);
        }

        // Reset form and close dialog
        setFormData({
          userId: "",
          password: "",
          apiKey: "",
          apiSecret: "",
          pin: "",
        });
        onOpenChange(false);
      } else {
        throw new Error(data.message || "Failed to login to broker");
      }
    } catch (error) {
      console.error("Broker login failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login to broker. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        userId: "",
        password: "",
        apiKey: "",
        apiSecret: "",
        pin: "",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span>Connect to ZERODHA</span>
          </DialogTitle>
          <DialogDescription>
            Enter your ZERODHA credentials to connect your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">
              User ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="userId"
              type="text"
              placeholder="Enter your User ID"
              value={formData.userId}
              onChange={(e) => handleInputChange("userId", e.target.value)}
              disabled={isLoading}
              className={errors.userId ? "border-destructive" : ""}
            />
            {errors.userId && (
              <p className="text-sm text-destructive">{errors.userId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              API Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="Enter your API Key"
              value={formData.apiKey}
              onChange={(e) => handleInputChange("apiKey", e.target.value)}
              disabled={isLoading}
              className={errors.apiKey ? "border-destructive" : ""}
            />
            {errors.apiKey && (
              <p className="text-sm text-destructive">{errors.apiKey}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">
              API Secret <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="apiSecret"
                type={showApiSecret ? "text" : "password"}
                placeholder="Enter your API Secret"
                value={formData.apiSecret}
                onChange={(e) => handleInputChange("apiSecret", e.target.value)}
                disabled={isLoading}
                className={errors.apiSecret ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiSecret(!showApiSecret)}
                disabled={isLoading}
              >
                {showApiSecret ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.apiSecret && (
              <p className="text-sm text-destructive">{errors.apiSecret}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">
              PIN <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="Enter your 4-digit PIN"
                value={formData.pin}
                onChange={(e) => handleInputChange("pin", e.target.value)}
                disabled={isLoading}
                maxLength={6}
                className={errors.pin ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPin(!showPin)}
                disabled={isLoading}
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.pin && (
              <p className="text-sm text-destructive">{errors.pin}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your 4-digit trading PIN for authentication
            </p>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

