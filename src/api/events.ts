import { API_URL } from "@/config/constants";
import { v4 as uuidv4 } from "uuid";

// Type definition for product click payload
interface ProductClickPayload {
    eventType: string;
    sessionId: string;
    productId: string;
    productName: string | null;
    category: string | null;
    price: number | null;
    customerId?: string;
    deviceInfo: {
        userAgent: string;
        language: string;
        screenSize: string;
        viewportSize: string;
    };
    pageUrl: string;
    referrerUrl: string | null;
    eventData: Record<string, any>;
}

// Updated interface for track event payload
interface TrackEventPayload {
    eventType: string;
    sessionId: string;
    entityId: string;
    entityType: string;
    customerId?: string;
    deviceInfo: {
        userAgent: string;
        language: string;
        screenSize: string;
        viewportSize: string;
    };
    pageUrl: string;
    referrerUrl: string | null;
    eventData: Record<string, any>;
}

// Type definition for product view payload
interface ProductViewPayload {
    eventType: string;
    sessionId: string;
    productId: string;
    productName: string | null;
    category: string | null;
    price: number | null;
    customerId?: string;
    deviceInfo: {
        userAgent: string;
        language: string;
        screenSize: string;
        viewportSize: string;
    };
    pageUrl: string;
    referrerUrl: string | null;
    eventData: Record<string, any>;
}

// Get or create a session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem("sessionId");

    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
};

/**
 * Base function to track events
 */
const trackEvent = async (eventData: any) => {
    try {
        // Add session ID and basic browser info
        const completeEventData = {
            ...eventData,
            sessionId: getSessionId(),
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                ...eventData.deviceInfo,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload.sub) {
                        completeEventData.customerId = payload.sub;
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Send event to backend
        await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(completeEventData),
            // Use keepalive to ensure the request completes even if the page is being unloaded
            keepalive: true,
        });
    } catch (error) {
        // Silently log errors without disrupting user experience
        console.error("Failed to track event:", error);
    }
};

/**
 * Track product click events
 */
export const trackProductClick = async (
    productId: string,
    productData?: any,
) => {
    try {
        // Create the payload with proper typing
        const payload: ProductClickPayload = {
            eventType: "product_click",
            sessionId: getSessionId(),
            productId,
            productName: productData?.name || null,
            category: productData?.category || null,
            price:
                typeof productData?.price === "number"
                    ? productData.price
                    : null,
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: {
                timestamp: new Date().toISOString(),
            },
        };

        // Add additional data if available, but ensure we don't include complex objects
        if (productData) {
            // Only include simple properties in eventData
            const safeData: Record<string, string | number | boolean> = {};
            Object.entries(productData).forEach(([key, value]) => {
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                ) {
                    safeData[key] = value;
                }
            });
            payload.eventData = {
                ...payload.eventData,
                ...safeData,
            };
        }

        // Add customerId if user is logged in - ensuring it's a string
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        // Ensure customerId is always a string
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Debug the payload being sent
        console.debug(
            "Sending product click payload:",
            JSON.stringify(payload),
        );

        const response = await fetch(`${API_URL}/events/product-click`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Product click tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track product click:", error);
    }
};

/**
 * Track product view events when a user views a product detail page
 */
export const trackProductView = async (
    productId: string,
    productData?: any,
) => {
    try {
        // Build eventData object containing all product-specific data
        const eventDataObj: Record<string, any> = {
            productId,
            productName: productData?.name || null,
            category: productData?.category || null,
            price:
                typeof productData?.price === "number"
                    ? productData.price
                    : null,
            timestamp: new Date().toISOString(),
            viewSource: document.referrer ? "referred" : "direct",
        };

        // Add additional data if available
        if (productData) {
            // Only include simple properties in eventData
            Object.entries(productData).forEach(([key, value]) => {
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                ) {
                    eventDataObj[key] = value;
                }
            });
        }

        // Create the payload with proper structure and type
        const payload: TrackEventPayload = {
            eventType: "product_viewed",
            sessionId: getSessionId(),
            entityId: productId,
            entityType: "product",
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: eventDataObj,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Debug the payload being sent
        console.debug("Sending product view payload:", JSON.stringify(payload));

        // Send the tracking event
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Product view tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track product view:", error);
    }
};

