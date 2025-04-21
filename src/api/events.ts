import { API_URL } from "@/config/constants";
import { v4 as uuidv4 } from "uuid";

// --- Utility Functions ---
function getCustomerIdFromToken(): string | undefined {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const parts = token.split(".");
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.sub) {
                    return String(payload.sub);
                }
            }
        } catch (e) {
            console.error("Failed to extract user ID from token", e);
        }
    }
    return undefined;
}

function getDeviceInfo(): any {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    };
}

function getPageInfo(): { pageUrl: string; referrerUrl: string | null } {
    return {
        pageUrl: window.location.href,
        referrerUrl: document.referrer || null,
    };
}

export const getSessionId = () => {
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

// --- Refactored Event Tracking Functions ---
export const trackProductClick = async (
    productId: string,
    productData?: any,
) => {
    const eventData: Record<string, any> = {
        productId,
        productName: productData?.name || null,
        category: productData?.category || null,
        price:
            typeof productData?.price === "number" ? productData.price : null,
        timestamp: new Date().toISOString(),
        ...(productData &&
            Object.fromEntries(
                Object.entries(productData).filter(([_, v]) =>
                    ["string", "number", "boolean"].includes(typeof v),
                ),
            )),
    };
    await trackEvent({
        eventType: "product_click",
        entityId: productId,
        entityType: "product",
        eventData,
    });
};

export const trackAddToCart = async (
    productId: string,
    quantity: number,
    productData?: any,
) => {
    const eventData: Record<string, any> = {
        productId,
        productName: productData?.name || null,
        category: productData?.category || null,
        price:
            typeof productData?.price === "number" ? productData.price : null,
        quantity,
        timestamp: new Date().toISOString(),
        ...(productData &&
            Object.fromEntries(
                Object.entries(productData).filter(([_, v]) =>
                    ["string", "number", "boolean"].includes(typeof v),
                ),
            )),
    };
    await trackEvent({
        eventType: "product_added_to_cart",
        entityId: productId,
        entityType: "product",
        eventData,
    });
};

export const trackRemoveFromCart = async (
    productId: string,
    productData?: any,
) => {
    const eventData: Record<string, any> = {
        productId,
        productName: productData?.name || null,
        category: productData?.category || null,
        price:
            typeof productData?.price === "number" ? productData.price : null,
        timestamp: new Date().toISOString(),
        ...(productData &&
            Object.fromEntries(
                Object.entries(productData).filter(([_, v]) =>
                    ["string", "number", "boolean"].includes(typeof v),
                ),
            )),
    };
    await trackEvent({
        eventType: "product_removed_from_cart",
        entityId: productId,
        entityType: "product",
        eventData,
    });
};

// --- Enhanced trackEvent ---
export const trackEvent = async (eventData: any) => {
    try {
        const sessionId = getSessionId();
        const deviceInfo = getDeviceInfo();
        const { pageUrl, referrerUrl } = getPageInfo();
        const customerId = getCustomerIdFromToken();
        const completeEventData = {
            ...eventData,
            sessionId,
            deviceInfo: {
                ...deviceInfo,
                ...(eventData.deviceInfo || {}),
            },
            pageUrl,
            referrerUrl,
        };
        if (customerId) {
            completeEventData.customerId = customerId;
        }
        const response = await fetch(`${API_URL}/events/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(completeEventData),
            keepalive: true,
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Event tracking failed: ${response.status}`,
                errorText,
            );
        }
    } catch (error) {
        console.error("Failed to track event:", error);
    }
};

export const trackProductView = async (
    productId: string,
    productData?: any,
) => {
    try {
        const eventData = {
            productId,
            productName: productData?.name || null,
            category: productData?.category || null,
            price:
                typeof productData?.price === "number"
                    ? productData.price
                    : null,
            timestamp: new Date().toISOString(),
            ...(productData &&
                Object.fromEntries(
                    Object.entries(productData).filter(([_, v]) =>
                        ["string", "number", "boolean"].includes(typeof v),
                    ),
                )),
        };
        await trackEvent({
            eventType: "product_viewed",
            entityId: productId,
            entityType: "product",
            eventData,
        });
    } catch (error) {
        console.error("Failed to track product view:", error);
    }
};

export const trackOrderCreated = async (orderId: string, orderData: any) => {
    const eventData = {
        orderId,
        ...orderData,
        timestamp: new Date().toISOString(),
    };
    await trackEvent({
        eventType: "order_created",
        entityId: orderId,
        entityType: "order",
        eventData,
    });
};

