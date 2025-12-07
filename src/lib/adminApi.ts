import { toast } from "sonner";
import { getApiBaseUrl } from "./api";

export const handleAdminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminTokenType");
  localStorage.removeItem("adminUser");
  toast.info("Admin session expired. Please log in again.");
  window.location.href = "/admin-login"; // Redirect to admin login page
};

export const checkAdminTokenExpiration = (response: Response): boolean => {
  if (response.status === 401) {
    handleAdminLogout();
    return true;
  }
  return false;
};

export const adminApiFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  const adminToken = localStorage.getItem("adminToken");
  const tokenType = localStorage.getItem("adminTokenType") || "Bearer";

  const headers = {
    "Content-Type": "application/json",
    ...(adminToken && { Authorization: `${tokenType} ${adminToken}` }),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (checkAdminTokenExpiration(response)) {
    // If token expired, handleAdminLogout has already been called and redirected
    // We return a dummy response here to prevent further processing in the calling function
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  }

  return response;
};

