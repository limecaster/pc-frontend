import { API_URL } from "@/config/constants";
import { getAuthHeaders } from "./auth";

/**
 * Get order history for the current user
 * @returns Promise with the order history
 */
export async function getOrderHistory() {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/orders/user/history`, {
            headers,
        });

        // If response is not OK, try to get more detailed error info
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
                console.error("Error response body:", errorText);
            } catch (e) {
                errorText = "Could not read error response";
            }

            throw new Error(
                `Failed to get order history: ${response.status} - ${errorText}`,
            );
        }

        const data = await response.json();

        return data.orders;
    } catch (error) {
        console.error("Error fetching order history:", error);
        // Return empty array instead of throwing to avoid breaking the dashboard
        return [];
    }
}

/**
 * Get order details by ID
 * @param orderId The ID of the order to fetch
 * @returns Promise with the order details
 */
export async function getOrderDetails(orderId: string) {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get order details: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching order details for ${orderId}:`, error);
        throw error;
    }
}
