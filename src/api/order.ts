import { API_URL } from "@/config/constants";

// Add cache to prevent duplicate requests
const requestCache: Record<
    string,
    { timestamp: number; promise: Promise<any> }
> = {};
const CACHE_TIME = 2000; // 2 seconds

/**
 * Cancel an order
 * @param orderId ID of the order to cancel
 * @returns Promise with cancellation response
 */
export async function cancelOrder(orderId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message || `Failed to cancel order: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error cancelling order:", error);
        throw error;
    }
}

/**
 * Initiate payment for an existing order
 * @param orderId The ID of the order to pay for
 * @returns Promise with payment info including checkout URL
 */
export async function initiateOrderPayment(
    orderId: string | number,
): Promise<any> {
    try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Use the order-specific payment endpoint which returns the complete payment data
        // This endpoint is implemented in OrderController.initiatePayment
        const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                // Include frontend URLs with orderId to ensure proper redirection
                returnUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
                cancelUrl: `${window.location.origin}/checkout/failure?orderId=${orderId}`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || `Payment initiation failed: ${response.status}`,
            );
        }

        return data;
    } catch (error) {
        console.error("Error initiating payment:", error);
        throw error;
    }
}

/**
 * Update order payment status after successful payment
 * @param orderId The order ID or PayOS transaction ID for finding the order
 * @param paymentStatus Status from payment provider
 * @param paymentCode Code from payment provider
 * @param payosId Optional PayOS transaction ID
 * @returns Promise with the update result
 */
export async function updateOrderPaymentStatus(
    orderId: string | number,
    paymentStatus: string | null,
    paymentCode: string | null,
    payosId?: string | null,
): Promise<any> {
    try {
        // Construct URL with query parameters
        const url = new URL(`${API_URL}/payment/success`);

        // Special handling for "auto" mode - we use the payosId directly
        if (orderId === "auto" && payosId) {
            url.searchParams.append("paymentId", payosId);
        } else if (orderId && orderId !== "auto") {
            url.searchParams.append("orderId", orderId.toString());
        }

        if (paymentStatus) url.searchParams.append("status", paymentStatus);
        if (paymentCode) url.searchParams.append("code", paymentCode);
        if (payosId) url.searchParams.append("id", payosId);

        // Call the payment success endpoint directly to ensure DB update
        const response = await fetch(url.toString(), { method: "GET" });

        const result = await response.json();

        return result;
    } catch (error) {
        console.error("Error updating payment status:", error);
        return {
            success: false,
            message: "Failed to update payment status",
        };
    }
}

/**
 * Track an order by ID or order number with JWT authentication if available
 * @param orderIdentifier Order ID or order number to track
 * @returns Order tracking information with authentication status
 */
export async function trackOrder(orderIdentifier: string | number) {
    const cacheKey = `track-${orderIdentifier}`;
    const now = Date.now();

    // Check if we have a cached recent request
    if (
        requestCache[cacheKey] &&
        now - requestCache[cacheKey].timestamp < CACHE_TIME
    ) {
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            // Add token to headers if available - make sure it's properly formatted
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
                // Use Bearer authentication scheme
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_URL}/orders/track/${orderIdentifier}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Failed to track order: ${response.status}`,
                );
            }

            return await response.json();
        })();

        // Cache the request promise
        requestCache[cacheKey] = {
            timestamp: now,
            promise: requestPromise,
        };

        // Auto-cleanup old cache entries
        setTimeout(() => {
            if (requestCache[cacheKey]?.timestamp === now) {
                delete requestCache[cacheKey];
            }
        }, CACHE_TIME + 1000);

        return requestPromise;
    } catch (error) {
        console.error("Error tracking order:", error);
        throw error;
    }
}

/**
 * Verify customer email for order tracking
 * @param orderId Order ID to verify
 * @param email Email associated with the order
 * @returns Promise with verification result
 */
export async function verifyOrderEmail(
    orderId: string | number,
    email: string,
) {
    try {
        const response = await fetch(
            `${API_URL}/orders/track/${orderId}/verify-email`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to verify email: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error verifying email:", error);
        throw error;
    }
}

/**
 * Verify OTP for order tracking
 * @param orderId Order ID to verify
 * @param email Email associated with the order
 * @param otp OTP code received by email
 * @returns Order tracking information with full details
 */
export async function verifyOrderOTP(
    orderId: string | number,
    email: string,
    otp: string,
) {
    try {
        const response = await fetch(
            `${API_URL}/orders/track/${orderId}/verify-otp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `Failed to verify OTP: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
}

/**
 * Verify customer identity and track order with full details
 * @param orderId Order ID to track
 * @param verificationData Customer email or phone number for verification
 * @returns Order tracking information
 */
export async function verifyAndTrackOrder(
    orderId: string | number,
    verificationData: string,
) {
    const cacheKey = `verify-track-${orderId}-${verificationData}`;
    const now = Date.now();

    // Check if we have a cached recent request
    if (
        requestCache[cacheKey] &&
        now - requestCache[cacheKey].timestamp < CACHE_TIME
    ) {
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            const response = await fetch(`${API_URL}/orders/track`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId,
                    verificationData: verificationData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Failed to verify order: ${response.status}`,
                );
            }

            return await response.json();
        })();

        // Cache the request promise
        requestCache[cacheKey] = {
            timestamp: now,
            promise: requestPromise,
        };

        // Auto-cleanup old cache entries
        setTimeout(() => {
            if (requestCache[cacheKey]?.timestamp === now) {
                delete requestCache[cacheKey];
            }
        }, CACHE_TIME + 1000);

        return requestPromise;
    } catch (error) {
        console.error("Error verifying order:", error);
        throw error;
    }
}

/**
 * Request an OTP to verify order tracking access
 * @param orderNumber Order ID or order number to track
 * @param email Email associated with the order
 * @returns Promise with the request result
 */
export async function requestOrderTrackingOTP(
    orderNumber: string | number,
    email: string,
) {
    const cacheKey = `request-otp-${orderNumber}-${email}`;
    const now = Date.now();

    // Check if we have a cached recent request
    if (
        requestCache[cacheKey] &&
        now - requestCache[cacheKey].timestamp < CACHE_TIME
    ) {
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            const response = await fetch(`${API_URL}/orders/track/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderNumber: orderNumber,
                    email: email,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Failed to request OTP: ${response.status}`,
                );
            }

            return await response.json();
        })();

        // Cache the request promise
        requestCache[cacheKey] = {
            timestamp: now,
            promise: requestPromise,
        };

        // Auto-cleanup old cache entries
        setTimeout(() => {
            if (requestCache[cacheKey]?.timestamp === now) {
                delete requestCache[cacheKey];
            }
        }, CACHE_TIME + 1000);

        return requestPromise;
    } catch (error) {
        console.error("Error requesting OTP:", error);
        throw error;
    }
}

/**
 * Verify OTP and get full order tracking details
 * @param orderNumber Order ID or order number to track
 * @param email Email associated with the order
 * @param otp OTP code received by email
 * @returns Order tracking information
 */
export async function verifyOrderTrackingOTP(
    orderNumber: string | number,
    email: string,
    otp: string,
) {
    try {
        const response = await fetch(`${API_URL}/orders/track/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderNumber: orderNumber,
                email: email.trim().toLowerCase(), // Normalize email
                otp: otp.trim(), // Remove any accidental whitespace
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error verifying OTP:", errorData);
            throw new Error(
                errorData.message || `Failed to verify OTP: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
}
