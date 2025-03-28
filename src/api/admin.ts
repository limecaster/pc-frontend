import { API_URL } from "@/config/constants";

/**
 * Create the initial admin account with a security key
 * @returns Promise with the created admin data
 */
export async function createInitialAdmin(adminData: {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phoneNumber?: string;
    secretKey: string;
}) {
    try {
        const response = await fetch(`${API_URL}/admin/register/initial`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(adminData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to create admin account: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating initial admin:", error);
        throw error;
    }
}

/**
 * Create a new admin account (requires admin privileges)
 * @returns Promise with the created admin data
 */
export async function createAdmin(adminData: {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phoneNumber?: string;
}) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/admin/create-admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(adminData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to create admin: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating admin:", error);
        throw error;
    }
}

/**
 * Create a new staff account (requires admin privileges)
 * @returns Promise with the created staff data
 */
export async function createStaff(staffData: {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phoneNumber?: string;
}) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/admin/create-staff`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(staffData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to create staff: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating staff:", error);
        throw error;
    }
}

/**
 * Admin login function
 * @returns Promise with login response
 */
export async function adminLogin(credentials: {
    username: string;
    password: string;
}) {
    try {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(credentials),
            // Remove credentials: 'include' if not using cookies
        });

        const responseText = await response.text(); // Get response as text first

        let data;
        try {
            // Try to parse the response as JSON
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
            throw new Error("Server returned an invalid response format");
        }

        // Handle server error response (may have 200 OK but error in body)
        if (data.success === false || data.message) {
            console.error("Admin login failed with message:", data.message);
            throw new Error(data.message || "Authentication failed");
        }

        if (!response.ok) {
            console.error("Admin login failed:", response.status, data);
            throw new Error(
                data.message || `Login failed with status: ${response.status}`,
            );
        }

        // Store token and user data in localStorage if successful
        if (data.access_token && data.user) {
            localStorage.setItem("token", data.access_token);

            // Store refresh token if available
            if (data.refresh_token) {
                localStorage.setItem("refreshToken", data.refresh_token);
            }

            // Make sure role is explicitly set
            const userData = {
                ...data.user,
                role: data.user.role || "admin", // Ensure the role is set correctly
            };

            localStorage.setItem("user", JSON.stringify(userData));
        } else {
            console.error("Login response missing token or user data:", data);
            throw new Error("Login response is incomplete");
        }

        return data;
    } catch (error) {
        console.error("Admin login error:", error);
        throw error;
    }
}

/**
 * Staff login function
 * @returns Promise with login response
 */
export async function staffLogin(credentials: {
    username: string;
    password: string;
}) {
    try {
        const response = await fetch(`${API_URL}/auth/staff/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            // Add credentials: 'include' for cookies if needed
        });

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: "Failed to parse error response" }));
            console.error("Staff login failed:", response.status, errorData);
            throw new Error(
                errorData.message ||
                    `Login failed with status: ${response.status}`,
            );
        }

        const data = await response.json();

        // Store token and user data in localStorage if successful
        if (data.access_token && data.user) {
            localStorage.setItem("token", data.access_token);

            // Store refresh token if available
            if (data.refresh_token) {
                localStorage.setItem("refreshToken", data.refresh_token);
            }

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...data.user,
                    role: "staff", // Ensure the role is set correctly
                }),
            );
        }

        return data;
    } catch (error) {
        console.error("Staff login error:", error);
        throw error;
    }
}
