import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetch, checkTokenExpiration } from "@/lib/api";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Lock, 
  CreditCard,
  Save,
  Camera,
  Edit,
  Loader2
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userInitials, setUserInitials] = useState<string>("SK");
  const [memberSince, setMemberSince] = useState<string>("January 2024");
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    bio: "",
  });

  // Convert date from API format (DD/MM/YYYY) to input format (YYYY-MM-DD)
  const convertDateToInput = (dateStr: string): string => {
    if (!dateStr) return "";
    // If already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    // If in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  // Convert date from input format (YYYY-MM-DD) to API format (DD/MM/YYYY)
  const convertDateToAPI = (dateStr: string): string => {
    if (!dateStr) return "";
    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  // Fetch profile data from API
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const tokenType = localStorage.getItem("tokenType") || "Bearer";

      if (!accessToken) {
        // Fallback to localStorage if no token
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          loadUserDataFromStorage(user);
        }
        setIsLoading(false);
        return;
      }

      const response = await apiFetch(
        `http://localhost:3000/api/users/profile`,
        {
          method: "GET",
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const user = data.data;
        loadUserDataFromStorage(user);
      } else {
        // Fallback to localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          loadUserDataFromStorage(user);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          loadUserDataFromStorage(user);
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data from storage/API response
  const loadUserDataFromStorage = (user: any) => {
    // Extract user information
    const fullName = user.fullname || user.name || user.username || "";
    const email = user.email || "";
    const phone = user.mobile || user.phone || "";
    const address = user.address || "";
    const dateOfBirth = user.dateOfBirth || user.dob || "";
    const bio = user.bio || "";
    
    // Generate initials
    const initials = fullName
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
    setUserInitials(initials || "SK");
    
    // Calculate member since date
    if (user.createdAt) {
      const createdDate = new Date(user.createdAt);
      const month = createdDate.toLocaleString('default', { month: 'long' });
      const year = createdDate.getFullYear();
      setMemberSince(`${month} ${year}`);
    } else if (user.created_at) {
      const createdDate = new Date(user.created_at);
      const month = createdDate.toLocaleString('default', { month: 'long' });
      const year = createdDate.getFullYear();
      setMemberSince(`${month} ${year}`);
    }
    
    // Update profile data
    setProfileData({
      fullName,
      email,
      phone,
      address,
      dateOfBirth: convertDateToInput(dateOfBirth),
      bio,
    });
  };

  // Load user data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    tradeAlerts: true,
    priceAlerts: true,
    orderUpdates: true,
  });

  const handleProfileUpdate = async () => {
    setIsSaving(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const tokenType = localStorage.getItem("tokenType") || "Bearer";

      if (!accessToken) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      // Convert date format from YYYY-MM-DD to DD/MM/YYYY for API
      const dateOfBirthAPI = convertDateToAPI(profileData.dateOfBirth);

      // Call update profile API
      const response = await apiFetch(
        `http://localhost:3000/api/users/profile`,
        {
          method: "PUT",
          body: JSON.stringify({
            fullname: profileData.fullName,
            email: profileData.email,
            mobile: profileData.phone,
            dateOfBirth: dateOfBirthAPI,
            address: profileData.address,
            bio: profileData.bio,
          }),
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (data.success) {
        toast.success(data.message || "Profile updated successfully");
        
        // Update localStorage user data if returned
        if (data.data) {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            const updatedUser = { ...user, ...data.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
        
        setIsEditing(false);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const validatePasswordField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...passwordErrors };

    switch (field) {
      case "currentPassword":
        if (!value.trim()) {
          errors.currentPassword = "Current password is required";
        } else {
          delete errors.currentPassword;
        }
        break;

      case "newPassword":
        if (!value.trim()) {
          errors.newPassword = "New password is required";
        } else if (value.length < 8) {
          errors.newPassword = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.newPassword = "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.newPassword = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*[0-9])/.test(value)) {
          errors.newPassword = "Password must contain at least one number";
        } else {
          delete errors.newPassword;
        }
        // Also validate confirm password if it exists
        if (securityData.confirmPassword) {
          if (value !== securityData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          } else {
            delete errors.confirmPassword;
          }
        }
        break;

      case "confirmPassword":
        if (!value.trim()) {
          errors.confirmPassword = "Please confirm your password";
        } else if (securityData.newPassword !== value) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;
    }

    setPasswordErrors(errors);
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    // Current password validation
    if (!securityData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    // New password validation
    if (!securityData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (securityData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(securityData.newPassword)) {
      errors.newPassword = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(securityData.newPassword)) {
      errors.newPassword = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(securityData.newPassword)) {
      errors.newPassword = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!securityData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (securityData.newPassword !== securityData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    // Validate all fields
    if (!validatePasswordForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Get access token for authorization
      const accessToken = localStorage.getItem("accessToken");
      const tokenType = localStorage.getItem("tokenType") || "Bearer";

      if (!accessToken) {
        toast.error("You must be logged in to change your password");
        return;
      }

      // Call change password API
      const response = await apiFetch(
        `http://localhost:3000/api/users/change-password`,
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword: securityData.currentPassword,
            newPassword: securityData.newPassword,
            confirmNewPassword: securityData.confirmPassword,
          }),
        }
      );

      // Check if token expired (will auto-logout)
      if (checkTokenExpiration(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      if (data.success) {
        toast.success(data.message || "Password changed successfully");
        
        // Reset password fields
        setSecurityData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactorEnabled: securityData.twoFactorEnabled,
        });
        setPasswordErrors({});
      } else {
        throw new Error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block lg:w-64 lg:border-r">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="w-full p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account settings and preferences
                  </p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-6">
                    <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and profile information
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="icon"
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                            variant="secondary"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{profileData.fullName || "User"}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.email || "No email"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Member since {memberSince}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, fullName: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          disabled={!isEditing || isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          disabled={!isEditing || isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) =>
                            setProfileData({ ...profileData, dateOfBirth: e.target.value })
                          }
                          disabled={!isEditing || isSaving}
                          placeholder="YYYY-MM-DD"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({ ...profileData, address: e.target.value })
                          }
                          disabled={!isEditing || isSaving}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({ ...profileData, bio: e.target.value })
                          }
                          disabled={!isEditing || isSaving}
                          rows={3}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleProfileUpdate}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => {
                          setSecurityData({ ...securityData, currentPassword: e.target.value });
                          validatePasswordField("currentPassword", e.target.value);
                        }}
                        onBlur={(e) => validatePasswordField("currentPassword", e.target.value)}
                        placeholder="Enter current password"
                        disabled={isChangingPassword}
                        className={passwordErrors.currentPassword ? "border-destructive" : ""}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => {
                          setSecurityData({ ...securityData, newPassword: e.target.value });
                          validatePasswordField("newPassword", e.target.value);
                        }}
                        onBlur={(e) => validatePasswordField("newPassword", e.target.value)}
                        placeholder="Enter new password"
                        disabled={isChangingPassword}
                        className={passwordErrors.newPassword ? "border-destructive" : ""}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => {
                          setSecurityData({ ...securityData, confirmPassword: e.target.value });
                          validatePasswordField("confirmPassword", e.target.value);
                        }}
                        onBlur={(e) => validatePasswordField("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        disabled={isChangingPassword}
                        className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                    <Button 
                      onClick={handlePasswordChange} 
                      className="w-full sm:w-auto"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Require a verification code in addition to your password
                        </p>
                      </div>
                      <Button
                        variant={securityData.twoFactorEnabled ? "default" : "outline"}
                        onClick={() =>
                          setSecurityData({
                            ...securityData,
                            twoFactorEnabled: !securityData.twoFactorEnabled,
                          })
                        }
                      >
                        {securityData.twoFactorEnabled ? "Enabled" : "Enable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about your account activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Button
                          variant={notificationSettings.emailNotifications ? "default" : "outline"}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: !notificationSettings.emailNotifications,
                            })
                          }
                        >
                          {notificationSettings.emailNotifications ? "On" : "Off"}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Button
                          variant={notificationSettings.smsNotifications ? "default" : "outline"}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: !notificationSettings.smsNotifications,
                            })
                          }
                        >
                          {notificationSettings.smsNotifications ? "On" : "Off"}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Trade Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified about trade executions
                          </p>
                        </div>
                        <Button
                          variant={notificationSettings.tradeAlerts ? "default" : "outline"}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              tradeAlerts: !notificationSettings.tradeAlerts,
                            })
                          }
                        >
                          {notificationSettings.tradeAlerts ? "On" : "Off"}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Price Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when prices reach your targets
                          </p>
                        </div>
                        <Button
                          variant={notificationSettings.priceAlerts ? "default" : "outline"}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              priceAlerts: !notificationSettings.priceAlerts,
                            })
                          }
                        >
                          {notificationSettings.priceAlerts ? "On" : "Off"}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified about order status changes
                          </p>
                        </div>
                        <Button
                          variant={notificationSettings.orderUpdates ? "default" : "outline"}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              orderUpdates: !notificationSettings.orderUpdates,
                            })
                          }
                        >
                          {notificationSettings.orderUpdates ? "On" : "Off"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;