/**
 * Track page view events
 */
export const trackPageView = async (pageInfo?: any) => {
    await trackEvent({
        eventType: "page_view",
        entityType: "page",
        entityId: window.location.pathname,
        eventData: {
            title: document.title,
            ...pageInfo,
        },
    });
};

/**
 * Track search events
 */
export const trackSearch = async (query: string, resultsCount: number) => {
    await trackEvent({
        eventType: "search",
        entityType: "search",
        entityId: query,
        eventData: {
            query,
            resultsCount,
        },
    });
};

/**
 * Track when a product is added to cart
 */
export const trackAddToCart = async (
    productId: string,
    quantity: number,
    productData?: any,
) => {
    try {
        // Build eventData object with product and quantity info
        const eventDataObj: Record<string, any> = {
            productId,
            productName: productData?.name || null,
            category: productData?.category || null,
            price:
                typeof productData?.price === "number"
                    ? productData.price
                    : null,
            quantity,
            timestamp: new Date().toISOString(),
        };

        // Add any additional product data
        if (productData) {
            Object.entries(productData).forEach(([key, value]) => {
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                ) {
                    eventDataObj[key] = value;
                }
            });
        }

        // Create the payload
        const payload: TrackEventPayload = {
            eventType: "product_added_to_cart",
            sessionId: getSessionId(),
            entityId: productId,
            entityType: "product",
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: eventDataObj,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Send the tracking event
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Add to cart tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track add to cart:", error);
    }
};

/**
 * Track when a product is removed from cart
 */
export const trackRemoveFromCart = async (
    productId: string,
    productData?: any,
) => {
    try {
        // Build eventData object with product info
        const eventDataObj: Record<string, any> = {
            productId,
            productName: productData?.name || null,
            category: productData?.category || null,
            price:
                typeof productData?.price === "number"
                    ? productData.price
                    : null,
            timestamp: new Date().toISOString(),
        };

        // Add any additional product data
        if (productData) {
            Object.entries(productData).forEach(([key, value]) => {
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                ) {
                    eventDataObj[key] = value;
                }
            });
        }

        // Create the payload
        const payload: TrackEventPayload = {
            eventType: "product_removed_from_cart",
            sessionId: getSessionId(),
            entityId: productId,
            entityType: "product",
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: eventDataObj,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Send the tracking event
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Remove from cart tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track remove from cart:", error);
    }
};

/**
 * Track when an order is created
 */
export const trackOrderCreated = async (orderId: string, orderData: any) => {
    try {
        // Build eventData with order information
        const eventDataObj: Record<string, any> = {
            orderId,
            orderTotal: orderData.total || orderData.totalPrice,
            productCount: orderData.items?.length || 0,
            products: orderData.items?.map((item: any) => ({
                productId: item.productId || item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name || item.productName,
            })),
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            timestamp: new Date().toISOString(),
        };

        // Create the payload
        const payload: TrackEventPayload = {
            eventType: "order_created",
            sessionId: getSessionId(),
            entityId: orderId,
            entityType: "order",
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: eventDataObj,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Send the tracking event
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Order creation tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track order creation:", error);
    }
};

/**
 * Track when a payment is successfully completed
 */
export const trackPaymentCompleted = async (
    orderId: string,
    paymentData: any,
) => {
    try {
        // Check if this payment event has already been tracked
        const trackingKey = `payment_tracked_${orderId}`;
        if (
            typeof window !== "undefined" &&
            sessionStorage.getItem(trackingKey)
        ) {
            console.log(
                `Payment for order ${orderId} already tracked, skipping duplicate event`,
            );
            return; // Skip tracking if already done
        }

        // Build eventData with payment information
        const eventDataObj: Record<string, any> = {
            orderId,
            paymentId: paymentData.paymentId || paymentData.id,
            paymentMethod: paymentData.paymentMethod || "online",
            amount: paymentData.amount || paymentData.totalAmount,
            status: paymentData.status || "COMPLETED",
            timestamp: new Date().toISOString(),
        };

        // Create the payload
        const payload: TrackEventPayload = {
            eventType: "payment_completed",
            sessionId: getSessionId(),
            entityId: orderId,
            entityType: "payment",
            deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            pageUrl: window.location.href,
            referrerUrl: document.referrer || null,
            eventData: eventDataObj,
        };

        // Add customerId if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const tokenPayload = JSON.parse(atob(parts[1]));
                    if (tokenPayload.sub) {
                        payload.customerId = String(tokenPayload.sub);
                    }
                }
            } catch (e) {
                console.error("Failed to extract user ID from token", e);
            }
        }

        // Send the tracking event
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            console.error(
                `Payment completion tracking failed: ${response.status}`,
            );
            return;
        }

        // Mark this payment as tracked in sessionStorage
        if (typeof window !== "undefined") {
            sessionStorage.setItem(trackingKey, "true");
        }
    } catch (error) {
        console.error("Failed to track payment completion:", error);
        // Non-critical error, don't throw
    }
};

