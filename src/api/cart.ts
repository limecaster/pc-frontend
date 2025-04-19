import { API_URL } from "@/config/constants";
import { trackAddToCart, trackRemoveFromCart } from "./events";

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
            throw new Error("Failed to fetch product information");
        }

        const productData = await productResponse.json();
        
        // Check if product exists and has stock information
        // The response structure from the Product controller doesn't include a product wrapper
        if (!productData) {
            throw new Error("Product not found");
        }
        
        // Get stock quantity - may be at the top level instead of nested in product
        const stockQuantity = productData.stockQuantity || 0;
        
        // Check if product is out of stock
        if (stockQuantity <= 0) {
            throw new Error(
                `Sản phẩm "${productData.name}" đã hết hàng.`,
            );
        }

        // Get current cart to check for existing quantity
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = localCart.find(
            (item: any) => item.id === productId,
        );

        // Calculate total requested quantity (existing + new)
        const totalRequestedQuantity =
            (existingItem ? existingItem.quantity : 0) + quantity;

        // Default to the requested quantity
        let adjustedQuantity = quantity;

        // Check if total quantity exceeds available stock
        if (totalRequestedQuantity > stockQuantity) {
            // Adjust quantity to maximum available
            adjustedQuantity =
                stockQuantity - (existingItem ? existingItem.quantity : 0);

            if (adjustedQuantity <= 0) {
                throw new Error(
                    `Sản phẩm "${productData.name}" đã đạt số lượng tối đa có thể mua (${stockQuantity}).`,
                );
            }

            // Update quantity to be added
            quantity = adjustedQuantity;
        }

        const token = localStorage.getItem("token");

        let updatedCart = [];

        if (token) {
            // User is logged in, add to server cart
            try {
                await addToCart(productId, quantity);
                // Track the addition
                trackAddToCart(productId, quantity, {
                    name: productData.name,
                    price: productData.price,
                    imageUrl: productData.imageUrl,
                });

                // Fetch updated cart from server
                const cartResponse = await getCart();
                if (
                    cartResponse &&
                    cartResponse.cart &&
                    cartResponse.cart.items
                ) {
                    updatedCart = cartResponse.cart.items.map((item: any) => ({
                        id: item.productId,
                        name: item.productName,
                        price: item.price,
                        quantity: item.quantity,
                        imageUrl: item.imageUrl || "",
                        stock_quantity:
                            item.stockQuantity !== undefined
                                ? item.stockQuantity
                                : null,
                    }));
                }
            } catch (error) {
                console.error("Error adding to server cart:", error);

                // Fall back to local cart if server operation fails
                const localItem = {
                    id: productId,
                    name: productData.name,
                    price: productData.price,
                    quantity: quantity,
                    imageUrl: productData.imageUrl || "",
                    stock_quantity: stockQuantity,
                };

                const existingItemIndex = localCart.findIndex(
                    (item: any) => item.id === productId,
                );

                if (existingItemIndex >= 0) {
                    // Item exists, update quantity
                    localCart[existingItemIndex].quantity += quantity;
                } else {
                    // New item
                    localCart.push(localItem);
                }

                updatedCart = localCart;
                localStorage.setItem("cart", JSON.stringify(updatedCart));

                // Notify user about the adjusted quantity if applicable
                if (adjustedQuantity && adjustedQuantity < quantity) {
                    throw new Error(
                        `Số lượng sản phẩm "${productData.name}" được điều chỉnh xuống ${adjustedQuantity} do hàng tồn kho giới hạn.`,
                    );
                }
            }
        } else {
            // User is not logged in, update local cart only
            const localItem = {
                id: productId,
                name: productData.name,
                price: productData.price,
                quantity: quantity,
                imageUrl: productData.imageUrl || "",
                stock_quantity: stockQuantity,
            };

            const existingItemIndex = localCart.findIndex(
                (item: any) => item.id === productId,
            );

            if (existingItemIndex >= 0) {
                // Item exists, update quantity without exceeding stock
                localCart[existingItemIndex].quantity += quantity;

                // Ensure we don't exceed stock quantity
                if (localCart[existingItemIndex].quantity > stockQuantity) {
                    localCart[existingItemIndex].quantity = stockQuantity;
                }

                // Update stock quantity info
                localCart[existingItemIndex].stock_quantity = stockQuantity;
            } else {
                // New item
                localCart.push(localItem);
            }

            updatedCart = localCart;
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            // Track the addition even for anonymous users
            trackAddToCart(productId, quantity, {
                name: productData.name,
                price: productData.price,
                imageUrl: productData.imageUrl,
            });
        }

        // Dispatch custom event for cart update
        const event = new CustomEvent("cart-updated", {
            detail: updatedCart,
        });
        window.dispatchEvent(event);

        return { success: true, cart: updatedCart };
    } catch (error: any) {
        console.error("Error in addToCartAndSync:", error);
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

        // Fetch the current cart to get the previous quantity for comparison
        let previousQuantity = 0;
        try {
            const cartData = await getCart();
            if (cartData.success && cartData.cart && cartData.cart.items) {
                const item = cartData.cart.items.find(
                    (i: any) => i.productId === productId,
                );
                if (item) {
                    previousQuantity = item.quantity;
                }
            }
        } catch (e) {
            console.warn("Failed to get previous quantity for tracking:", e);
        }

        // Get product details for tracking
        try {
            const productResponse = await fetch(
                `${API_URL}/products/${productId}`,
            );
            if (productResponse.ok) {
                const product = await productResponse.json();

                // If quantity increased, track as an add to cart event
                if (quantity > previousQuantity) {
                    const addedQuantity = quantity - previousQuantity;
                    trackAddToCart(productId, addedQuantity, {
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        category: product.category,
                        brand: product.brand,
                    });
                }
                // If quantity decreased, could track as a partial removal
                else if (quantity < previousQuantity && quantity > 0) {
                    // Optional: Track quantity reduction event
                    // This could be a custom event if needed
                }
            }
        } catch (trackError) {
            console.warn("Failed to track quantity update event:", trackError);
            // Continue with update even if tracking fails
        }

        // Continue with the existing update logic
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

        // First fetch product details for tracking
        try {
            const productResponse = await fetch(
                `${API_URL}/products/${productId}`,
            );
            if (productResponse.ok) {
                const product = await productResponse.json();

                // Track removal event with product details
                trackRemoveFromCart(productId, {
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    category: product.category,
                    brand: product.brand,
                });
            }
        } catch (trackError) {
            console.warn("Failed to track remove event:", trackError);
            // Continue with removal even if tracking fails
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
 * Remove an item from the local cart with tracking
 * @param productId The ID of the product to remove
 */
export function removeLocalCartItem(productId: string) {
    try {
        // Get current cart
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Find the item for tracking before removal
        const item = localCart.find(
            (cartItem: any) => cartItem.id === productId,
        );

        if (item) {
            // Track removal
            trackRemoveFromCart(productId, {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
            });

            // Remove item
            const updatedCart = localCart.filter(
                (cartItem: any) => cartItem.id !== productId,
            );
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            // Dispatch cart updated event
            const event = new CustomEvent("cart-updated", {
                detail: updatedCart,
            });
            window.dispatchEvent(event);
        }

        return { success: true };
    } catch (error) {
        console.error(
            `Error removing item ${productId} from local cart:`,
            error,
        );
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
