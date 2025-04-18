import { API_URL } from "@/config/constants";
import { v4 as uuidv4 } from "uuid";

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

interface AuthEventPayload {
    eventType: string;
    sessionId: string;
    userId: string;
    userRole: string;
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

interface PCBuildTrackingPayload {
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

const getSessionId = () => {
    // Check current authentication status
    const isAuthenticated = localStorage.getItem("token") !== null;

    // Get the last stored authentication status
    const wasAuthenticated =
        sessionStorage.getItem("wasAuthenticated") === "true";

    // Generate a new session ID if auth state changed or if none exists
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId || isAuthenticated !== wasAuthenticated) {
        sessionId = uuidv4();
        sessionStorage.setItem("sessionId", sessionId);
        sessionStorage.setItem(
            "wasAuthenticated",
            isAuthenticated ? "true" : "false",
        );

        // Reset session start time when creating a new session
        sessionStorage.removeItem("session_start_time");
        sessionStorage.removeItem("session_initialized");
    }

    return sessionId;
};

const trackEvent = async (eventData: any) => {
    try {
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
        await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(completeEventData),
            keepalive: true,
        });
    } catch (error) {
        console.error("Failed to track event:", error);
    }
};

export const trackProductClick = async (
    productId: string,
    productData?: any,
) => {
    try {
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
        if (productData) {
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
            payload.eventData = { ...payload.eventData, ...safeData };
        }
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

export const trackProductView = async (
    productId: string,
    productData?: any,
) => {
    try {
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
        console.debug("Sending product view payload:", JSON.stringify(payload));
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

export const trackSearch = async (query: string, resultsCount: number) => {
    await trackEvent({
        eventType: "search",
        entityType: "search",
        entityId: query,
        eventData: { query, resultsCount },
    });
};

export const trackAddToCart = async (
    productId: string,
    quantity: number,
    productData?: any,
) => {
    try {
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
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

export const trackRemoveFromCart = async (
    productId: string,
    productData?: any,
) => {
    try {
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
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

export const trackOrderCreated = async (orderId: string, orderData: any) => {
    try {
        const eventDataObj: Record<string, any> = {
            orderId,
            orderTotal: orderData.total || orderData.totalPrice,
            productCount: orderData.items?.length || 0,
            products: orderData.items?.map((item: any) => ({
                productId: item.product.id || item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name || item.productName,
            })),
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            timestamp: new Date().toISOString(),
        };
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
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

export const trackPaymentCompleted = async (
    orderId: string,
    paymentData: any,
) => {
    try {
        const trackingKey = `payment_tracked_${orderId}`;
        if (
            typeof window !== "undefined" &&
            sessionStorage.getItem(trackingKey)
        ) {
            // Removed duplicate tracking log
            return;
        }
        const eventDataObj: Record<string, any> = {
            orderId,
            paymentId: paymentData.paymentId || paymentData.id,
            paymentMethod: paymentData.paymentMethod || "online",
            amount: paymentData.amount || paymentData.totalAmount,
            status: paymentData.status || "COMPLETED",
            timestamp: new Date().toISOString(),
        };
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
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });
        if (!response.ok) {
            console.error(
                `Payment completion tracking failed: ${response.status}`,
            );
            return;
        }
        if (typeof window !== "undefined") {
            sessionStorage.setItem(trackingKey, "true");
        }
    } catch (error) {
        console.error("Failed to track payment completion:", error);
    }
};

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
        const trackingKey = `discount_tracked_${orderId}`;
        if (
            typeof window !== "undefined" &&
            sessionStorage.getItem(trackingKey)
        ) {
            // Removed duplicate tracking log
            return;
        }
        const customerId = localStorage.getItem("userId");
        const sessionId =
            localStorage.getItem("sessionId") || generateSessionId();
        const savingsPercent = calculateSavingsPercent(
            discountData.discountAmount,
            discountData.orderSubtotal,
        );
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
        await fetch(`${API_URL}/events/discount-usage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData),
        });
        if (typeof window !== "undefined") {
            sessionStorage.setItem(trackingKey, "true");
        }
    } catch (error) {
        console.error("Failed to track discount usage:", error);
    }
}

function calculateSavingsPercent(
    discountAmount: number,
    subtotal: number,
): number {
    if (!subtotal || subtotal === 0) return 0;
    return Math.round((discountAmount / subtotal) * 100);
}

function generateSessionId(): string {
    const sessionId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
    return sessionId;
}

export const trackSessionStart = async () => {
    try {
        const sessionId = getSessionId();
        const isNewSession = !sessionStorage.getItem("session_initialized");
        const sessionStartKey = `session_start_tracked_${sessionId}`;
        if (!isNewSession && sessionStorage.getItem(sessionStartKey)) {
            return;
        }
        sessionStorage.setItem("session_initialized", "pending");
        const payload: TrackEventPayload = {
            eventType: "session_start",
            sessionId,
            entityId: sessionId,
            entityType: "session",
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
                entryPage: window.location.pathname,
                referrer: document.referrer || "direct",
                isNewSession: isNewSession,
            },
        };
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
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });
        if (response.ok) {
            sessionStorage.setItem(sessionStartKey, "true");
            sessionStorage.setItem("session_initialized", "complete");
            if (!sessionStorage.getItem("session_start_time")) {
                sessionStorage.setItem(
                    "session_start_time",
                    Date.now().toString(),
                );
            }
            setupSessionEndTracking(sessionId);
        } else {
            sessionStorage.removeItem("session_initialized");
            const errorText = await response.text();
            console.error(
                `Session start tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        sessionStorage.removeItem("session_initialized");
        console.error("Failed to track session start:", error);
    }
};

export const trackSessionEnd = async () => {
    try {
        const sessionId = getSessionId();
        let sessionDuration = 0;
        const sessionStartTime = sessionStorage.getItem("session_start_time");
        if (sessionStartTime) {
            sessionDuration = Math.floor(
                (Date.now() - parseInt(sessionStartTime)) / 1000,
            );
        }
        const payload: TrackEventPayload = {
            eventType: "session_end",
            sessionId,
            entityId: sessionId,
            entityType: "session",
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
                exitPage: window.location.pathname,
                sessionDuration: sessionDuration,
            },
        };
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
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], {
                type: "application/json",
            });
            navigator.sendBeacon(`${API_URL}/events/track`, blob);
        } else {
            fetch(`${API_URL}/events/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        }
    } catch (error) {
        console.error("Failed to track session end:", error);
    }
};

const setupSessionEndTracking = (sessionId: string) => {
    if (typeof window === "undefined") return;
    if (!window.__sessionEndListenerAdded) {
        window.addEventListener("beforeunload", () => {
            trackSessionEnd();
        });
        window.__sessionEndListenerAdded = true;
    }
};

export const initSessionTracking = () => {
    trackSessionStart();
    return;
};

declare global {
    interface Window {
        __sessionEndListenerAdded?: boolean;
    }
}

export const trackAuthentication = async (
    userId: string,
    userRole: string,
    eventType: string = "user_authenticated",
) => {
    try {
        const sessionId = getSessionId();
        const payload: AuthEventPayload = {
            eventType,
            sessionId,
            userId,
            userRole,
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
                authMethod: "password",
            },
        };

        console.debug(
            "Sending authentication event payload:",
            JSON.stringify(payload),
        );
        const response = await fetch(`${API_URL}/events/auth-event`, {
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
                `Authentication event tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track authentication event:", error);
    }
};

export const trackLogout = async (userId: string, userRole: string) => {
    await trackAuthentication(userId, userRole, "user_logout");
};

// Auto Build PC Events
export const trackAutoBuildRequest = async (userInput: string) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "auto_build_pc_request",
            sessionId,
            entityId: "auto_build_pc",
            entityType: "feature",
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
                userInput,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Auto build tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track auto build request:", error);
    }
};

export const trackAutoBuildAddToCart = async (configDetails: any) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "auto_build_pc_add_to_cart",
            sessionId,
            entityId: "auto_build_pc",
            entityType: "feature",
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
                totalPrice: configDetails.totalPrice || 0,
                components: configDetails.components || [],
                configIndex: configDetails.configIndex,
                benchmarkScore: configDetails.benchmarkScore,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Auto build add to cart tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track auto build add to cart:", error);
    }
};

export const trackAutoBuildCustomize = async (configDetails: any) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "auto_build_pc_customize",
            sessionId,
            entityId: "auto_build_pc",
            entityType: "feature",
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
                totalPrice: configDetails.totalPrice || 0,
                components: configDetails.components || [],
                configIndex: configDetails.configIndex,
                benchmarkScore: configDetails.benchmarkScore,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Auto build customize tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track auto build customize:", error);
    }
};

