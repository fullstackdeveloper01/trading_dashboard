import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, WifiOff, VolumeX, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration, getApiBaseUrl, getRedirectUri } from "@/lib/api";

interface AngelOneLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokerId?: string;
  onLoginSuccess?: (credentials: {
    brokerUserID: string;
    password: string;
    apiKey: string;
    totpKey: string;
  }) => void;
}

export const AngelOneLoginDialog = ({
  open,
  onOpenChange,
  brokerId,
  onLoginSuccess,
}: AngelOneLoginDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    brokerUserID: "AAAN855782",
    password: "4656",
    apiKey: "",
    totpKey: "BKVSTY4XSPCA3YNVMDT3J063YI",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!formData.apiKey.trim()) {
      setErrors({ apiKey: "API Key is required" });
      return;
    }

    setIsSaving(true);
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
      const brokerName = brokerId?.toLowerCase() === "angelbroking" ? "angelone" : (brokerId?.toLowerCase() || "angelone");

      // Call broker login API
      const response = await apiFetch(
        `${getApiBaseUrl()}/api/brokers/login`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            brokerName: brokerName,
            redirectURI: getRedirectUri(),
            credentials: {
              brokerUserID: formData.brokerUserID,
              password: formData.password,
              apiKey: formData.apiKey,
              totpKey: formData.totpKey,
            },
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

        // Close dialog
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
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        brokerUserID: "AAAN855782",
        password: "4656",
        apiKey: "",
        totpKey: "BKVSTY4XSPCA3YNVMDT3J063YI",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Broker Settings : ANGELBROKING</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brokerUserID">BrokerUserID</Label>
            <Input
              id="brokerUserID"
              type="text"
              value={formData.brokerUserID}
              onChange={(e) => handleInputChange("brokerUserID", e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="apiKey">ApiKey</Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="Enter APPKey"
              value={formData.apiKey}
              onChange={(e) => handleInputChange("apiKey", e.target.value)}
              onFocus={() => setShowFloatingToolbar(true)}
              onBlur={() => setTimeout(() => setShowFloatingToolbar(false), 200)}
              disabled={isSaving}
              className={errors.apiKey ? "border-destructive" : ""}
            />
            {errors.apiKey && (
              <p className="text-sm text-destructive">{errors.apiKey}</p>
            )}
            
            {/* Floating Toolbar */}
            {showFloatingToolbar && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1.5 shadow-lg">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-gray-700"
                  title="WiFi Off"
                >
                  <WifiOff className="h-4 w-4" />
                </Button>
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
                  title="More Options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totpKey">TOTPKey</Label>
            <Input
              id="totpKey"
              type="text"
              value={formData.totpKey}
              onChange={(e) => handleInputChange("totpKey", e.target.value)}
              disabled={isSaving}
            />
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="bg-gray-100 hover:bg-gray-200"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

