import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  DollarSign,
  Crown,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminApiFetch, checkAdminTokenExpiration } from "@/lib/adminApi";
import { getApiBaseUrl } from "@/lib/api";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: "monthly" | "yearly" | "lifetime";
  features: string[];
  maxUsers?: number;
  maxBrokers?: number;
  maxOrders?: number;
  maxTrades?: number;
  isActive: boolean;
  isPopular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    billingPeriod: "monthly",
    features: [],
    maxUsers: undefined,
    maxBrokers: undefined,
    maxOrders: undefined,
    maxTrades: undefined,
    isActive: true,
    isPopular: false,
  });
  const [featureInput, setFeatureInput] = useState("");

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApiFetch(
        `${getApiBaseUrl()}/api/admin/pricing-plans`,
        { method: "GET" }
      );

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const plansData = Array.isArray(data.data) ? data.data : data.data.plans || [];
          setPlans(plansData);
        }
      } else {
        // If API doesn't exist yet, use mock data
        setPlans([
          {
            id: "1",
            name: "Free",
            description: "Basic features for getting started",
            price: 0,
            currency: "USD",
            billingPeriod: "monthly",
            features: ["5 Brokers", "100 Orders/month", "Basic Support"],
            maxUsers: 1,
            maxBrokers: 5,
            maxOrders: 100,
            isActive: true,
            isPopular: false,
          },
          {
            id: "2",
            name: "Pro",
            description: "Advanced features for professionals",
            price: 29,
            currency: "USD",
            billingPeriod: "monthly",
            features: ["Unlimited Brokers", "1000 Orders/month", "Priority Support", "Advanced Analytics"],
            maxUsers: 5,
            maxBrokers: -1,
            maxOrders: 1000,
            isActive: true,
            isPopular: true,
          },
          {
            id: "3",
            name: "Enterprise",
            description: "Full-featured plan for teams",
            price: 99,
            currency: "USD",
            billingPeriod: "monthly",
            features: ["Unlimited Everything", "Custom Integrations", "Dedicated Support", "API Access"],
            maxUsers: -1,
            maxBrokers: -1,
            maxOrders: -1,
            isActive: true,
            isPopular: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      toast.error("Failed to fetch pricing plans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenDialog = (plan?: PricingPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingPeriod: plan.billingPeriod,
        features: plan.features || [],
        maxUsers: plan.maxUsers,
        maxBrokers: plan.maxBrokers,
        maxOrders: plan.maxOrders,
        maxTrades: plan.maxTrades,
        isActive: plan.isActive,
        isPopular: plan.isPopular || false,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        billingPeriod: "monthly",
        features: [],
        maxUsers: undefined,
        maxBrokers: undefined,
        maxOrders: undefined,
        maxTrades: undefined,
        isActive: true,
        isPopular: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
    setFeatureInput("");
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSave = async () => {
    try {
      const url = selectedPlan
        ? `${getApiBaseUrl()}/api/admin/pricing-plans/${selectedPlan.id}`
        : `${getApiBaseUrl()}/api/admin/pricing-plans`;

      const response = await adminApiFetch(url, {
        method: selectedPlan ? "PUT" : "POST",
        body: JSON.stringify(formData),
      });

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        toast.success(
          selectedPlan ? "Pricing plan updated successfully" : "Pricing plan created successfully"
        );
        handleCloseDialog();
        fetchPlans();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to save pricing plan");
      }
    } catch (error) {
      console.error("Error saving pricing plan:", error);
      toast.error("Failed to save pricing plan");
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;

    setIsDeleting(true);
    try {
      const response = await adminApiFetch(
        `${getApiBaseUrl()}/api/admin/pricing-plans/${planId}`,
        { method: "DELETE" }
      );

      if (checkAdminTokenExpiration(response)) return;

      if (response.ok) {
        toast.success("Pricing plan deleted successfully");
        fetchPlans();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to delete pricing plan");
      }
    } catch (error) {
      console.error("Error deleting pricing plan:", error);
      toast.error("Failed to delete pricing plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanIcon = (name: string) => {
    const planName = name.toLowerCase();
    if (planName.includes("enterprise") || planName.includes("premium")) {
      return <Crown className="h-5 w-5" />;
    }
    if (planName.includes("pro") || planName.includes("business")) {
      return <Zap className="h-5 w-5" />;
    }
    return <Users className="h-5 w-5" />;
  };

  const formatPrice = (price: number, currency: string, period: string) => {
    if (price === 0) return "Free";
    const symbol = currency === "USD" ? "$" : currency === "INR" ? "₹" : currency;
    const periodText = period === "monthly" ? "/mo" : period === "yearly" ? "/yr" : "";
    return `${symbol}${price}${periodText}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subscription plans and pricing tiers
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Pricing Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative hover:shadow-lg transition-shadow ${
                plan.isPopular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  {!plan.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.price, plan.currency, plan.billingPeriod)}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {plan.billingPeriod} billing
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t text-sm">
                  {plan.maxUsers !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Users: </span>
                      <span className="font-medium">
                        {plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}
                      </span>
                    </div>
                  )}
                  {plan.maxBrokers !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Brokers: </span>
                      <span className="font-medium">
                        {plan.maxBrokers === -1 ? "Unlimited" : plan.maxBrokers}
                      </span>
                    </div>
                  )}
                  {plan.maxOrders !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Orders: </span>
                      <span className="font-medium">
                        {plan.maxOrders === -1 ? "Unlimited" : plan.maxOrders}
                      </span>
                    </div>
                  )}
                  {plan.maxTrades !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Trades: </span>
                      <span className="font-medium">
                        {plan.maxTrades === -1 ? "Unlimited" : plan.maxTrades}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(plan)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Edit Pricing Plan" : "Create New Pricing Plan"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? "Update the pricing plan details"
                : "Add a new pricing plan to your system"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pro, Enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPeriod">Billing Period</Label>
                <Select
                  value={formData.billingPeriod}
                  onValueChange={(value: "monthly" | "yearly" | "lifetime") =>
                    setFormData({ ...formData, billingPeriod: value })
                  }
                >
                  <SelectTrigger id="billingPeriod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users (-1 for unlimited)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers === undefined ? "" : formData.maxUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsers: e.target.value === "" ? undefined : parseInt(e.target.value) || -1,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBrokers">Max Brokers (-1 for unlimited)</Label>
                <Input
                  id="maxBrokers"
                  type="number"
                  value={formData.maxBrokers === undefined ? "" : formData.maxBrokers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxBrokers: e.target.value === "" ? undefined : parseInt(e.target.value) || -1,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrders">Max Orders (-1 for unlimited)</Label>
                <Input
                  id="maxOrders"
                  type="number"
                  value={formData.maxOrders === undefined ? "" : formData.maxOrders}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOrders: e.target.value === "" ? undefined : parseInt(e.target.value) || -1,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTrades">Max Trades (-1 for unlimited)</Label>
                <Input
                  id="maxTrades"
                  type="number"
                  value={formData.maxTrades === undefined ? "" : formData.maxTrades}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxTrades: e.target.value === "" ? undefined : parseInt(e.target.value) || -1,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Add a feature and press Enter"
                />
                <Button type="button" onClick={handleAddFeature}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features?.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this plan available to users
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Popular</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as most popular plan
                </p>
              </div>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {selectedPlan ? "Update" : "Create"} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPricingPlans;


