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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration, getApiBaseUrl } from "@/lib/api";

interface AddSymbolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void; // Callback to refresh the watchlist after successful save
}

export const AddSymbolDialog = ({
  open,
  onOpenChange,
  onSave,
}: AddSymbolDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    exchangeSymbol: "",
    mappingName: "",
    tgtType: "Points",
    target: null as number | null,
    slType: "Points",
    stopLoss: null as number | null,
    lotSize: 0,
    qtyMultiplier: 1,
    productType: "MIS",
    orderType: "NA",
    strategy: "",
    isActive: true,
  });

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const incrementLotSize = () => {
    setFormData((prev) => ({ ...prev, lotSize: prev.lotSize + 1 }));
  };

  const decrementLotSize = () => {
    setFormData((prev) => ({ ...prev, lotSize: Math.max(0, prev.lotSize - 1) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.exchangeSymbol.trim()) {
      newErrors.exchangeSymbol = "Exchange Symbol is required";
    }
    if (!formData.mappingName.trim()) {
      newErrors.mappingName = "Mapping Name is required";
    }

    // Numeric field validations
    if (formData.target !== null && formData.target < 0) {
      newErrors.target = "Target must be a positive number";
    }
    if (formData.stopLoss !== null && formData.stopLoss < 0) {
      newErrors.stopLoss = "Stop Loss must be a positive number";
    }
    if (formData.lotSize < 0) {
      newErrors.lotSize = "Lot Size must be 0 or greater";
    }
    if (formData.qtyMultiplier <= 0) {
      newErrors.qtyMultiplier = "Quantity Multiplier must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare request body
      const requestBody: any = {
        exchangeSymbol: formData.exchangeSymbol.trim(),
        mappingName: formData.mappingName.trim(),
        tgtType: formData.tgtType,
        slType: formData.slType,
        lotSize: formData.lotSize,
        qtyMultiplier: formData.qtyMultiplier,
        productType: formData.productType,
        orderType: formData.orderType,
        isActive: formData.isActive,
      };

      // Add optional fields only if they have values
      if (formData.target !== null && formData.target !== undefined) {
        requestBody.target = formData.target;
      }
      if (formData.stopLoss !== null && formData.stopLoss !== undefined) {
        requestBody.stopLoss = formData.stopLoss;
      }
      if (formData.strategy.trim()) {
        requestBody.strategy = formData.strategy.trim();
      }

      // Call API
      const response = await apiFetch(
        `${getApiBaseUrl()}/api/watchlist`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create watchlist item");
      }

      if (data.success) {
        toast.success(data.message || "Watchlist item created successfully");
        
        // Call onSave callback to refresh the watchlist
        if (onSave) {
          onSave();
        }
        
        handleClose();
      } else {
        throw new Error(data.message || "Failed to create watchlist item");
      }
    } catch (error) {
      console.error("Create watchlist item failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create watchlist item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        exchangeSymbol: "",
        mappingName: "",
        tgtType: "Points",
        target: null,
        slType: "Points",
        stopLoss: null,
        lotSize: 0,
        qtyMultiplier: 1,
        productType: "MIS",
        orderType: "NA",
        strategy: "",
        isActive: true,
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const calculatedQty = formData.lotSize * formData.qtyMultiplier;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Symbol</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Symbol Identification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exchangeSymbol">Exchange Symbol *</Label>
              <Input
                id="exchangeSymbol"
                value={formData.exchangeSymbol}
                onChange={(e) => handleInputChange("exchangeSymbol", e.target.value)}
                placeholder="NIFTY"
                disabled={isLoading}
                className={errors.exchangeSymbol ? "border-destructive" : ""}
              />
              {errors.exchangeSymbol && (
                <p className="text-xs text-destructive">{errors.exchangeSymbol}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mappingName">Mapping Name *</Label>
              <Input
                id="mappingName"
                value={formData.mappingName}
                onChange={(e) => handleInputChange("mappingName", e.target.value)}
                placeholder="NIFTY"
                disabled={isLoading}
                className={errors.mappingName ? "border-destructive" : ""}
              />
              {errors.mappingName && (
                <p className="text-xs text-destructive">{errors.mappingName}</p>
              )}
            </div>
          </div>

          {/* Target and Stop Loss */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tgtType">TGT Type</Label>
              <Select
                value={formData.tgtType}
                onValueChange={(value) => handleInputChange("tgtType", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="tgtType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Points">Points</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={formData.target ?? ""}
                onChange={(e) => handleInputChange("target", e.target.value ? Number(e.target.value) : null)}
                placeholder="30"
                disabled={isLoading}
                className={errors.target ? "border-destructive" : ""}
              />
              {errors.target && (
                <p className="text-xs text-destructive">{errors.target}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slType">SL Type</Label>
              <Select
                value={formData.slType}
                onValueChange={(value) => handleInputChange("slType", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="slType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Points">Points</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                value={formData.stopLoss ?? ""}
                onChange={(e) => handleInputChange("stopLoss", e.target.value ? Number(e.target.value) : null)}
                placeholder="15"
                disabled={isLoading}
                className={errors.stopLoss ? "border-destructive" : ""}
              />
              {errors.stopLoss && (
                <p className="text-xs text-destructive">{errors.stopLoss}</p>
              )}
            </div>
          </div>

          {/* Order Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotSize">LotSize</Label>
              <div className="relative">
                <Input
                  id="lotSize"
                  type="number"
                  value={formData.lotSize}
                  onChange={(e) => handleInputChange("lotSize", Number(e.target.value))}
                  placeholder="0"
                  className="pr-20"
                  disabled={isLoading}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={incrementLotSize}
                    disabled={isLoading}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={decrementLotSize}
                    disabled={isLoading}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.lotSize}x{formData.qtyMultiplier} = {calculatedQty}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtyMultiplier">QtyMultiplier</Label>
              <Input
                id="qtyMultiplier"
                type="number"
                value={formData.qtyMultiplier}
                onChange={(e) => handleInputChange("qtyMultiplier", Number(e.target.value))}
                placeholder="1"
                disabled={isLoading}
                className={errors.qtyMultiplier ? "border-destructive" : ""}
              />
              {errors.qtyMultiplier && (
                <p className="text-xs text-destructive">{errors.qtyMultiplier}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prodType">ProdType</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => handleInputChange("productType", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="productType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIS">MIS</SelectItem>
                  <SelectItem value="NRML">NRML</SelectItem>
                  <SelectItem value="CNC">CNC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select
                value={formData.orderType}
                onValueChange={(value) => handleInputChange("orderType", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="orderType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NA">NA</SelectItem>
                  <SelectItem value="MARKET">MARKET</SelectItem>
                  <SelectItem value="LIMIT">LIMIT</SelectItem>
                  <SelectItem value="SL">SL</SelectItem>
                  <SelectItem value="SL-M">SL-M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Input
                id="strategy"
                value={formData.strategy}
                onChange={(e) => handleInputChange("strategy", e.target.value)}
                placeholder="Select or enter strategy"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isLoading ? (
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

