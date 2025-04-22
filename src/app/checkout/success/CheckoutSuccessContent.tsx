"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderDetails } from "@/api/orders";
import { updateOrderPaymentStatus } from "@/api/order";
import CheckoutSuccessPage from "@/components/checkout/CheckoutSuccessPage";
import { trackPaymentCompleted, trackDiscountUsage } from "@/api/events";

interface OrderItem {
    id?: string;
    productId?: string;
    name?: string;
    productName?: string;
    originalPrice?: number;
    finalPrice?: number;
    price?: number;
    discountAmount?: number;
    discountId?: number | string;
    discountType?: string;
}

const CheckoutSuccessContent: React.FC = () => {
    const searchParams = useSearchParams();
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [discountTracked, setDiscountTracked] = useState(false);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                // Get orderId from URL parameters - this is the most important parameter
                const orderId = searchParams.get("orderId") || searchParams.get("orderCode") || "";
                const paymentStatus = searchParams.get("status");
                const paymentCode = searchParams.get("code");
                const paymentId = searchParams.get("id");

                // If we don't have an orderId, we can't proceed
                if (!orderId) {
                    throw new Error("Order ID not found in URL parameters");
                }

                // Check if this payment has already been tracked to prevent duplicate events
                const paymentTrackingKey = `payment_tracked_${orderId}`;
                const isPaymentTracked =
                    sessionStorage.getItem(paymentTrackingKey);

                // If payment status parameters are present and we haven't tracked this payment yet, update payment status
                if (
                    paymentStatus === "PAID" &&
                    paymentCode === "00" &&
                    !isPaymentTracked
                ) {
                    await updateOrderPaymentStatus(
                        orderId,
                        paymentStatus,
                        paymentCode,
                        paymentId,
                    );

                    trackPaymentCompleted(orderId, {
                        id: paymentId,
                        status: paymentStatus,
                        paymentMethod: "PayOS",
                        amount: null,
                    });

                    // Mark this payment as tracked to prevent duplicate events
                    sessionStorage.setItem(paymentTrackingKey, "true");
                }

                const orderDetails = await getOrderDetails(orderId, true);

                if (orderDetails && orderDetails.order) {
                    setOrderData(orderDetails.order);

                    // Check if discount tracking has already been done for this order
                    const discountTrackingKey = `discount_tracked_${orderId}`;
                    const isDiscountTracked =
                        sessionStorage.getItem(discountTrackingKey);

                    // Track discount usage if not already tracked and there is a discount
                    if (
                        !isDiscountTracked &&
                        !discountTracked &&
                        orderDetails.order.discountAmount > 0
                    ) {
                        console.log(
                            "Tracking discount usage for order:",
                            orderId,
                        );

                        const itemDiscounts = orderDetails.order.items
                            .map((item: OrderItem) => ({
                                productId: item.id || item.productId,
                                productName: item.name || item.productName,
                                originalPrice: item.originalPrice,
                                finalPrice: item.finalPrice || item.price,
                                discountAmount: item.discountAmount || 0,
                                discountId: item.discountId,
                                discountType: item.discountType,
                            }))
                            .filter(
                                (item: { discountAmount: number }) =>
                                    item.discountAmount > 0,
                            );

                        // Track discount usage with all relevant information
                        trackDiscountUsage(orderId, {
                            discountAmount: orderDetails.order.discountAmount,

                            manualDiscountId:
                                orderDetails.order.manualDiscountId,
                            appliedDiscountIds:
                                orderDetails.order.appliedDiscountIds,
                            orderTotal: orderDetails.order.total,
                            orderSubtotal:
                                orderDetails.order.subtotal ||
                                orderDetails.order.total,
                        });

                        // Mark discount as tracked both in state and session storage
                        setDiscountTracked(true);
                        sessionStorage.setItem(discountTrackingKey, "true");
                    }

                    // Update payment tracking with full order information if it was successful and not tracked yet
                    if (
                        paymentStatus === "PAID" &&
                        paymentCode === "00" &&
                        !isPaymentTracked
                    ) {
                        trackPaymentCompleted(orderId, {
                            id: paymentId,
                            status: paymentStatus,
                            paymentMethod:
                                orderDetails.order.paymentMethod || "online",
                            amount:
                                orderDetails.order.totalPrice ||
                                orderDetails.order.total,
                            order: orderDetails.order,
                        });

                        // Mark payment as tracked
                        sessionStorage.setItem(paymentTrackingKey, "true");
                    }

                    // Clear cart and order data from localStorage
                    localStorage.removeItem("cart");
                    localStorage.removeItem("appliedDiscounts");
                } else {
                    throw new Error(
                        `Order ${orderId} not found or inaccessible`,
                    );
                }
            } catch (err) {
                console.error("Error fetching order data:", err);
                setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [searchParams, discountTracked]);

    return (
        <CheckoutSuccessPage
            orderData={orderData}
            loading={loading}
            error={error}
            paymentStatus={searchParams.get("status") || undefined}
            paymentCode={searchParams.get("code") || undefined}
        />
    );
};

export default CheckoutSuccessContent;
