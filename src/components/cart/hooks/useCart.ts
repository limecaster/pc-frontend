import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { CartItem } from "../types";
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
import { loadLocalCart } from "../utils/cartHelpers";

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

            const updatedCart = cartItems.map((item) => {
                const productInfo = productInfoMap[item.id];
                const stockQuantity = stockQuantities[item.id];

                let updatedItem = { ...item };

                if (stockQuantity !== undefined) {
                    updatedItem.stock_quantity = stockQuantity;

                    if (updatedItem.quantity > stockQuantity) {
                        updatedItem.quantity = Math.max(1, stockQuantity);
                        toast.error(
                            `Số lượng sản phẩm "${item.name}" đã được điều chỉnh do hàng tồn kho không đủ.`,
                        );
                    }
                }

                if (productInfo) {
                    if (freeProductIds.has(item.id)) {
                        updatedItem = {
                            ...updatedItem,
                            price: 0,
                            originalPrice:
                                productInfo.price || item.originalPrice || 0,
                            category:
                                productInfo.category || item.category || "",
                            categoryNames:
                                Array.isArray(productInfo.categories) &&
                                productInfo.categories.length > 0
                                    ? productInfo.categories
                                    : productInfo.category
                                      ? [productInfo.category]
                                      : [],
                            discountSource: item.discountSource || "automatic",
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
                        updatedItem.originalPrice = productInfo.originalPrice;
                        updatedItem.discountSource = productInfo.discountSource;
                        updatedItem.discountType = productInfo.discountType;
                    }
                }

                return updatedItem;
            });

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

    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const item = cartItems.find((item) => item.id === id);
        if (!item) return;

        const isItemFree =
            item.price <= 0 && item.originalPrice && item.originalPrice > 0;
        const currentQuantity = item.quantity;

        if (
            item.stock_quantity !== undefined &&
            newQuantity > item.stock_quantity
        ) {
            newQuantity = Math.max(
                1,
                Math.min(newQuantity, item.stock_quantity),
            );
            toast.error(`Số lượng tối đa có thể mua là ${item.stock_quantity}`);
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
    };

    const removeItem = async (id: string) => {
        const updatedCart = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        if (isAuthenticated) {
            try {
                await removeCartItem(id);
            } catch (error) {
                console.error("Failed to remove item from server cart:", error);
                toast.error(
                    "Không thể xóa sản phẩm khỏi giỏ hàng trên máy chủ.",
                );

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
        updateQuantity,
        removeItem,
        subtotal,
        shippingFee,
        isEmpty: cartItems.length === 0,
        isInitialized: initialLoadCompleteRef.current,
    };
}