export const trackPaymentCompleted = async (
    orderId: string,
    paymentData: any,
) => {
    const eventData = {
        orderId,
        ...paymentData,
        timestamp: new Date().toISOString(),
    };
    await trackEvent({
        eventType: "payment_completed",
        entityId: orderId,
        entityType: "order",
        eventData,
    });
};

export const trackDiscountUsage = async (
    orderId: string | number,
    discountData: {
        discountAmount: number;
        manualDiscountId?: number;
        appliedDiscountIds?: string[];
        orderTotal: number;
        orderSubtotal: number;
        products?: Array<{
            productId: string;
            productName: string;
            originalPrice: number;
            finalPrice: number;
            discountAmount: number;
            discountId?: number;
            discountType?: string;
        }>;
    },
) => {
    const eventData = {
        orderId,
        ...discountData,
        timestamp: new Date().toISOString(),
    };
    await trackEvent({
        eventType: "discount_used",
        entityId: String(orderId),
        entityType: "order",
        eventData,
    });
};

export const trackSessionStart = async () => {
    await trackEvent({
        eventType: "session_start",
        entityType: "session",
        eventData: { timestamp: new Date().toISOString() },
    });
};

export const initSessionTracking = () => {
    trackSessionStart();
    return;
};

export const trackSessionEnd = async () => {
    await trackEvent({
        eventType: "session_end",
        entityType: "session",
        eventData: { timestamp: new Date().toISOString() },
    });
};

export const trackAuthentication = async (
    userId: string,
    userRole: string,
    eventType: string = "user_authenticated",
) => {
    await trackEvent({
        eventType,
        entityId: userId,
        entityType: "user",
        eventData: {
            userId,
            userRole,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackLogout = async (userId: string, userRole: string) => {
    await trackEvent({
        eventType: "user_logged_out",
        entityId: userId,
        entityType: "user",
        eventData: {
            userId,
            userRole,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackAutoBuildRequest = async (userInput: string) => {
    await trackEvent({
        eventType: "auto_build_request",
        entityType: "feature",
        eventData: {
            userInput,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackAutoBuildAddToCart = async (configDetails: any) => {
    await trackEvent({
        eventType: "auto_build_add_to_cart",
        entityType: "feature",
        eventData: {
            ...configDetails,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackAutoBuildCustomize = async (customization: any) => {
    await trackEvent({
        eventType: "auto_build_customize",
        entityType: "feature",
        eventData: {
            ...customization,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackManualBuildPCPageView = async () => {
    await trackEvent({
        eventType: "manual_build_pc_page_view",
        entityType: "feature",
        eventData: { timestamp: new Date().toISOString() },
    });
};

export const trackManualBuildAddToCart = async (config: any) => {
    await trackEvent({
        eventType: "manual_build_pc_add_to_cart",
        entityType: "feature",
        eventData: {
            ...config,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackManualBuildComponentSelect = async (component: any) => {
    await trackEvent({
        eventType: "manual_build_pc_component_select",
        entityType: "feature",
        eventData: {
            ...component,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackManualBuildSaveConfig = async (config: any) => {
    await trackEvent({
        eventType: "manual_build_pc_save_config",
        entityType: "feature",
        eventData: {
            ...config,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackManualBuildExportExcel = async (configDetails: any) => {
    await trackEvent({
        eventType: "manual_build_pc_export_excel",
        entityType: "feature",
        eventData: {
            ...configDetails,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackPCBuildView = async (buildType: "auto" | "manual") => {
    await trackEvent({
        eventType: "pc_build_view",
        entityId: `${buildType}_build_pc`,
        entityType: "feature",
        eventData: {
            buildType,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackPageView = async (pageInfo?: any) => {
    await trackEvent({
        eventType: "page_view",
        entityType: "page",
        eventData: {
            ...pageInfo,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackSearch = async (query: string, resultsCount: number) => {
    await trackEvent({
        eventType: "search",
        entityType: "search",
        eventData: {
            query,
            resultsCount,
            timestamp: new Date().toISOString(),
        },
    });
};

export const trackChatbotSendMessage = async (message: string) => {
    const sessionId = getSessionId();

    await trackEvent({
        eventType: "chatbot_send_message",
        sessionId: sessionId,
        entityType: "chatbot",
        eventData: {
            message,
            timestamp: new Date().toISOString(),
        },
    });
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
    trackChatbotSendMessage,
};
