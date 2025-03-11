import { API_URL } from "@/config/constants";

/**
 * Get all orders pending approval
 * @returns Promise with pending orders
 */
export async function getPendingApprovalOrders() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Changed from /orders/admin/pending-approval to /staff/pending-orders
        const response = await fetch(`${API_URL}/staff/pending-orders`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message ||
                    `Failed to get pending orders: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting pending orders:", error);
        throw error;
    }
}

/**
 * Approve an order
 * @param orderId ID of the order to approve
 * @returns Promise with the updated order
 */
export async function approveOrder(orderId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Changed from /orders/${orderId}/status to /staff/orders/${orderId}/approve
        const response = await fetch(
            `${API_URL}/staff/orders/${orderId}/approve`,
            {
                method: "POST", // Changed from PATCH to POST based on staff controller
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message || `Failed to approve order: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error approving order:", error);
        throw error;
    }
}

/**
 * Reject an order
 * @param orderId ID of the order to reject
 * @param reason Reason for rejection
 * @returns Promise with the updated order
 */
export async function rejectOrder(orderId: string, reason: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/staff/orders/${orderId}/reject`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason }),
            },
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message || `Failed to reject order: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error rejecting order:", error);
        throw error;
    }
}

/**
 * Get staff profile information
 * @returns Promise with staff profile data
 */
export async function getStaffProfile() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/staff/profile`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message ||
                    `Failed to get staff profile: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting staff profile:", error);
        throw error;
    }
}
