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
 * Initiate payment for an approved order
 * @param orderId ID of the order to pay for
 * @returns Promise with payment initiation response
 */
export async function initiateOrderPayment(orderId: string) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.message ||
                    `Failed to initiate payment: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error initiating payment:", error);
        throw error;
    }
}

/**
 * Track an order by ID or order number with JWT authentication if available
 * @param orderIdentifier Order ID or order number to track
 * @returns Order tracking information
 */
export async function trackOrder(orderIdentifier: string | number) {
    const cacheKey = `track-${orderIdentifier}`;
    const now = Date.now();

    // Check if we have a cached recent request
    if (
        requestCache[cacheKey] &&
        now - requestCache[cacheKey].timestamp < CACHE_TIME
    ) {
        console.log(`Using cached request for order ${orderIdentifier}`);
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            console.log(`Making fresh API call for order ${orderIdentifier}`);

            // Add token to headers if available
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
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
        console.log(`Verifying email for order ${orderId}`);
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
        console.log(`Verifying OTP for order ${orderId}`);
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
        console.log(`Using cached verification request for order ${orderId}`);
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            console.log(`Making verified API call for order ${orderId}`);
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
 * @param orderId Order ID or order number to track
 * @param email Email associated with the order
 * @returns Promise with the request result
 */
export async function requestOrderTrackingOTP(
    orderId: string | number,
    email: string,
) {
    const cacheKey = `request-otp-${orderId}-${email}`;
    const now = Date.now();

    // Check if we have a cached recent request
    if (
        requestCache[cacheKey] &&
        now - requestCache[cacheKey].timestamp < CACHE_TIME
    ) {
        console.log(`Using cached OTP request for order ${orderId}`);
        return requestCache[cacheKey].promise;
    }

    try {
        // Create the request
        const requestPromise = (async () => {
            console.log(
                `Requesting OTP for order ${orderId} with email ${email}`,
            );

            // No need to parse as number anymore
            // const orderIdNum = Number(orderId);
            // if (isNaN(orderIdNum)) {
            //     throw new Error("Invalid order ID: must be a number");
            // }

            const response = await fetch(`${API_URL}/orders/track/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId, // Send as is, no conversion needed
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
 * @param orderId Order ID or order number to track
 * @param email Email associated with the order
 * @param otp OTP code received by email
 * @returns Order tracking information
 */
export async function verifyOrderTrackingOTP(
    orderId: string | number,
    email: string,
    otp: string,
) {
    try {
        console.log(`Verifying OTP for order ${orderId}`);

        // No need to parse as number anymore
        // const orderIdNum = Number(orderId);
        // if (isNaN(orderIdNum)) {
        //     throw new Error("Invalid order ID: must be a number");
        // }

        const response = await fetch(`${API_URL}/orders/track/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderId: orderId, // Send as is, no conversion needed
                email: email,
                otp: otp,
            }),
        });

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
