import { API_URL } from "@/config/constants";

/**
 * Get the user's wishlist
 * @returns Promise with the wishlist items
 */
export async function getWishlist() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/wishlist`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed. Please log in again.");
            }
            const data = await response.json();
            throw new Error(
                data.message ||
                    `Failed to retrieve wishlist: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting wishlist:", error);
        throw error;
    }
}

/**
 * Add a product to the wishlist
 * @param productId - The ID of the product to add
 * @returns Promise with the response
 */
export async function addToWishlist(productId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/wishlist/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        // Log the full error response for debugging
        if (!response.ok) {
            console.error("Failed to add to wishlist. Full error:", data);
            throw new Error(
                data.message || "Failed to add product to wishlist",
            );
        }

        return data;
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
    }
}

/**
 * Remove a product from the wishlist
 * @param productId The ID of the product to remove
 * @returns Promise with the updated wishlist
 */
export async function removeFromWishlist(productId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(
            `${API_URL}/wishlist/remove/${productId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to remove wishlist item");
        }

        return await response.json();
    } catch (error) {
        console.error("Error removing wishlist item:", error);
        throw error;
    }
}

/**
 * Checks if a product is in the wishlist
 * @param productId The ID of the product to check
 * @returns Promise with boolean result
 */
export async function isInWishlist(productId: string): Promise<boolean> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            return false;
        }

        const response = await fetch(`${API_URL}/wishlist/check/${productId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();
        return result.inWishlist;
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return false;
    }
}
