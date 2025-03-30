import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export interface Customer {
    id: number;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    status: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    latestLogin: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
}

/**
 * Fetch all customers with pagination and filtering
 */
export async function fetchAllCustomers({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "DESC",
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
} = {}) {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        if (status) params.append("status", status);
        if (search) params.append("search", search);

        const response = await fetch(
            `${API_URL}/customers/admin/all?${params.toString()}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();

        return {
            customers: data.customers || [],
            total: data.total || 0,
            pages: data.pages || 1,
            currentPage: data.currentPage || page,
        };
    } catch (error) {
        console.error("Error fetching all customers:", error);
        throw error;
    }
}

/**
 * Fetch customer by ID
 */
export async function fetchCustomerById(id: number) {
    try {
        const response = await fetch(`${API_URL}/customers/admin/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.customer;
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        throw error;
    }
}

/**
 * Update customer status (activate/deactivate)
 */
export async function updateCustomerStatus(id: number, status: string) {
    try {
        const response = await fetch(
            `${API_URL}/customers/admin/${id}/status`,
            {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ status }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.customer;
    } catch (error) {
        console.error(`Error updating customer ${id} status:`, error);
        throw error;
    }
}

/**
 * Get customer orders
 */
export async function fetchCustomerOrders(customerId: number) {
    try {
        const response = await fetch(
            `${API_URL}/orders/admin/customer/${customerId}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error(`Error fetching customer ${customerId} orders:`, error);
        throw error;
    }
}
