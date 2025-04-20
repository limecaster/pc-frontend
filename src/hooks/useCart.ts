import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { CartItem } from "../components/cart/types";
import {
    getCart,
    addToCart,
    addMultipleToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
} from "@/api/cart";
import {
    getProductsStockQuantities,
    getProductsWithDiscounts,
} from "@/api/product";
import { loadLocalCart } from "../components/cart/utils/cartHelpers";

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const initialLoadCompleteRef = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        loadCartData();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!loading && initialLoadCompleteRef.current) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems, loading]);

    useEffect(() => {
        // Function to clear old notification records (older than 24 hours)
        const cleanupNotificationRecords = () => {
            try {
                const keys = ["removedCartItems", "adjustedCartItems"];
                const now = Date.now();
                const expireTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

                keys.forEach((key) => {
                    const recordStr = sessionStorage.getItem(key);
                    if (recordStr) {
                        const records = JSON.parse(recordStr);
                        let modified = false;

                        // Remove entries older than 24 hours
                        Object.keys(records).forEach((id) => {
                            if (now - records[id].timestamp > expireTime) {
                                delete records[id];
                                modified = true;
                            }
                        });

                        // Save back if modified
                        if (modified) {
                            sessionStorage.setItem(
                                key,
                                JSON.stringify(records),
                            );
                        }
                    }
                });
            } catch (error) {
                console.error("Error cleaning up notification records:", error);
            }
        };

        // Run cleanup on initial load
        cleanupNotificationRecords();

        // Set up interval to clean up regularly (every hour)
        const interval = setInterval(
            cleanupNotificationRecords,
            60 * 60 * 1000,
        );

        return () => clearInterval(interval);
    }, []);

    const loadCartData = async () => {
        setLoading(true);
        setError(null);

        try {
            const localCart = loadLocalCart();
            setCartItems(localCart);

            let workingCart = localCart;
            if (isAuthenticated) {
                try {
                    const serverCart = await fetchServerCart();

                    if (serverCart && serverCart.length > 0) {
                        workingCart =
                            mergeServerAndLocalCartsWithPriceConsistency(
                                serverCart,
                                localCart,
                            );
                        setCartItems(workingCart);
                        localStorage.setItem(
                            "cart",
                            JSON.stringify(workingCart),
                        );
                    } else if (localCart.length > 0) {
                        await syncLocalCartToServer(localCart);
                    }
                } catch (error) {
                    console.error("Server cart fetch failed:", error);
                }
            }

            if (workingCart.length > 0) {
                const updatedCart =
                    await updateCartWithCompleteProductInfo(workingCart);
                setCartItems(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));

                if (isAuthenticated) {
                    await ensureServerCartSync(updatedCart);
                }
            }

            initialLoadCompleteRef.current = true;
        } catch (err) {
            console.error("Error loading cart:", err);
            setError("Failed to load your cart. Please try again later.");
            initialLoadCompleteRef.current = true;
        } finally {
            setLoading(false);
        }
    };

    const mergeServerAndLocalCartsWithPriceConsistency = (
        serverCart: CartItem[],
        localCart: CartItem[],
    ): CartItem[] => {
        const mergedCart = JSON.parse(JSON.stringify(serverCart)) as CartItem[];

        const serverItemMap = new Map<string, CartItem>(
            mergedCart.map((item: CartItem) => [item.id, item]),
        );

        localCart.forEach((localItem) => {
            const serverItem = serverItemMap.get(localItem.id);

            if (!serverItem) {
                mergedCart.push({ ...localItem });
            } else {
                const mergedItem: CartItem = {
                    ...serverItem,
                    quantity: Math.max(serverItem.quantity, localItem.quantity),
                };

                if (localItem.price < serverItem.price) {
                    mergedItem.price = localItem.price;

                    if (localItem.originalPrice) {
                        mergedItem.originalPrice = localItem.originalPrice;
                    }
                    if (localItem.discountSource) {
                        mergedItem.discountSource = localItem.discountSource;
                    }
                    if (localItem.discountType) {
                        mergedItem.discountType = localItem.discountType;
                    }
                }

                const indexInMerged = mergedCart.findIndex(
                    (item) => item.id === localItem.id,
                );
                if (indexInMerged !== -1) {
                    mergedCart[indexInMerged] = mergedItem;
                }
            }
        });

        return mergedCart;
    };

    const updateCartWithCompleteProductInfo = async (
        cartItems: CartItem[],
    ): Promise<CartItem[]> => {
        try {
            // Don't process empty carts
            if (!cartItems || cartItems.length === 0) {
                return [];
            }

            // Track items that need quantity adjustment
            const adjustedItems = new Set<string>();
            // Track items that need to be removed due to being out of stock
            const removedItems = new Set<string>();
            const removedItemsInfo: { id: string; name: string }[] = [];

            const freeProductIds = new Set(
                cartItems
                    .filter(
                        (item) =>
                            item.price <= 0 &&
                            item.originalPrice &&
                            item.originalPrice > 0,
                    )
                    .map((item) => item.id),
            );

            const productIds = cartItems.map((item) => item.id);

            // Use the proper API endpoints from the ProductController
            const [stockQuantities, productsWithInfo] = await Promise.all([
                getProductsStockQuantities(productIds),
                getProductsWithDiscounts(productIds),
            ]);

            const productInfoMap = productsWithInfo.reduce(
                (map, product) => {
                    map[product.id] = product;
                    return map;
                },
                {} as Record<string, any>,
            );

            // First, identify items to be removed (zero stock)
            cartItems.forEach((item) => {
                const stockQuantity = stockQuantities[item.id];
                // If stock is 0 or undefined, mark for removal
                if (stockQuantity !== undefined && stockQuantity <= 0) {
                    removedItems.add(item.id);
                    removedItemsInfo.push({
                        id: item.id,
                        name: item.name,
                    });
                }
            });

            // Create updated cart with items that have stock > 0
            const updatedCart = cartItems
                .filter((item) => !removedItems.has(item.id))
                .map((item) => {
                    const productInfo = productInfoMap[item.id];
                    const stockQuantity = stockQuantities[item.id];

                    let updatedItem = { ...item };

                    if (stockQuantity !== undefined) {
                        updatedItem.stock_quantity = stockQuantity;

                        if (updatedItem.quantity > stockQuantity) {
                            updatedItem.quantity = Math.max(1, stockQuantity);
                            // Only add the item to the adjusted set if we're reducing quantity
                            adjustedItems.add(item.id);
                        }
                    }

                    if (productInfo) {
                        if (freeProductIds.has(item.id)) {
                            updatedItem = {
                                ...updatedItem,
                                price: 0,
                                originalPrice:
                                    productInfo.price ||
                                    item.originalPrice ||
                                    0,
                                category:
                                    productInfo.category || item.category || "",
                                categoryNames:
                                    Array.isArray(productInfo.categories) &&
                                    productInfo.categories.length > 0
                                        ? productInfo.categories
                                        : productInfo.category
                                          ? [productInfo.category]
                                          : [],
                                discountSource:
                                    item.discountSource || "automatic",
                                discountType: item.discountType || "fixed",
                            };
                        } else {
                            updatedItem.price = productInfo.price || item.price;
                            updatedItem.category =
                                productInfo.category || item.category || "";
                            updatedItem.categoryNames =
                                Array.isArray(productInfo.categories) &&
                                productInfo.categories.length > 0
                                    ? productInfo.categories
                                    : productInfo.category
                                      ? [productInfo.category]
                                      : [];
                            updatedItem.originalPrice =
                                productInfo.originalPrice;
                            updatedItem.discountSource =
                                productInfo.discountSource;
                            updatedItem.discountType = productInfo.discountType;
                        }
                    }

                    return updatedItem;
                });

            // Avoid multiple toast notifications for the same event by saving removed items
            // to sessionStorage and only showing the notification once
            if (removedItemsInfo.length > 0) {
                const sessionKey = "removedCartItems";
                // Try to get previously removed items
                const previouslyRemovedStr = sessionStorage.getItem(sessionKey);
                const previouslyRemoved = previouslyRemovedStr
                    ? JSON.parse(previouslyRemovedStr)
                    : {};

                // Filter out items that were already notified
                const newRemovedItems = removedItemsInfo.filter(
                    (item) => !previouslyRemoved[item.id],
                );

                // Update the removed items in session storage
                if (newRemovedItems.length > 0) {
                    newRemovedItems.forEach((item) => {
                        previouslyRemoved[item.id] = {
                            name: item.name,
                            timestamp: Date.now(),
                        };
                    });

                    // Save back to session storage
                    sessionStorage.setItem(
                        sessionKey,
                        JSON.stringify(previouslyRemoved),
                    );

                    // Show notification only for newly removed items
                    if (newRemovedItems.length === 1) {
                        toast.error(
                            `Sản phẩm "${newRemovedItems[0].name}" đã hết hàng và đã bị xóa khỏi giỏ hàng.`,
                        );
                    } else if (newRemovedItems.length > 1) {
                        const itemNames = newRemovedItems
                            .map((item) => `"${item.name}"`)
                            .join(", ");
                        toast.error(
                            `Một số sản phẩm (${itemNames}) đã hết hàng và đã bị xóa khỏi giỏ hàng.`,
                        );
                    }
                }
            }

            // Similarly, prevent repeated adjustment notifications
            if (adjustedItems.size > 0) {
                const sessionKey = "adjustedCartItems";
                // Try to get previously adjusted items
                const previouslyAdjustedStr =
                    sessionStorage.getItem(sessionKey);
                const previouslyAdjusted = previouslyAdjustedStr
                    ? JSON.parse(previouslyAdjustedStr)
                    : {};

                // Filter adjusted items that weren't already notified
                const itemsToNotify = Array.from(adjustedItems).filter(
                    (id) => !previouslyAdjusted[id],
                );

                if (itemsToNotify.length > 0) {
                    // Update session storage with new adjustments
                    itemsToNotify.forEach((id) => {
                        previouslyAdjusted[id] = {
                            timestamp: Date.now(),
                        };
                    });

                    // Save back to session storage
                    sessionStorage.setItem(
                        sessionKey,
                        JSON.stringify(previouslyAdjusted),
                    );

                    const adjustedItemNames = updatedCart
                        .filter((item) => itemsToNotify.includes(item.id))
                        .map((item) => `"${item.name}"`)
                        .join(", ");

                    if (itemsToNotify.length === 1) {
                        toast.error(
                            `Số lượng sản phẩm ${adjustedItemNames} đã được điều chỉnh do hàng tồn kho không đủ.`,
                        );
                    } else if (itemsToNotify.length > 1) {
                        toast.error(
                            `Số lượng của ${itemsToNotify.length} sản phẩm (${adjustedItemNames}) đã được điều chỉnh do hàng tồn kho không đủ.`,
                        );
                    }
                }
            }

            return updatedCart;
        } catch (error) {
            console.error(
                "Error updating cart with complete product info:",
                error,
            );
            return cartItems;
        }
    };

    const fetchServerCart = async (): Promise<CartItem[]> => {
        try {
            const response = await getCart();
            if (response.success && response.cart && response.cart.items) {
                return response.cart.items.map((item: any) => ({
                    id: item.productId,
                    name: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    slug: item.productId,
                    stock_quantity: item.stock_quantity,
                    category: item.category || "",
                    categoryNames:
                        item.categoryNames ||
                        (item.category ? [item.category] : []),
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching cart from server:", error);
            if (
                error instanceof Error &&
                error.message.includes("Authentication")
            ) {
                setIsAuthenticated(false);
            }
            return [];
        }
    };

    const mergeServerAndLocalCarts = (
        serverCart: CartItem[],
        localCart: CartItem[],
    ): CartItem[] => {
        const mergedCart = [...serverCart];

        localCart.forEach((localItem) => {
            const serverItemIndex = mergedCart.findIndex(
                (item) => item.id === localItem.id,
            );

            if (serverItemIndex === -1) {
                mergedCart.push(localItem);
            } else {
                mergedCart[serverItemIndex].quantity = Math.max(
                    mergedCart[serverItemIndex].quantity,
                    localItem.quantity,
                );
            }
        });

        return mergedCart;
    };

    const syncLocalCartToServer = async (localCart: CartItem[]) => {
        return syncLocalCartToServerWithRetries(localCart);
    };

    const ensureServerCartSync = async (currentCart: CartItem[]) => {
        if (!isAuthenticated) return;

        try {
            const serverCart = await fetchServerCart();

            const needsSync = compareCartsForSync(currentCart, serverCart);

            if (needsSync) {
                try {
                    for (const item of serverCart) {
                        try {
                            await removeCartItem(item.id);
                        } catch (removeError: any) {
                            if (
                                !(
                                    removeError.message &&
                                    removeError.message.includes("404")
                                )
                            ) {
                                console.error(
                                    `Error removing item ${item.id}:`,
                                    removeError,
                                );
                            }
                        }
                    }
                } catch (clearError) {
                    console.warn(
                        "Failed individual item removal, will try direct sync:",
                        clearError,
                    );
                }

                await syncLocalCartToServerWithRetries(currentCart);
            }
        } catch (error) {
            console.error("Error ensuring server cart sync:", error);
        }
    };

    const syncLocalCartToServerWithRetries = async (
        localCart: CartItem[],
        maxRetries = 3,
    ) => {
        if (!isAuthenticated || localCart.length === 0) return;

        let retryCount = 0;
        let success = false;

        while (!success && retryCount < maxRetries) {
            try {
                for (const item of localCart) {
                    try {
                        await addToCart(item.id, item.quantity);
                    } catch (itemError: any) {
                        if (
                            itemError.message &&
                            itemError.message.includes("stock")
                        ) {
                            try {
                                await addToCart(item.id, 1);
                            } catch (e) {
                                console.error(
                                    `Failed to add even one unit of ${item.id}:`,
                                    e,
                                );
                            }
                        } else {
                            console.error(
                                `Failed to sync item ${item.id}:`,
                                itemError,
                            );
                        }
                    }
                }
                success = true;
            } catch (error) {
                console.error(`Attempt ${retryCount + 1} failed:`, error);
                retryCount++;

                if (retryCount < maxRetries) {
                    await new Promise((r) =>
                        setTimeout(r, 1000 * Math.pow(2, retryCount)),
                    );
                }
            }
        }

        if (!success) {
            console.error("All sync attempts failed");
            toast.error(
                "Không thể đồng bộ giỏ hàng với máy chủ sau nhiều lần thử. Vui lòng làm mới trang.",
            );
        }
    };

    const compareCartsForSync = (
        clientCart: CartItem[],
        serverCart: CartItem[],
    ): boolean => {
        if (clientCart.length !== serverCart.length) return true;

        const clientMap = new Map<string, number>();
        clientCart.forEach((item) => clientMap.set(item.id, item.quantity));

        const serverMap = new Map<string, number>();
        serverCart.forEach((item) => serverMap.set(item.id, item.quantity));

        for (const [id, qty] of clientMap.entries()) {
            if (!serverMap.has(id) || serverMap.get(id) !== qty) {
                return true;
            }
        }

        for (const id of serverMap.keys()) {
            if (!clientMap.has(id)) {
                return true;
            }
        }

        return false;
    };

    const handleUpdateQuantity = async (id: string, newQuantity: number) => {
        // First, update the local display for immediate feedback
        const item = cartItems.find((item) => item.id === id);
        if (!item) return;

        // Handle removing items with zero quantity
        if (newQuantity < 1) {
            await removeItem(id);
            return;
        }

        // Check for zero stock items - auto remove them
        if (item.stock_quantity !== undefined && item.stock_quantity <= 0) {
            toast.error(
                `Sản phẩm "${item.name}" đã hết hàng và đã bị xóa khỏi giỏ hàng.`,
            );
            await removeItem(id);
            return;
        }

        // Don't allow exceeding stock quantity
        if (
            item.stock_quantity !== undefined &&
            newQuantity > item.stock_quantity
        ) {
            toast.error(`Số lượng tối đa có thể mua là ${item.stock_quantity}`);
            newQuantity = item.stock_quantity;
        }

        // Skip redundant updates
        if (newQuantity === item.quantity) return;

        // Handle asynchronous update
        await updateQuantity(id, newQuantity);
    };

    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(id);
            return;
        }

        const item = cartItems.find((item) => item.id === id);
        if (!item) return;

        const currentQuantity = item.quantity;
        const isItemFree = item.price <= 0 && item.originalPrice !== undefined;

        // Check stock quantity before updating
        if (item.stock_quantity !== undefined) {
            // Don't allow exceeding available stock
            if (newQuantity > item.stock_quantity) {
                toast.error(
                    `Số lượng tối đa có thể mua là ${item.stock_quantity}`,
                );
                // Set to maximum available instead of rejecting the update completely
                newQuantity = item.stock_quantity;

                // If zero stock available, show different message and remove item
                if (item.stock_quantity <= 0) {
                    toast.error(
                        `Sản phẩm "${item.name}" đã hết hàng và sẽ bị xóa khỏi giỏ hàng.`,
                    );
                    removeItem(id);
                    return;
                }
            }
        }

        const updatedCartItems = cartItems.map((cartItem) =>
            cartItem.id === id
                ? {
                      ...cartItem,
                      quantity: newQuantity,
                      price: isItemFree ? 0 : cartItem.price,
                  }
                : cartItem,
        );

        setCartItems(updatedCartItems);
        localStorage.setItem("cart", JSON.stringify(updatedCartItems));

        if (isAuthenticated) {
            try {
                await updateCartItemQuantity(id, newQuantity)
                    .then(() => {})
                    .catch(async (error) => {
                        try {
                            if (newQuantity > currentQuantity) {
                                const additionalItems = Array(
                                    newQuantity - currentQuantity,
                                ).fill(id);
                                await addMultipleToCart(additionalItems);
                            } else {
                                await removeCartItem(id);
                                await addToCart(id, newQuantity);
                            }
                        } catch (fallbackError) {
                            toast.error(
                                "Không thể cập nhật số lượng trên máy chủ. Giỏ hàng sẽ được đồng bộ lại.",
                            );
                            ensureServerCartSync(updatedCartItems).catch(
                                (err) =>
                                    console.error(
                                        "Background sync failed:",
                                        err,
                                    ),
                            );
                        }
                    });
            } catch (error) {
                console.error("Error during quantity update:", error);
            }
        }

        if (initialLoadCompleteRef.current) {
            setTimeout(async () => {
                try {
                    const refreshedItems =
                        await updateCartWithCompleteProductInfo(
                            updatedCartItems,
                        );
                    setCartItems(refreshedItems);
                    localStorage.setItem(
                        "cart",
                        JSON.stringify(refreshedItems),
                    );
                } catch (error) {
                    console.error("Background product refresh failed:", error);
                }
            }, 1000);
        }

        // Dispatch custom event for cart update
        const cartUpdatedEvent = new CustomEvent("cart-updated", {
            detail: updatedCartItems,
        });
        window.dispatchEvent(cartUpdatedEvent);
    };

    const removeItem = async (id: string) => {
        // Optimistic update - immediately update UI
        const itemToRemove = cartItems.find((item) => item.id === id);
        const updatedCart = cartItems.filter((item) => item.id !== id);

        // Update state and localStorage immediately
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Dispatch custom event for cart updated
        const cartUpdatedEvent = new CustomEvent("cart-updated", {
            detail: updatedCart,
        });
        window.dispatchEvent(cartUpdatedEvent);

        // Only try server sync if authenticated
        if (isAuthenticated) {
            try {
                await removeCartItem(id);
            } catch (error) {
                console.error("Failed to remove item from server cart:", error);

                // If the error isn't just because the item isn't in the cart, show error
                if (
                    error instanceof Error &&
                    !error.message.includes("Item not in cart") &&
                    !error.message.includes("not found in server cart")
                ) {
                    toast.error(
                        "Không thể xóa sản phẩm khỏi giỏ hàng trên máy chủ.",
                    );
                }

                // Try background sync with a delay
                setTimeout(() => {
                    ensureServerCartSync(updatedCart).catch((err) =>
                        console.error(
                            "Background sync after removal failed:",
                            err,
                        ),
                    );
                }, 1000);
            }
        }
    };

    const subtotal = cartItems.reduce(
        (total, item) => total + Math.max(0, item.price) * item.quantity,
        0,
    );

    const shippingFee = 0;

    return {
        cartItems,
        setCartItems,
        loading,
        error,
        isAuthenticated,
        handleUpdateQuantity,
        removeItem,
        subtotal,
        shippingFee,
        isEmpty: cartItems.length === 0,
        isInitialized: initialLoadCompleteRef.current,
    };
}
