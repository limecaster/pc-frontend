"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutSuccessPageComponent from "@/components/checkout/CheckoutSuccessPage";
import { trackOrder, updateOrderPaymentStatus } from "@/api/order"; // Updated import

const CheckoutSuccessContent = () => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null); // Fix: Changed type to string | null

    // Extract parameters from URL
    const orderId = searchParams.get("orderId");
    const paymentStatus = searchParams.get("status");
    const paymentCode = searchParams.get("code");
    const orderCode = searchParams.get("orderCode");
    const cancel = searchParams.get("cancel");

    useEffect(() => {
        document.title = "B Store - Thanh toán thành công";

        // Fetch order details only if we have orderId
        if (orderId) {
            // If we have payment success parameters, call payment success endpoint
            if (paymentStatus === "PAID" && paymentCode === "00") {
                updateOrderPaymentStatus(
                    orderId,
                    paymentStatus,
                    paymentCode,
                ).then(() => fetchOrderDetails());
            } else {
                fetchOrderDetails();
            }
        } else {
            setError("Không tìm thấy thông tin đơn hàng");
            setLoading(false);
        }
    }, [orderId, paymentStatus, paymentCode]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);

            if (!orderId) {
                throw new Error("Missing order ID");
            }

            const result = await trackOrder(orderId); // Now orderId is guaranteed to be non-null

            if (result?.success && result?.order) {
                console.log("Order details fetched:", result.order);

                // Set payment status in the order data based on PayOS response
                const isPaid = paymentStatus === "PAID" && paymentCode === "00";

                // Create order data object with payment info
                setOrderData({
                    ...result.order,
                    paymentStatus: isPaid
                        ? "payment_success"
                        : result.order.status,
                    paymentCode,
                    orderCode,
                });
            } else {
                throw new Error(
                    result?.message || "Không thể tải thông tin đơn hàng",
                );
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            // Fix: Handle unknown error type properly
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Đã xảy ra lỗi khi tải thông tin đơn hàng";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Pass the fetched data to the component
    // Fix: Convert null to undefined for props expecting string|undefined
    return (
        <CheckoutSuccessPageComponent
            orderData={orderData}
            loading={loading}
            error={error}
            paymentStatus={paymentStatus || undefined}
            paymentCode={paymentCode || undefined}
        />
    );
};

export default CheckoutSuccessContent;
