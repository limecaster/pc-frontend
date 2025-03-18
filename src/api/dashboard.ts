import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Account API calls
export const getProfile = async () => {
    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return response.json();
};

export const updateProfile = async (profileData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
};

export const changePassword = async (passwordData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
    }

    return true;
};

export const getAddresses = async () => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch addresses");
    }

    return response.json();
};

export const addAddress = async (addressData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add address");
    }

    return response.json();
};

export const updateAddress = async (id: any, addressData: any) => {
    const response = await fetch(
        `${API_URL}/dashboard/account/addresses/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(addressData),
        },
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update address");
    }

    return response.json();
};

export const deleteAddress = async (id: any) => {
    const response = await fetch(
        `${API_URL}/dashboard/account/addresses/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        },
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete address");
    }

    return true;
};

// Overview API calls
export const getDashboardOverview = async () => {
    const response = await fetch(`${API_URL}/dashboard/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard overview");
    }

    return response.json();
};

/**
 * Fetches summary statistics for the admin dashboard
 */
export async function fetchDashboardSummary() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/dashboard/summary`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch dashboard summary: ${response.status}`,
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        // Return default object with zeros to prevent UI errors
        return {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            salesChange: "0%",
            ordersChange: "0%",
            customersChange: "0%",
            productsChange: "0%",
        };
    }
}

/**
 * Fetches sales data for charts
 * @param period - The time period to fetch data for (e.g., 'week', 'month', 'year')
 */
export async function fetchSalesData(period = "week") {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/dashboard/sales-data?period=${period}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch sales data: ${response.status}`,
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching sales data:", error);
        // Return empty arrays to prevent UI errors
        return { dates: [], sales: [] };
    }
}

/**
 * Fetches product category distribution
 */
export async function fetchProductCategories() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/dashboard/product-categories`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch product categories: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product categories:", error);
        // Return empty arrays to prevent UI errors
        return { categories: [], counts: [] };
    }
}

/**
 * Fetches order status distribution
 */
export async function fetchOrderStatuses() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/dashboard/order-statuses`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch order statuses: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching order statuses:", error);
        // Return empty arrays to prevent UI errors
        return { statuses: [], counts: [] };
    }
}

/**
 * Fetches recent orders for display on dashboard
 * @param limit Number of orders to fetch
 */
export async function fetchRecentOrders(limit = 5) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/dashboard/recent-orders?limit=${limit}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch recent orders: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        return { orders: [] };
    }
}

/**
 * Fetches customer growth data
 */
export async function fetchCustomerGrowth(period = "year") {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/dashboard/customer-growth?period=${period}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch customer growth: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching customer growth:", error);
        return { dates: [], counts: [] };
    }
}

/**
 * Fetches top selling products
 */
export async function fetchTopProducts(limit = 10, period = "month") {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/dashboard/top-products?limit=${limit}&period=${period}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch top products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching top products:", error);
        return { products: [] };
    }
}
