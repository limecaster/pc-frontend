"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderDetails } from "@/api/orders"; // Use the more complete API directly
import { updateOrderPaymentStatus } from "@/api/order";
import CheckoutSuccessPage from "@/components/checkout/CheckoutSuccessPage";

const CheckoutSuccessContent: React.FC = () => {
    const searchParams = useSearchParams();
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                // Get orderId from URL parameters - this is the most important parameter
                const orderId = searchParams.get("orderId");
                const paymentStatus = searchParams.get("status");
                const paymentCode = searchParams.get("code");

                // If we don't have an orderId, we can't proceed
                if (!orderId) {
                    throw new Error("Order ID not found in URL parameters");
                }

                // If payment status parameters are present, update payment status first
                if (paymentStatus === "PAID" && paymentCode === "00") {
                    console.log(
                        "Payment success detected, updating order status",
                    );
                    await updateOrderPaymentStatus(
                        orderId,
                        paymentStatus,
                        paymentCode,
                        searchParams.get("id"), // Include PayOS ID if present
                    );
                }

                // Use the proper API endpoint for fetching complete order details
                console.log("Fetching order details for ID:", orderId);
                const orderDetails = await getOrderDetails(orderId, true);
                console.log("Order details response:", orderDetails);

                if (orderDetails && orderDetails.order) {
                    setOrderData(orderDetails.order);

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
    }, [searchParams]);

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
