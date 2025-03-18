import { API_URL } from "@/config/constants";

/**
 * Create a new order for a logged-in user
 * @param orderData Order data to be created
 * @returns Promise with the created order
 */
export async function createOrder(orderData: any) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/checkout/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error || `Failed to create order: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

/**
 * Create a new order for a guest user
 * @param orderData Order data to be created
 * @returns Promise with the created order
 */
export async function createGuestOrder(orderData: any) {
    try {
        const response = await fetch(`${API_URL}/checkout/create-guest-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error ||
                    `Failed to create guest order: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating guest order:", error);
        throw error;
    }
}

/**
 * Process payment for an order
 * @param paymentData Payment data including order information
 * @returns Promise with payment link data
 */
export async function processPayment(paymentData: any) {
    try {
        const response = await fetch(`${API_URL}/payment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error || `Failed to process payment: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error processing payment:", error);
        throw error;
    }
}

/**
 * Check status of a payment
 * @param paymentId PayOS payment ID to check
 * @returns Promise with payment status
 */
export async function checkPaymentStatus(paymentId: string) {
    try {
        const response = await fetch(`${API_URL}/payment/status/${paymentId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error ||
                    `Failed to check payment status: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error checking payment status:", error);
        throw error;
    }
}

/**
 * Get order details by ID
 * @param orderId Order ID to fetch
 * @returns Promise with order details
 */
export async function getOrderDetails(orderId: string | number) {
    try {
        console.log(`Fetching order details for ID: ${orderId}`);

        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
            console.log("Token available, adding to Authorization header");
        } else {
            console.log("No token available, proceeding without Authorization");
        }

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers,
        });

        console.log(`Order details API response status: ${response.status}`);

        const data = await response.json();
        console.log("Order details API response data:", data);

        if (!response.ok) {
            throw new Error(
                data.message ||
                    `Failed to fetch order details: ${response.status}`,
            );
        }

        return data;
    } catch (error) {
        console.error("Error fetching order details:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error fetching order details",
        };
    }
}

/**
 * Get order history for the authenticated user
 * @returns Promise with the user's order history
 */
export async function getUserOrderHistory() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/orders/user/history`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message ||
                    `Failed to retrieve order history: ${response.status}`,
            );
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting order history:", error);
        throw error;
    }
}
