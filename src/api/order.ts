import { API_URL } from "@/config/constants";

/**
 * Cancel an order
 * @param orderId ID of the order to cancel
 * @returns Promise with cancellation response
 */
export async function cancelOrder(orderId: string) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `Failed to cancel order: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
}

/**
 * Initiate payment for an approved order
 * @param orderId ID of the order to pay for
 * @returns Promise with payment initiation response
 */
export async function initiateOrderPayment(orderId: string) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `Failed to initiate payment: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error initiating payment:", error);
    throw error;
  }
}
