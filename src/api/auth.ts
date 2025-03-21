import { API_URL } from "@/config/constants";

/**
 * Checks if the token needs to be refreshed and refreshes it if needed
 * @returns Promise that resolves when the refresh check is complete
 */
export const refreshTokenIfNeeded = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
        return;
    }

    // Check if token needs refresh (optional: use jwt-decode to check expiry)
    try {
        // Simple check - we'll just attempt to refresh if we have both tokens
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);

                // Save new refresh token if provided
                if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                }
            }
        } else if (response.status === 401) {
            // Invalid refresh token, clear authentication
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");

            // Handle logout through the global function
            handleAuthError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
    }
};

/**
 * Global handler for authentication errors
 * This will be called from all API responses that encounter 401 errors
 * @param message Optional custom error message
 */
export const handleAuthError = (
    message = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
): void => {
    // Store the error message in sessionStorage to be picked up by the auth page
    sessionStorage.setItem("auth_error", message);

    // Clear user data immediately
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Only redirect if we're not already on the authentication page
    const currentPath = window.location.pathname;
    if (!currentPath.includes("/authenticate")) {
        window.location.href = "/authenticate";
    }
};

/**
 * Creates a fetch wrapper that handles auth errors automatically
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the fetch result
 */
export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
): Promise<Response> => {
    const response = await fetch(url, options);

    // If we get a 401 Unauthorized, handle the auth error
    if (response.status === 401) {
        handleAuthError();
    }

    return response;
};

/**
 * Validates the JWT token format
 * @returns boolean indicating if token format appears valid
 */
export const validateTokenFormat = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Basic check: JWT tokens typically have 3 parts separated by dots
    // and start with "eyJ" (base64 encoding of '{"')
    const tokenParts = token.split(".");
    return tokenParts.length === 3 && token.startsWith("eyJ");
};

/**
 * Customer login function
 * @returns Promise with login response
 */
export async function customerLogin(credentials: {
    username: string;
    password: string;
}) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `Login failed: ${response.status}`,
            );
        }

        const data = await response.json();

        // Store token and user data in localStorage if successful
        if (data.access_token && data.user) {
            localStorage.setItem("token", data.access_token);
            if (data.refresh_token) {
                localStorage.setItem("refreshToken", data.refresh_token);
            }
            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...data.user,
                    role: "customer", // Ensure the role is set correctly
                }),
            );
        }

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

/**
 * Check if a user has staff privileges (either STAFF or ADMIN role)
 * @param role The user's role
 * @returns Boolean indicating if user has staff access
 */
export function hasStaffAccess(role: string): boolean {
    return role === "staff";
}

/**
 * Unified login function that works for all user types
 * @returns Promise with login response including user role
 */
export async function unifiedLogin(credentials: {
    username: string;
    password: string;
}) {
    try {
        const response = await fetch(`${API_URL}/auth/unified-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: "Failed to parse error response" }));
            console.error("Login failed:", response.status, errorData);
            throw new Error(
                errorData.message ||
                    `Login failed with status: ${response.status}`,
            );
        }

        const data = await response.json();

        // Store token and user data in localStorage if successful
        if (data.access_token && data.user) {
            localStorage.setItem("token", data.access_token);

            if (data.refresh_token) {
                localStorage.setItem("refreshToken", data.refresh_token);
            }

            localStorage.setItem("user", JSON.stringify(data.user));
        } else {
            console.error("Login response missing token or user data");
            throw new Error("Login response is incomplete");
        }

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

/**
 * Get authentication headers for authenticated API requests
 * @returns Headers object with Authorization token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    // First check if token needs refreshing
    await refreshTokenIfNeeded();

    // Get the current token
    const token = localStorage.getItem("token");

    // Return headers object with Authorization if token exists
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    // Return default headers if no token
    return {
        "Content-Type": "application/json",
    };
}
