import { toast } from "sonner";

/**
 * Get the API base URL from environment variables
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
};

/**
 * Get the redirect URI from environment variables
 */
export const getRedirectUri = (): string => {
  return import.meta.env.VITE_REDIRECT_URI || "http://localhost:3000/callback";
};

/**
 * Clears all authentication data and redirects to login
 */
export const handleLogout = () => {
  // Clear all authentication data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("user");
  
  // Show toast notification
  toast.error("Your session has expired. Please login again.");
  
  // Redirect to login page
  window.location.href = "/auth";
};

/**
 * Checks if the response indicates token expiration or unauthorized access
 * and handles logout automatically
 */
export const checkTokenExpiration = (response: Response): boolean => {
  if (response.status === 401) {
    handleLogout();
    return true; // Token expired
  }
  return false; // Token is valid
};

/**
 * Enhanced fetch wrapper that automatically handles token expiration
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get access token for authorization if not already in headers
  if (!options.headers || !(options.headers as any)["Authorization"]) {
    const accessToken = localStorage.getItem("accessToken");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `${tokenType} ${accessToken}`,
      };
    }
  }

  // Ensure Content-Type is set for JSON requests
  if (options.body && typeof options.body === "string") {
    try {
      JSON.parse(options.body);
      options.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    } catch {
      // Not JSON, skip
    }
  }

  const response = await fetch(url, options);
  
  // Check for token expiration
  checkTokenExpiration(response);
  
  return response;
};

