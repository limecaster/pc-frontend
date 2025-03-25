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

        // // Add validation for quantity to prevent overflow issues
        // if (quantity > 100) {
        //     quantity = 100; // Hard cap at 100 items
        //     console.warn("Quantity limited to 100 units per product");
        // }

        // // Get product price to check for potential overflow
        // try {
        //     const productInfo = await getProductPrice(productId);
        //     if (productInfo && productInfo.price) {
        //         // Check if price * quantity would exceed database limits (99,999,999.99)
        //         const totalPrice = productInfo.price * quantity;
        //         if (totalPrice > 99999999) {
        //             // Find the maximum quantity that would be safe
        //             const safeQuantity = Math.floor(
        //                 99999999 / productInfo.price,
        //             );
        //             quantity = Math.min(quantity, Math.max(1, safeQuantity));
        //             console.warn(
        //                 `Quantity adjusted to ${quantity} to prevent numeric overflow`,
        //             );
        //         }
        //     }
        // } catch (priceError) {
        //     console.warn("Could not verify price safety limits:", priceError);
        // }

        // Add a retry mechanism for intermittent failures
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${API_URL}/cart/add`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productId,
                        quantity,
                    }),
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Authentication failed");
                    }
                    if (response.status === 400) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Invalid request");
                    }
                    if (response.status === 500) {
                        throw new Error(
                            "Server error - possible numeric overflow. Try reducing quantity.",
                        );
                    }
                    throw new Error(`Server error: ${response.status}`);
                }

                return await response.json();
            } catch (err) {
                attempts++;
                if (attempts === maxAttempts) throw err;
                // Wait before retrying (exponential backoff)
                await new Promise((r) => setTimeout(r, 500 * attempts));
            }
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

/**
 * Helper function to get product price for validation
 * @param productId The product ID to check
 * @returns Promise with the product price
 */
async function getProductPrice(
    productId: string,
): Promise<{ price: number } | null> {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        if (!response.ok) return null;

        const product = await response.json();
        return { price: product.price };
    } catch (error) {
        console.error("Error getting product price:", error);
        return null;
    }
}

/**
 * Add a single product to the cart (local storage + backend if logged in)
 * @param productId The ID of the product to add
 * @param quantity The quantity to add
 * @returns Promise with the updated cart
 */
export async function addToCartAndSync(
    productId: string,
    quantity: number = 1,
) {
    try {
        // First fetch the product to check stock
        const productResponse = await fetch(`${API_URL}/products/${productId}`);
        if (!productResponse.ok) {
            throw new Error("Failed to fetch product details");
        }

        const product = await productResponse.json();

        // Check if we have enough stock
        if (product.stock_quantity < quantity) {
            // Adjust quantity to available stock
            quantity = Math.max(1, product.stock_quantity);
        }

        // First update local storage cart
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Check if product already exists in cart
        const existingItemIndex = localCart.findIndex(
            (item: any) => item.id === productId,
        );

        if (existingItemIndex >= 0) {
            // Calculate new quantity but respect stock limits
            const newQuantity =
                localCart[existingItemIndex].quantity + quantity;
            localCart[existingItemIndex].quantity = Math.min(
                newQuantity,
                product.stock_quantity || Number.MAX_SAFE_INTEGER,
            );
            localCart[existingItemIndex].stock_quantity =
                product.stock_quantity; // Update stock info

            // Include category information when updating existing item
            if (
                product.category ||
                (product.categories && product.categories.length > 0)
            ) {
                localCart[existingItemIndex].category = product.category || "";
                localCart[existingItemIndex].categoryNames =
                    product.categories ||
                    (product.category ? [product.category] : []);
            }
        } else {
            // Add new product to cart with stock info and category information
            localCart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity,
                stock_quantity: product.stock_quantity,
                // NEW: Include category information
                category: product.category || "",
                categoryNames:
                    product.categories ||
                    (product.category ? [product.category] : []),
            });
        }

        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(localCart));

        // If user is logged in, sync with the backend
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await addToCart(productId, quantity);
            } catch (error) {
                console.error("Failed to sync cart with server:", error);
                // Continue even if backend sync fails - we've already updated localStorage
            }
        }

        // Return the updated cart items
        return {
            success: true,
            cart: localCart,
            message: "Product added to cart successfully",
        };
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
        if (!productIds.length) return { success: true };

        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/cart/add-multiple`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productIds,
                }),
            });

            if (response.ok) {
                return await response.json();
            }

            // For other errors, throw standard error
            if (response.status === 401) {
                throw new Error("Authentication failed");
            }
            throw new Error(`Server error: ${response.status}`);
        } catch (error) {
            console.error("Error adding multiple items to cart:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error adding multiple items to cart:", error);
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
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            // Add cache control to prevent stale data
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed");
            }
            throw new Error(`Server error: ${response.status}`);
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

        // // Enforce quantity limits
        // if (quantity > 100) {
        //     quantity = 100;
        //     console.warn("Quantity limited to 100 units per product");
        // }

        // // Check for potential numeric overflow
        // try {
        //     const productInfo = await getProductPrice(productId);
        //     if (productInfo && productInfo.price) {
        //         // Check if price * quantity would exceed database limits (99,999,999.99)
        //         const totalPrice = productInfo.price * quantity;
        //         if (totalPrice > 99999999) {
        //             // Find the maximum quantity that would be safe
        //             const safeQuantity = Math.floor(
        //                 99999999 / productInfo.price,
        //             );
        //             quantity = Math.min(quantity, Math.max(1, safeQuantity));
        //             console.warn(
        //                 `Quantity adjusted to ${quantity} to prevent numeric overflow`,
        //             );
        //         }
        //     }
        // } catch (priceError) {
        //     console.warn("Could not verify price safety limits:", priceError);
        // }

        // FIXED: Using correct endpoint /cart/update-item instead of /cart/{productId}
        const response = await fetch(`${API_URL}/cart/update-item`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId,
                quantity,
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed");
            }

            // Try to get detailed error message
            try {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || `Server error: ${response.status}`,
                );
            } catch (e) {
                throw new Error(`Server error: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating quantity for item ${productId}:`, error);
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
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed");
            }

            if (response.status === 404) {
                console.warn(
                    `Item ${productId} not found in server cart, likely already removed`,
                );
                return { success: true, message: "Item not in cart" };
            }

            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error removing item ${productId} from cart:`, error);
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

        try {
            const cartResponse = await getCart();
            if (
                cartResponse.success &&
                cartResponse.cart &&
                cartResponse.cart.items
            ) {
                for (const item of cartResponse.cart.items) {
                    try {
                        await removeCartItem(item.productId);
                    } catch (removeError) {
                        // Ignore individual removal errors
                        console.warn(
                            `Failed to remove item ${item.productId}:`,
                            removeError,
                        );
                    }
                }
            }

            return {
                success: true,
                message: "Cart cleared successfully",
            };
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}

/**
 * Clear the entire cart (local storage + backend if logged in)
 */
export async function clearCartAndSync() {
    try {
        // Clear localStorage cart
        localStorage.setItem("cart", "[]");

        // If user is logged in, clear server cart too
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await clearCart();
            } catch (error) {
                console.error("Failed to clear server cart:", error);
            }
        }

        return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}
