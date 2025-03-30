import { API_URL } from "@/config/constants";
import { trackOrderCreated } from "./events";

/**
 * Create a new order for a logged-in user
 * @param orderData Order data to be created
 * @returns Promise with the created order
 */
export async function createOrder(orderData: any): Promise<any> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("You must be logged in to create an order");
        }

        console.log(
            "Creating order with data:",
            JSON.stringify(orderData, null, 2),
        );

        // Use the exact endpoint that's implemented in checkout.controller.ts
        const response = await fetch(`${API_URL}/checkout/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        // Always parse the response body before checking response.ok
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            console.error("Error parsing JSON response:", e);
            responseData = {
                success: false,
                message: "Invalid response from server",
            };
        }

        if (!response.ok) {
            // Log the full error response for debugging
            console.error("Order creation failed:", responseData);

            // Extract the most specific error message available
            let errorMessage = "Failed to create order";

            // Handle validation error arrays
            if (responseData.message && Array.isArray(responseData.message)) {
                errorMessage = responseData.message.join(", ");
                // Also log the complete detailed error for debugging
                console.error("Validation errors:", responseData.message);
            } else if (responseData.message) {
                errorMessage = responseData.message;
            } else if (responseData.error) {
                errorMessage = responseData.error;
            }

            throw new Error(errorMessage);
        }

        // If successful and we have an order ID, try to track the order creation
        if (responseData.success && responseData.order?.id) {
            try {
                await trackOrderCreated(
                    responseData.order.id.toString(),
                    responseData.order,
                );
            } catch (trackingError) {
                console.warn("Failed to track order creation:", trackingError);
                // Non-critical, so we continue without throwing
            }
        }

        return responseData;
    } catch (error) {
        console.error("Error in createOrder:", error);

        // Return a structured error response
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error creating order",
        };
    }
}

/**
 * Create a new order for a guest user
 * @param orderData Order data to be created
 * @returns Promise with the created order
 */
export async function createGuestOrder(orderData: any): Promise<any> {
    try {
        console.log(
            "Creating guest order with data:",
            JSON.stringify(orderData, null, 2),
        );

        // Use the exact endpoint that's implemented in checkout.controller.ts
        const response = await fetch(`${API_URL}/checkout/guest-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        // Always parse the response body before checking response.ok
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            console.error("Error parsing JSON response:", e);
            responseData = {
                success: false,
                message: "Invalid response from server",
            };
        }

        if (!response.ok) {
            console.error("Guest order creation failed:", responseData);

            // Extract the most specific error message available
            let errorMessage = "Failed to create guest order";

            // Handle validation error arrays
            if (responseData.message && Array.isArray(responseData.message)) {
                errorMessage = responseData.message.join(", ");
                // Also log the complete detailed error for debugging
                console.error("Validation errors:", responseData.message);
            } else if (responseData.message) {
                errorMessage = responseData.message;
            } else if (responseData.error) {
                errorMessage = responseData.error;
            }

            throw new Error(errorMessage);
        }

        // If successful and we have an order ID, try to track the order creation
        if (responseData.success && responseData.order?.id) {
            try {
                await trackOrderCreated(
                    responseData.order.id.toString(),
                    responseData.order,
                );
            } catch (trackingError) {
                console.warn("Failed to track order creation:", trackingError);
                // Non-critical, so we continue without throwing
            }
        }

        return responseData;
    } catch (error) {
        console.error("Error in createGuestOrder:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error creating guest order",
        };
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
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        } else {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers,
        });

        const data = await response.json();

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
