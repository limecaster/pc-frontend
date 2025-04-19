import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import PayOSPayment from "./PayOSPayment";
import { initiateOrderPayment } from "@/api/order";
import { API_URL } from "@/config/constants";
import { LoaderCircle } from "lucide-react";

interface PaymentModeProps {
    orderId: string | null;
    paymentAmount: number;
    paymentData: any;
}

const PaymentMode: React.FC<PaymentModeProps> = ({
    orderId,
    paymentAmount,
    paymentData,
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<any>(null);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // This useEffect handles initialization and retries
    useEffect(() => {
        // If payment data already has the required fields, use it
        if (
            paymentData &&
            paymentData.checkoutUrl &&
            paymentData.paymentLinkId
        ) {
            setPaymentDetails(paymentData);
            return;
        }

        // If we have payment data but without required fields, try to extract what we can
        if (paymentData) {
            // Even if we don't have complete data, use what we do have
            setPaymentDetails({
                ...paymentData,
                paymentLinkId: paymentData.paymentLinkId || orderId,
                checkoutUrl:
                    paymentData.checkoutUrl ||
                    `${API_URL}/payment/pay/${orderId}`,
            });
        }

        // If no payment data or we've retried less than 2 times, fetch fresh payment details
        if ((!paymentData || !paymentDetails) && orderId && retryCount < 2) {
            fetchPaymentDetails(orderId);
        } else if (retryCount >= 2) {
            // After retries, switch to fallback mode

            setFallbackMode(true);
        }
    }, [orderId, paymentData, retryCount]);

    const fetchPaymentDetails = async (id: string) => {
        try {
            setIsLoading(true);

            const result = await initiateOrderPayment(id);

            if (result.success) {
                if (result.data && result.data.checkoutUrl) {
                    // We have complete payment data
                    setPaymentDetails(result.data);
                    setFallbackMode(false);
                } else {
                    // We have success but incomplete payment data - create fallback data

                    setPaymentDetails({
                        finalPrice: result.finalPrice || paymentAmount,
                        orderId: id,
                        paymentLinkId: id,
                        checkoutUrl: `${API_URL}/payment/pay/${id}`,
                    });
                    // Still set fallback mode since we don't have complete payment info
                    setFallbackMode(true);
                }
            } else {
                setRetryCount((prev) => prev + 1);
                toast.error(
                    "Không thể tạo thông tin thanh toán, đang thử lại...",
                );
            }
        } catch (err) {
            console.error("Error fetching payment details:", err);
            setRetryCount((prev) => prev + 1);
            if (retryCount >= 1) {
                toast.error("Không thể khởi tạo thanh toán");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Fallback direct payment handler
    const handleDirectPay = () => {
        // Create a URL to the backend direct payment endpoint
        const payUrl = `${API_URL}/payment/pay/${orderId}`;
        window.location.href = payUrl;
    };

    // Return to orders page handler
    const handleCancel = () => {
        router.push("/dashboard/orders");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3">Đang tạo thông tin thanh toán...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">
                Thanh toán đơn hàng #{orderId}
            </h2>

            <div className="mb-6">
                <p className="text-lg font-medium">
                    Tổng số tiền thanh toán: {formatCurrency(paymentAmount)}
                </p>
            </div>

            {fallbackMode ? (
                <div className="text-center">
                    <p className="mb-6 text-red-500">
                        Không thể hiển thị biểu mẫu thanh toán nhúng. Vui lòng
                        sử dụng liên kết bên dưới để thanh toán.
                    </p>

                    <button
                        onClick={handleDirectPay}
                        className="bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors w-full max-w-xs mb-4"
                    >
                        Thanh toán ngay
                    </button>

                    <button
                        onClick={handleCancel}
                        className="bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors w-full max-w-xs"
                    >
                        Huỷ thanh toán
                    </button>
                </div>
            ) : (
                <PayOSPayment
                    paymentData={paymentDetails}
                    onSuccess={() => {
                        toast.success("Thanh toán thành công!");
                        router.push(`/track-order/${orderId}`);
                    }}
                    onError={(error) => {
                        // Switch to fallback mode if embedded payment fails
                        setFallbackMode(true);
                        toast.error(
                            "Không thể tải biểu mẫu thanh toán, chuyển sang phương thức thay thế",
                        );
                    }}
                />
            )}
        </div>
    );
};

export default PaymentMode;
