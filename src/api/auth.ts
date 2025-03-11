import { API_URL } from "@/config/constants";

// ...existing code...

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
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
    }
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
 * Unified login function that works for all user types
 * @returns Promise with login response including user role
 */
export async function unifiedLogin(credentials: {
    username: string;
    password: string;
}) {
    try {
        console.log(`Attempting unified login for: ${credentials.username}`);

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
        console.log("Login successful, received token and user data");

        // Store token and user data in localStorage if successful
        if (data.access_token && data.user) {
            localStorage.setItem("token", data.access_token);

            if (data.refresh_token) {
                localStorage.setItem("refreshToken", data.refresh_token);
            }

            console.log("Storing user data with role:", data.user.role);
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

// ...existing code...
