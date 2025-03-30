import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Updated to match OrderStatusBadge lowercase format
export type OrderStatus =
    | "pending_approval"
    | "approved"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "payment_success";

// Backend uses uppercase format - this maps frontend to backend format
export const mapStatusToBackend = (status: OrderStatus): string => {
    const mappings: Record<OrderStatus, string> = {
        pending_approval: "PENDING_APPROVAL",
        approved: "APPROVED",
        processing: "PROCESSING",
        shipped: "SHIPPED",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
        refunded: "REFUNDED",
        payment_success: "PAYMENT_SUCCESS",
    };
    return mappings[status];
};

// This maps backend to frontend format
export const mapStatusFromBackend = (status: string): OrderStatus => {
    const uppercaseStatus = status.toUpperCase();
    const mappings: Record<string, OrderStatus> = {
        PENDING_APPROVAL: "pending_approval",
        APPROVED: "approved",
        PROCESSING: "processing",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
        REFUNDED: "refunded",
        PAYMENT_SUCCESS: "payment_success",
    };
    return mappings[uppercaseStatus] || "pending_approval";
};

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
}

export interface Order {
    id: number;
    orderNumber: string;
    orderDate: string;
    status: OrderStatus;
    total: number;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
    items: OrderItem[];
}

/**
 * Fetch all pending approval orders
 */
export async function fetchPendingApprovalOrders() {
    try {
        const response = await fetch(
            `${API_URL}/orders/admin/pending-approval`,
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
        console.error("Error fetching pending approval orders:", error);
        throw error;
    }
}

/**
 * Fetch order by ID
 */
export async function fetchOrderById(id: number) {
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.order;
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        throw error;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, status: OrderStatus) {
    try {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: mapStatusToBackend(status) }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.order;
    } catch (error) {
        console.error(`Error updating order ${id} status:`, error);
        throw error;
    }
}

/**
 * Fetch all orders with pagination and filtering
 */
export async function fetchAllOrders({
    page = 1,
    limit = 10,
    status = "",
    search = "",
    startDate = "",
    endDate = "",
    sortBy = "orderDate",
    sortOrder = "DESC",
}: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
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
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await fetch(
            `${API_URL}/orders/admin/all?${params.toString()}`,
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
            orders: data.orders || [],
            total: data.total || 0,
            pages: data.pages || 1,
            currentPage: data.currentPage || page,
        };
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
}
