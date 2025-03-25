import { toast } from "react-hot-toast";
import { API_URL } from "@/config/constants";
import { getProductsWithDiscounts } from "@/api/product";
import { CartItem } from "../types";

/**
 * Helper functions for customer-related operations
 */
export const getCurrentCustomerId = async (): Promise<string | undefined> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        // Get user info from localStorage or you could make an API call
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        return userInfo.id?.toString();
    } catch (error) {
        console.error("Error getting customer ID:", error);
        return undefined;
    }
};

export const checkIfFirstPurchase = async (): Promise<boolean | undefined> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        return false; // Default to false until we have a proper implementation
    } catch (error) {
        console.error("Error checking if first purchase:", error);
        return undefined;
    }
};

/**
 * Load cart from localStorage
 */
export const loadLocalCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
};

/**
 * Save cart to localStorage and trigger any necessary UI updates
 */
export const saveLocalCart = (cartItems: CartItem[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cartItems));

    // Dispatch a custom event that components can listen for
    const event = new CustomEvent("cart-updated", { detail: cartItems });
    window.dispatchEvent(event);
};

/**
 * Clear cart from localStorage and trigger any necessary UI updates
 */
export const clearLocalCart = (): void => {
    if (typeof window === "undefined") return;

    // Clear cart from localStorage
    localStorage.setItem("cart", JSON.stringify([]));

    // Dispatch a custom event that components can listen for
    const event = new CustomEvent("cart-updated", { detail: [] });
    window.dispatchEvent(event);

    // Clear any checkout data that might reference the cart
    localStorage.removeItem("checkoutData");
    localStorage.removeItem("appliedDiscounts");

    // Show feedback to user
    toast.success("Giỏ hàng đã được xóa");
};

/**
 * Format currency in Vietnamese format
 */
export const formatCurrency = (amount: number): string => {
    // Handle edge cases: NaN, undefined, null
    if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
    }

    // Ensure amount is a number and round to avoid floating point issues
    amount = Math.round(amount);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Calculate and immediately update cart totals
 */
export const recalculateCartTotals = (
    cartItems: CartItem[],
): {
    subtotal: number;
    itemCount: number;
    discountedItemCount: number;
} => {
    const totals = cartItems.reduce(
        (acc, item) => {
            // Calculate item total based on current price (which may be discounted)
            const itemTotal = Math.max(0, item.price) * item.quantity;

            // Check if item is discounted
            const isDiscounted =
                item.originalPrice && item.price < item.originalPrice;

            // Check if item is free after discount
            const isFree =
                item.price <= 0 && item.originalPrice && item.originalPrice > 0;

            return {
                subtotal: acc.subtotal + (isFree ? 0 : itemTotal),
                itemCount: acc.itemCount + 1,
                discountedItemCount:
                    acc.discountedItemCount + (isDiscounted ? 1 : 0),
            };
        },
        { subtotal: 0, itemCount: 0, discountedItemCount: 0 },
    );

    return {
        subtotal: Math.round(totals.subtotal), // Round to avoid floating point issues
        itemCount: totals.itemCount,
        discountedItemCount: totals.discountedItemCount,
    };
};

/**
 * Fetch missing product categories for cart items
 */
export const fetchProductCategories = async (
    productIds: string[],
): Promise<Record<string, string[]>> => {
    try {
        if (!productIds || productIds.length === 0) {
            return {};
        }

        const results: Record<string, string[]> = {};

        for (const productId of productIds) {
            try {
                const response = await fetch(
                    `${API_URL}/products/${productId}`,
                );

                if (response.ok) {
                    const product = await response.json();
                    const categories: string[] = [];

                    if (
                        product.categories &&
                        Array.isArray(product.categories) &&
                        product.categories.length > 0
                    ) {
                        categories.push(...product.categories);
                    } else if (
                        product.category &&
                        typeof product.category === "string"
                    ) {
                        categories.push(product.category);
                    } else if (
                        product.categoryName &&
                        typeof product.categoryName === "string"
                    ) {
                        categories.push(product.categoryName);
                    }

                    if (categories.length > 0) {
                        results[productId] = categories;
                    }
                }
            } catch (err) {
                console.warn(
                    `Error fetching details for product ${productId}:`,
                    err,
                );
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching product categories:", error);
        return {};
    }
};

/**
 * Update cart items with category information
 */
export const updateCartItemCategories = async (
    cartItems: CartItem[],
): Promise<CartItem[]> => {
    try {
        const itemsNeedingCategories = cartItems.filter(
            (item) =>
                (!item.category || item.category === "") &&
                (!item.categoryNames || item.categoryNames.length === 0),
        );

        if (itemsNeedingCategories.length === 0) {
            return cartItems; // No updates needed
        }

        const productIds = itemsNeedingCategories.map((item) => item.id);
        const productsWithInfo = await getProductsWithDiscounts(productIds);

        if (!productsWithInfo || productsWithInfo.length === 0) {
            return cartItems;
        }

        const productMap = productsWithInfo.reduce(
            (map, product) => {
                map[product.id] = product;
                return map;
            },
            {} as Record<string, any>,
        );

        const updatedCart = cartItems.map((item) => {
            const productInfo = productMap[item.id];
            if (productInfo) {
                return {
                    ...item,
                    category: productInfo.category || item.category || "",
                    categoryNames:
                        productInfo.categories ||
                        (productInfo.category ? [productInfo.category] : []),
                    price: productInfo.price || item.price,
                    originalPrice: productInfo.originalPrice,
                    discountSource: productInfo.discountSource,
                    discountType: productInfo.discountType,
                };
            }
            return item;
        });

        return updatedCart;
    } catch (error) {
        console.error("Error updating cart item categories:", error);
        return cartItems;
    }
};

/**
 * Helper function to infer product category from name
 */
export const inferProductCategory = (productName: string): string => {
    productName = productName.toLowerCase();

    if (
        productName.includes("cpu") ||
        productName.includes("ryzen") ||
        productName.includes("core i") ||
        productName.includes("processor")
    ) {
        return "CPU";
    }

    if (
        productName.includes("gpu") ||
        productName.includes("rtx") ||
        productName.includes("graphics") ||
        productName.includes("gtx") ||
        productName.includes("radeon") ||
        productName.includes("geforce")
    ) {
        return "GPU";
    }

    // ... other category inferences

    return "Component";
};