/**
 * Tracks discount usage in an order
 * @param orderId The ID of the order
 * @param discountData Information about the discount(s) applied
 */
export async function trackDiscountUsage(
    orderId: string | number,
    discountData: {
        discountAmount: number;
        manualDiscountId?: number;
        appliedDiscountIds?: string[];
        orderTotal: number;
        orderSubtotal: number;
        itemDiscounts?: Array<{
            productId: string;
            productName: string;
            originalPrice: number;
            finalPrice: number;
            discountAmount: number;
            discountId?: number;
            discountType?: string;
        }>;
    },
): Promise<void> {
    try {
        // Check if this discount event has already been tracked
        const trackingKey = `discount_tracked_${orderId}`;
        if (
            typeof window !== "undefined" &&
            sessionStorage.getItem(trackingKey)
        ) {
            console.log(
                `Discount for order ${orderId} already tracked, skipping duplicate event`,
            );
            return; // Skip tracking if already done
        }

        // Get customer ID from local storage if available
        const customerId = localStorage.getItem("userId");
        const sessionId =
            localStorage.getItem("sessionId") || generateSessionId();

        // Calculate savings percentage
        const savingsPercent = calculateSavingsPercent(
            discountData.discountAmount,
            discountData.orderSubtotal,
        );

        // Create event payload
        const eventData = {
            eventType: "discount_used",
            sessionId,
            customerId: customerId || undefined,
            entityId: orderId.toString(),
            entityType: "order",
            pageUrl: window.location.href,
            referrerUrl: document.referrer,
            deviceInfo: {
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
            },
            eventData: {
                orderId,
                discountAmount: discountData.discountAmount,
                discountType: discountData.manualDiscountId
                    ? "manual"
                    : "automatic",
                discountIds: discountData.manualDiscountId
                    ? [discountData.manualDiscountId.toString()]
                    : discountData.appliedDiscountIds,
                itemDiscounts: discountData.itemDiscounts,
                orderTotal: discountData.orderTotal,
                orderSubtotal: discountData.orderSubtotal,
                savingsPercent,
                timestamp: Date.now(),
            },
        };

        // Send event to tracking API
        await fetch(`${API_URL}/events/discount-usage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
        });

        // Mark this discount as tracked in sessionStorage
        if (typeof window !== "undefined") {
            sessionStorage.setItem(trackingKey, "true");
        }

        console.log("Discount usage tracked successfully", eventData);
    } catch (error) {
        console.error("Failed to track discount usage:", error);
        // Don't throw - tracking errors shouldn't break the app
    }
}

/**
 * Calculates the percentage of savings from a discount
 */
function calculateSavingsPercent(
    discountAmount: number,
    subtotal: number,
): number {
    if (!subtotal || subtotal === 0) return 0;
    return Math.round((discountAmount / subtotal) * 100);
}

/**
 * Generates a session ID if one doesn't exist
 */
function generateSessionId(): string {
    const sessionId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
    return sessionId;
}

export default {
    trackEvent,
    trackProductClick,
    trackProductView,
    trackPageView,
    trackSearch,
    trackAddToCart,
    trackRemoveFromCart,
    trackOrderCreated,
    trackPaymentCompleted,
    trackDiscountUsage,
};
