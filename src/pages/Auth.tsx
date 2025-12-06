import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";

const Auth = () => {
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    
    if (accessToken && user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const [signupFormData, setSignupFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    mobile: "",
    username: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginFormData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!loginFormData.password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginFormData.email,
          password: loginFormData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success && data.data) {
        // Store tokens in localStorage
        if (data.data.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
        }
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
        if (data.data.tokenType) {
          localStorage.setItem("tokenType", data.data.tokenType);
        }
        if (data.data.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        toast.success(data.message || "Login successful");
        
        // Reset form
        setLoginFormData({
          email: "",
          password: "",
        });

        // Navigate to dashboard
        navigate("/");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignupForm = () => {
    const errors: Record<string, string> = {};

    // Fullname validation
    if (!signupFormData.fullname.trim()) {
      errors.fullname = "Fullname is required";
    } else if (signupFormData.fullname.trim().length < 2) {
      errors.fullname = "Fullname must be at least 2 characters";
    }

    // Email validation
    if (!signupFormData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupFormData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Mobile validation
    if (!signupFormData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else {
      const mobileRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!mobileRegex.test(signupFormData.mobile.replace(/\s/g, ""))) {
        errors.mobile = "Please enter a valid mobile number";
      }
    }

    // Username validation
    if (!signupFormData.username.trim()) {
      errors.username = "Username is required";
    } else if (signupFormData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(signupFormData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Password validation
    if (!signupFormData.password) {
      errors.password = "Password is required";
    } else if (signupFormData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(signupFormData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(signupFormData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(signupFormData.password)) {
      errors.password = "Password must contain at least one number";
    }

    // Confirm Password validation
    if (!signupFormData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (signupFormData.password !== signupFormData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateSignupForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: signupFormData.fullname,
          username: signupFormData.username,
          email: signupFormData.email,
          password: signupFormData.password,
          confirmPassword: signupFormData.confirmPassword,
          mobile: signupFormData.mobile,
          status: "active",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Signup failed");
      }

      const data = await response.json();
      toast.success("Account created successfully!");
      
      // Reset form
      setSignupFormData({
        fullname: "",
        email: "",
        password: "",
        mobile: "",
        username: "",
        confirmPassword: "",
      });

      // Navigate to login or dashboard
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...signupErrors };

    switch (field) {
      case "fullname":
        if (!value.trim()) {
          errors.fullname = "Fullname is required";
        } else if (value.trim().length < 2) {
          errors.fullname = "Fullname must be at least 2 characters";
        } else {
          delete errors.fullname;
        }
        break;

      case "email":
        if (!value.trim()) {
          errors.email = "Email is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.email = "Please enter a valid email address";
          } else {
            delete errors.email;
          }
        }
        break;

      case "mobile":
        if (!value.trim()) {
          errors.mobile = "Mobile number is required";
        } else {
          const mobileRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
          if (!mobileRegex.test(value.replace(/\s/g, ""))) {
            errors.mobile = "Please enter a valid mobile number";
          } else {
            delete errors.mobile;
          }
        }
        break;

      case "username":
        if (!value.trim()) {
          errors.username = "Username is required";
        } else if (value.trim().length < 3) {
          errors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = "Username can only contain letters, numbers, and underscores";
        } else {
          delete errors.username;
        }
        break;

      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.password = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*[0-9])/.test(value)) {
          errors.password = "Password must contain at least one number";
        } else {
          delete errors.password;
        }
        // Also validate confirm password if it exists
        if (signupFormData.confirmPassword) {
          if (value !== signupFormData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          } else {
            delete errors.confirmPassword;
          }
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm your password";
        } else if (signupFormData.password !== value) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;
    }

    setSignupErrors(errors);
  };

  const handleSignupInputChange = (field: string, value: string) => {
    setSignupFormData((prev) => ({ ...prev, [field]: value }));
    // Validate field in real-time
    validateField(field, value);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">TradingPanel</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Professional Trading Platform
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm sm:text-base">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Student Sign In</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to your account
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginFormData.email}
                      onChange={(e) =>
                        setLoginFormData({ ...loginFormData, email: e.target.value })
                      }
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginFormData.password}
                      onChange={(e) =>
                        setLoginFormData({ ...loginFormData, password: e.target.value })
                      }
                      required
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember Me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-primary hover:text-primary/80"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>

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
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Create Account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign up to get started
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Fullname */}
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Fullname</Label>
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="Enter your fullname"
                        value={signupFormData.fullname}
                        onChange={(e) => handleSignupInputChange("fullname", e.target.value)}
                        onBlur={(e) => validateField("fullname", e.target.value)}
                        className={signupErrors.fullname ? "border-destructive" : ""}
                      />
                      {signupErrors.fullname && (
                        <p className="text-sm text-destructive">{signupErrors.fullname}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupFormData.email}
                        onChange={(e) => handleSignupInputChange("email", e.target.value)}
                        onBlur={(e) => validateField("email", e.target.value)}
                        className={signupErrors.email ? "border-destructive" : ""}
                      />
                      {signupErrors.email && (
                        <p className="text-sm text-destructive">{signupErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signupFormData.password}
                          onChange={(e) => handleSignupInputChange("password", e.target.value)}
                          onBlur={(e) => validateField("password", e.target.value)}
                          className={signupErrors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {signupErrors.password && (
                        <p className="text-sm text-destructive">{signupErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Mobile */}
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your mobile"
                        value={signupFormData.mobile}
                        onChange={(e) => handleSignupInputChange("mobile", e.target.value)}
                        onBlur={(e) => validateField("mobile", e.target.value)}
                        className={signupErrors.mobile ? "border-destructive" : ""}
                      />
                      {signupErrors.mobile && (
                        <p className="text-sm text-destructive">{signupErrors.mobile}</p>
                      )}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={signupFormData.username}
                        onChange={(e) => handleSignupInputChange("username", e.target.value)}
                        onBlur={(e) => validateField("username", e.target.value)}
                        className={signupErrors.username ? "border-destructive" : ""}
                      />
                      {signupErrors.username && (
                        <p className="text-sm text-destructive">{signupErrors.username}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Enter your confirm password"
                          value={signupFormData.confirmPassword}
                          onChange={(e) => handleSignupInputChange("confirmPassword", e.target.value)}
                          onBlur={(e) => validateField("confirmPassword", e.target.value)}
                          className={signupErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {signupErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{signupErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Copyright */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © All Rights Reserved at TradingPanel. 2025
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-primary opacity-90">
          <div className="flex h-full items-center justify-center p-12">
            <div className="text-center space-y-6 text-white">
              <h2 className="text-4xl font-bold">Welcome Back!</h2>
              <p className="text-lg opacity-90">
                Manage your trading portfolio with ease
              </p>
              <div className="mt-8 flex items-center justify-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
};

export default Auth;