// Manual Build PC Events

export const trackManualBuildPCPageView = async () => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "manual_build_pc_page_view",
            sessionId,
            entityId: "manual_build_pc",
            entityType: "feature",
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
                sessionId,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Manual build tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track manual build request:", error);
    }
};

export const trackManualBuildAddToCart = async (configDetails: any) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "manual_build_pc_add_to_cart",
            sessionId,
            entityId: "manual_build_pc",
            entityType: "feature",
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
                totalPrice: configDetails.totalPrice || 0,
                components: configDetails.components || [],
                totalWattage: configDetails.totalWattage,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Manual build add to cart tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track manual build add to cart:", error);
    }
};

export const trackManualBuildComponentSelect = async (
    componentDetails: any,
) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "manual_build_pc_component_select",
            sessionId,
            entityId: "manual_build_pc",
            entityType: "feature",
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
                componentType: componentDetails.componentType || "",
                componentId: componentDetails.id || "",
                componentName: componentDetails.name || "",
                componentPrice: componentDetails.price || 0,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Manual build component select tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track manual build component select:", error);
    }
};

export const trackManualBuildSaveConfig = async (configDetails: any) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "manual_build_pc_save_config",
            sessionId,
            entityId: "manual_build_pc",
            entityType: "feature",
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
                configName: configDetails.name || "",
                configPurpose: configDetails.purpose || "",
                totalPrice: configDetails.totalPrice || 0,
                totalWattage: configDetails.totalWattage || 0,
                components: configDetails.components || [],
                isEdit: configDetails.isEdit || false,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Manual build save config tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track manual build save config:", error);
    }
};

export const trackManualBuildExportExcel = async (configDetails: any) => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "manual_build_pc_export_excel",
            sessionId,
            entityId: "manual_build_pc",
            entityType: "feature",
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
                totalPrice: configDetails.totalPrice || 0,
                components: configDetails.components || [],
                totalWattage: configDetails.totalWattage,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Manual build export excel tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track manual build export to excel:", error);
    }
};

export const trackPCBuildView = async (buildType: "auto" | "manual") => {
    try {
        const sessionId = getSessionId();
        const payload: PCBuildTrackingPayload = {
            eventType: "pc_build_view",
            sessionId,
            entityId: `${buildType}_build_pc`,
            entityType: "feature",
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
                buildType,
            },
        };

        // Add customer ID if available
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

        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `PC build view tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track PC build view:", error);
    }
};

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
    trackSessionStart,
    trackSessionEnd,
    initSessionTracking,
    trackAuthentication,
    trackLogout,
    trackAutoBuildRequest,
    trackAutoBuildAddToCart,
    trackAutoBuildCustomize,
    trackManualBuildPCPageView,
    trackManualBuildAddToCart,
    trackManualBuildComponentSelect,
    trackManualBuildSaveConfig,
    trackManualBuildExportExcel,
    trackPCBuildView,
};
