"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import { LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkPaymentStatus } from "@/api/checkout";

interface PayOSPaymentProps {
    paymentData: {
        checkoutUrl: string;
        paymentLinkId: string;
    } | null;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const PayOSPayment: React.FC<PayOSPaymentProps> = ({
    paymentData,
    onSuccess,
    onError,
}) => {
    const [isPayOSLoaded, setIsPayOSLoaded] = useState(false);
    const [paymentInitialized, setPaymentInitialized] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 minutes countdown
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isPayOSLoaded && paymentData && !paymentInitialized) {
            try {
                console.log("Initializing PayOS with data:", paymentData);

                // Make sure we have the required fields
                if (!paymentData.paymentLinkId) {
                    console.error(
                        "Missing paymentLinkId in paymentData:",
                        paymentData,
                    );
                    onError("Thiếu thông tin thanh toán");
                    return;
                }

                try {
                    // @ts-expect-error - PayOS is loaded from external script
                    const payOS = new window.PayOS();

                    // Try initializing with minimal configuration if some fields are missing
                    const payOSConfig = {
                        paymentLinkId: paymentData.paymentLinkId,
                        containerID: "payos-checkout",
                        onSuccess: function (data: any) {
                            console.log("Payment success:", data);
                            onSuccess();
                        },
                        onError: function (error: any) {
                            console.error("PayOS initialization error:", error);
                            onError(
                                "Thanh toán thất bại. Vui lòng thử lại sau.",
                            );
                        },
                        onClose: function () {
                            console.log("Payment closed");
                        },
                    };

                    // Log the config we're using
                    console.log("PayOS init config:", payOSConfig);

                    // Initialize PayOS
                    payOS.init(payOSConfig);
                    setPaymentInitialized(true);
                } catch (error) {
                    console.error("Error creating PayOS instance:", error);
                    throw new Error("Failed to initialize payment form");
                }
            } catch (error) {
                console.error("Error in PayOS initialization:", error);
                onError("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
            }
        }
    }, [isPayOSLoaded, paymentData, paymentInitialized, onSuccess, onError]);

    // Timer for countdown
    useEffect(() => {
        if (countdown <= 0) {
            setError("Thời gian thanh toán đã hết hạn. Vui lòng thử lại.");
            onError("Payment session expired");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, onError]);

    // Format countdown to MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    // Poll payment status
    useEffect(() => {
        if (!paymentData?.paymentLinkId) return;

        const checkStatus = async () => {
            try {
                setIsChecking(true);
                const response = await checkPaymentStatus(
                    paymentData.paymentLinkId,
                );

                if (response.success && response.status === "PAID") {
                    console.log("Payment completed successfully!", response);
                    // If the server updated the order, include the orderId in success
                    if (response.orderUpdated && response.orderId) {
                        // Store additional order info in localStorage
                        const existingOrder =
                            localStorage.getItem("latestOrder");
                        if (existingOrder) {
                            try {
                                const orderData = JSON.parse(existingOrder);
                                orderData.orderId = response.orderId.toString();
                                localStorage.setItem(
                                    "latestOrder",
                                    JSON.stringify(orderData),
                                );
                            } catch (e) {
                                console.error(
                                    "Error updating order data in localStorage:",
                                    e,
                                );
                            }
                        }
                    }
                    onSuccess();
                    return true; // Return true to indicate success
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            } finally {
                setIsChecking(false);
            }
            return false; // Return false if payment not completed
        };

        // Initial check
        checkStatus();

        // Set up polling
        const interval = setInterval(async () => {
            const success = await checkStatus();
            if (success) {
                clearInterval(interval); // Stop polling if payment is successful
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [paymentData, onSuccess]);

    // Open in new window - modify this function to create a fallback URL if needed
    const openPaymentWindow = () => {
        if (paymentData?.checkoutUrl) {
            window.open(paymentData.checkoutUrl, "_blank");
        } else {
            onError("Không tìm thấy thông tin thanh toán");
        }
    };

    if (!paymentData) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-gray-600">
                    Đang tải thông tin thanh toán...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Lỗi thanh toán</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <Script
                src="https://cdn.payos.vn/checkout/1.0/payos-checkout.min.js"
                strategy="lazyOnload"
                onLoad={() => setIsPayOSLoaded(true)}
            />
            <div id="payos-checkout" className="w-full min-h-[400px]"></div>

            {/* <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <QRCode
                    value={paymentData.checkoutUrl}
                    size={200}
                    className="mx-auto"
                />
                <p className="text-center mt-3 text-sm text-gray-500">
                    Quét mã QR để thanh toán
                </p>
                <p className="text-center text-sm text-primary font-medium mt-1">
                    Thời gian còn lại: {formatTime(countdown)}
                </p>
            </div> */}

            <button
                onClick={openPaymentWindow}
                className="bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors w-full max-w-xs mb-4"
            >
                Mở cổng thanh toán
            </button>

            <div className="flex items-center mt-2">
                {isChecking && (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2 text-primary" />
                )}
                <p className="text-sm text-gray-600">
                    {isChecking
                        ? "Đang kiểm tra trạng thái thanh toán..."
                        : "Hệ thống sẽ tự động chuyển hướng khi thanh toán hoàn tất"}
                </p>
            </div>
        </div>
    );
};

export default PayOSPayment;
