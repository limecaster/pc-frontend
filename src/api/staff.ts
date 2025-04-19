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

/**
 * Get orders pending approval
 */
export async function getPendingOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    try {
        const response = await fetch(
            `${API_URL}/orders/admin/pending-approval`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || `HTTP error! status: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching pending orders:", error);
        throw error;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: number, status: string) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || `HTTP error! status: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

/**
 * Get all orders with optional filtering
 */
export async function getAllOrders(filters = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
    });

    try {
        const response = await fetch(
            `${API_URL}/orders/admin/all?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || `HTTP error! status: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
}

/**
 * Get order details by ID (admin/staff version with full details)
 */
export async function getOrderDetails(orderId: number) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || `HTTP error! status: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching order details:", error);
        throw error;
    }
}

/**
 * Get order details by ID for staff management
 */
export async function getStaffOrderDetails(orderId: string | number) {
    try {
        // Ensure we have authentication
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Use the staff-specific endpoint
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData.message || `HTTP error! status: ${response.status}`;
            console.error(`Order detail API error: ${errorMessage}`, errorData);
            return {
                success: false,
                message: errorMessage,
                error: errorData,
            };
        }

        const data = await response.json();

        // Get the order object (handling both possible response formats)
        const orderData = data.order || data;

        // Normalize the order structure based on the actual API response
        const normalizedOrder = {
            id: orderData.id,
            orderNumber: orderData.orderNumber || `#${orderData.id}`,
            status: orderData.status || "pending_approval",

            // Customer information
            customerId: orderData.customerId,
            customer: {
                id: orderData.customerId,
                firstname: orderData.customerName
                    ? orderData.customerName.split(" ").slice(-1).join(" ")
                    : "",
                lastname: orderData.customerName
                    ? orderData.customerName.split(" ").slice(0, -1).join(" ")
                    : "",
                email: orderData.customerEmail || "",
                phoneNumber: orderData.customerPhone || "",
            },
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,

            // Order details
            orderDate: orderData.orderDate
                ? new Date(orderData.orderDate)
                : new Date(),
            deliveryAddress: orderData.deliveryAddress || "",
            paymentMethod: orderData.paymentMethod || "Unknown",
            paymentStatus: orderData.paymentStatus || "Pending",
            notes: orderData.notes || "",

            // Financial information
            total: orderData.total || "0",
            subtotal: orderData.subtotal || orderData.total || "0",
            shippingFee: orderData.shippingFee || 0,
            discountAmount: orderData.discountAmount || "0",

            // Normalize items to match expected structure in OrderDetails component
            items: Array.isArray(orderData.items)
                ? orderData.items.map((item: any) => {
                      // If item already has a product property, keep it
                      if (item.product) {
                          return {
                              ...item,
                              id:
                                  item.id ||
                                  Math.random().toString(36).substring(7),
                              quantity: item.quantity || 1,
                              subPrice: item.subPrice || item.price || "0",
                          };
                      }

                      // Otherwise, transform flat structure to nested structure
                      return {
                          id:
                              item.id ||
                              Math.random().toString(36).substring(7),
                          quantity: item.quantity || 1,
                          subPrice: String(
                              Number(item.price || 0) * (item.quantity || 1),
                          ),
                          product: {
                              id: item.id || "",
                              name: item.name || "Unknown Product",
                              price: item.price || "0",
                              imageUrl: item.imageUrl,
                          },
                      };
                  })
                : [],

            // Timestamps
            createdAt: orderData.createdAt
                ? new Date(orderData.createdAt)
                : undefined,
            updatedAt: orderData.updatedAt
                ? new Date(orderData.updatedAt)
                : undefined,
        };

        return {
            success: true,
            order: normalizedOrder,
        };
    } catch (error) {
        console.error(`Error fetching order #${orderId} details:`, error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error fetching order details",
        };
    }
}
