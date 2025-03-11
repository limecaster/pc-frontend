import { API_URL } from "@/config/constants";


/**
 * Add a single product to the cart
 * @param productId - The ID of the product to add
 * @param quantity - The quantity to add (default: 1)
 * @returns Promise with the response
 */
export async function addToCart(productId: string, quantity: number = 1) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity }),
            // Don't use credentials: 'include' when sending auth in header
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add product to cart");
        }

        return data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

/**
 * Adds multiple products to the cart
 * @param productIds Array of product IDs to add to cart
 * @returns Promise with the updated cart
 */
export async function addMultipleToCart(productIds: string[]): Promise<any> {
    try {
        // Get the token exactly as stored
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log(
            "Token being sent (first few chars):",
            token.substring(0, 15) + "...",
        );

        // Send token exactly as stored from the backend
        const response = await fetch(`${API_URL}/cart/add-multiple`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productIds }),
            credentials: "omit",
        });

        // Handle response
        if (!response.ok) {
            // Try to get more error details if available
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage =
                    errorData.message ||
                    `Error: ${response.status} ${response.statusText}`;
                console.error("Error details from server:", errorData);

                // If the user account was deleted or is invalid
                if (
                    errorMessage.includes("User not found") ||
                    errorMessage.includes("account deleted") ||
                    errorMessage.includes("inactive")
                ) {
                    // Force logout on the frontend
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            } catch {
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }

            if (response.status === 401) {
                throw new Error("Authentication failed. Please log in again.");
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding multiple products to cart:", error);
        throw error;
    }
}

// Ensure getCart is also using a consistent pattern
export async function getCart() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed. Please log in again.");
            }
            
            try {
                const data = await response.json();
                throw new Error(data.message || `Failed to retrieve cart: ${response.status}`);
            } catch (parseError) {
                throw new Error(`Failed to retrieve cart: ${response.status}`);
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting cart:", error);
        throw error;
    }
}

/**
 * Updates the quantity of an item in the cart
 * @param productId The ID of the product to update
 * @param quantity The new quantity
 * @returns Promise with the updated cart
 */
export async function updateCartItemQuantity(
    productId: string,
    quantity: number,
) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/cart/update-item`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to update cart item");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
    }
}

/**
 * Removes an item from the cart
 * @param productId The ID of the product to remove
 * @returns Promise with the updated cart
 */
export async function removeCartItem(productId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/cart/remove-item`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to remove cart item");
        }

        return await response.json();
    } catch (error) {
        console.error("Error removing cart item:", error);
        throw error;
    }
}

/**
 * Clears the entire cart
 * @returns Promise with the response
 */
export async function clearCart() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/cart/clear`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to clear cart");
        }

        return await response.json();
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}
