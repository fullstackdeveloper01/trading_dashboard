import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration } from "@/lib/api";

interface DhanLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokerId?: string;
  onLoginSuccess?: (credentials: {
    accessToken: string;
    clientId?: string;
    balance?: number;
  }) => void;
}

export const DhanLoginDialog = ({
  open,
  onOpenChange,
  brokerId,
  onLoginSuccess,
}: DhanLoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [clientId, setClientId] = useState("1107073295");
  const [balance, setBalance] = useState("0.42");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setShowSuccessView(false);
      setAccessToken("");
      setError("");
      setBalance("0.42");
    }
  }, [open]);

  const handleInputChange = (value: string) => {
    setAccessToken(value);
    if (error) {
      setError("");
    }
  };

  const handleValidate = async () => {
    if (!accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    setIsLoading(true);
    setError("");

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

      // Call broker login API - only send userId and accessToken
      const response = await apiFetch(
        `http://localhost:3000/api/brokers/login`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            accessToken: accessToken.trim(),
          }),
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token validation failed");
      }

      if (data.success) {
        toast.success(data.message || "Token validated and broker login successful");
        
        // On success, call the callback
        if (onLoginSuccess) {
          onLoginSuccess({
            accessToken: accessToken.trim(),
            clientId: clientId,
            balance: parseFloat(balance),
          });
        }

        // After successful validation, show the success view with client ID and balance
        setShowSuccessView(true);
      } else {
        throw new Error(data.message || "Token validation failed");
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Token validation failed. Please check your access token.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

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

      // Call broker login API - only send userId and accessToken
      const response = await apiFetch(
        `http://localhost:3000/api/brokers/login`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            accessToken: accessToken.trim(),
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
          onLoginSuccess({
            accessToken: accessToken.trim(),
            clientId: clientId,
            balance: parseFloat(balance),
          });
        }

        // Close dialog
        onOpenChange(false);
      } else {
        throw new Error(data.message || "Failed to login to broker");
      }
    } catch (err) {
      console.error("Broker login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to login to broker. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isSaving) {
      setAccessToken("");
      setError("");
      setShowSuccessView(false);
      setBalance("0.42");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Broker Settings : DHAN</DialogTitle>
        </DialogHeader>

        {!showSuccessView ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Copy AccessToken from DHAN and paste here
                </p>
                <Textarea
                  placeholder="Paste your access token here..."
                  value={accessToken}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isLoading}
                  className={error ? "border-destructive min-h-[200px] font-mono text-sm" : "min-h-[200px] font-mono text-sm"}
                  rows={10}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleValidate}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Token"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    DhanClientID: <span className="font-semibold text-foreground">{clientId}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Balance:
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    disabled={isSaving}
                    className="bg-blue-50 border-blue-200 text-blue-900 font-semibold"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

