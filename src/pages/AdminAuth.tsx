import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

const AdminAuth = () => {
  const navigate = useNavigate();
  
  // Redirect to admin panel if already logged in as admin
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem("adminToken");
      const adminUser = localStorage.getItem("adminUser");
      
      if (adminToken && adminUser) {
        // Use navigate instead of window.location to avoid redirect loops
        navigate("/admin/Dashboard", { replace: true });
      }
    };
    
    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      // Call admin login API
      const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // Check if success is true
      if (data.success === true) {
        // Store admin authentication data first
        // Handle different possible response structures
        const accessToken = data.data?.accessToken || data.data?.token || data.accessToken;
        const refreshToken = data.data?.refreshToken || data.refreshToken;
        const tokenType = data.data?.tokenType || data.tokenType || "Bearer";
        const admin = data.data?.admin || data.data?.user || data.admin || data.user;

        if (accessToken) {
          localStorage.setItem("adminToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("adminRefreshToken", refreshToken);
        }
        if (tokenType) {
          localStorage.setItem("adminTokenType", tokenType);
        }
        if (admin) {
          localStorage.setItem("adminUser", JSON.stringify(admin));
        } else {
          // If no admin object, create a minimal one to satisfy the check
          localStorage.setItem("adminUser", JSON.stringify({ email: formData.email }));
        }

        // Verify tokens are stored
        console.log("Admin tokens stored:", {
          hasToken: !!localStorage.getItem("adminToken"),
          hasUser: !!localStorage.getItem("adminUser")
        });

        // Show success message
        toast.success(data.message || "Admin login successful");
        
        // Navigate after ensuring tokens are stored
        setTimeout(() => {
          navigate("/admin/Dashboard", { replace: true });
        }, 300);
      } else {
        throw new Error(data.message || "Admin login failed");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Admin login failed. Please check your credentials.";
      toast.error(errorMessage);
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-0.5 w-16 h-16">
              <div className="w-full h-full bg-red-500 rounded-tl"></div>
              <div className="w-full h-full bg-blue-500"></div>
              <div className="w-full h-full bg-yellow-500 rounded-tr"></div>
              <div className="w-full h-full bg-cyan-400"></div>
              <div className="w-full h-full bg-orange-500"></div>
              <div className="w-full h-full bg-green-500"></div>
              <div className="w-full h-full bg-purple-500 rounded-bl"></div>
              <div className="w-full h-full bg-pink-500"></div>
              <div className="w-full h-full bg-indigo-500 rounded-br"></div>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Enter your admin credentials to continue
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card border rounded-lg shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In as Admin"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Admin access only. Unauthorized access is prohibited.</p>
          </div>
        </div>

        {/* Back to Regular Login */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate("/auth")}
            className="text-muted-foreground"
          >
            Back to User Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;

