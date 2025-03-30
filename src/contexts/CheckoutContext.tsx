import React, { createContext, useContext, useState } from "react";
import { createOrder, createGuestOrder } from "@/api/checkout";
import { toast } from "react-hot-toast";
import { processPayment, checkPaymentStatus } from "@/api/checkout";

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface ShippingInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

interface DiscountInfo {
    discountId?: number;
    discountCode?: string;
    discountAmount: number;
    isManual: boolean;
    automaticDiscountIds?: number[];
}

interface CheckoutContextProps {
    loading: boolean;
    error: string | null;
    orderData: any;
    createCheckoutOrder: (
        orderData: any, // First parameter is the full order data
        shippingInfo: {
            // Second parameter is shipping info
            fullName: string;
            email: string;
            phone: string;
            address: string;
        },
        notes?: string, // Third parameter is optional notes
    ) => Promise<any>;
    checkOrderPaymentStatus: (orderId: string) => Promise<any>;
    initiateOrderPayment: (orderId: string) => Promise<any>;
    clearOrder: () => void;
    setError: (error: string | null) => void;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(
    undefined,
);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);

    const createCheckoutOrder = async (
        orderData: any,
        shippingInfo: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
        },
        notes: string = "",
    ) => {
        setLoading(true);
        setError(null);
        try {
            const isAuthenticated = !!localStorage.getItem("token");

            if (!orderData.orderItems) {
                console.error(
                    "Order items are missing in the order data",
                    orderData,
                );
                throw new Error(
                    "Dữ liệu đơn hàng không hợp lệ. Vui lòng thử lại.",
                );
            }

            // Map the order items from the received structure
            const orderItems = orderData.orderItems.map((item: any) => ({
                productId: item.productId || item.id,
                quantity: item.quantity,
                price: item.price,
                // Pass along the discount information - only include if values exist
                ...(item.originalPrice && {
                    originalPrice: item.originalPrice,
                }),
                ...(item.finalPrice && { finalPrice: item.finalPrice }),
                ...(item.discountAmount > 0 && {
                    discountAmount: item.discountAmount,
                }),
                ...(item.discountType && { discountType: item.discountType }),
                ...(item.discountId && { discountId: item.discountId }),
            }));

            // Use the total from the incoming order data
            const subtotal = orderData.subtotal || 0;
            const finalTotal = orderData.total || subtotal;

            // Create payload with correct field names matching the database entity fields
            const payload = {
                // Customer information with correct field names
                // customerName: shippingInfo.fullName, // Use customerName instead of fullName
                // customerPhone: shippingInfo.phone, // Use customerPhone instead of phone
                // email is not directly on the Order entity - may be in customer relationship
                deliveryAddress: shippingInfo.address,

                // Order items
                items: orderItems,

                // Financial information
                total: finalTotal,
                subtotal: subtotal,
                paymentMethod: "PayOS",

                // Optional fields
                notes: notes || "",

                // Discount information - only include if values exist
                ...(orderData.discountAmount > 0 && {
                    discountAmount: orderData.discountAmount,
                }),
                ...(orderData.manualDiscountId && {
                    manualDiscountId: orderData.manualDiscountId,
                }),
                ...(orderData.appliedDiscountIds && {
                    appliedDiscountIds: orderData.appliedDiscountIds,
                }),
            };

            console.log(
                "Sending order payload:",
                JSON.stringify(payload, null, 2),
            );

            let result;

            if (isAuthenticated) {
                // Authenticated user checkout
                result = await createOrder(payload);
            } else {
                // Guest checkout
                result = await createGuestOrder(payload);
            }

            if (result.success) {
                setOrderData(result.order);
                toast.success("Đơn hàng đã được tạo thành công!");

                // Clear cart from localStorage after successful order
                localStorage.removeItem("cart");
                // Also clear applied discounts
                localStorage.removeItem("appliedDiscounts");

                return result;
            } else {
                throw new Error(
                    result.message ||
                        "Không thể tạo đơn hàng. Vui lòng thử lại.",
                );
            }
        } catch (err) {
            console.error("Error creating order:", err);

            // Log more details for debugging
            if (err instanceof Error) {
                console.error("Error details:", err.message);

                // If the error contains information about request validation issues,
                // try to extract a more user-friendly message
                const errorMsg = err.message;
                if (
                    errorMsg.includes("validation failed") ||
                    errorMsg.includes("Bad Request")
                ) {
                    setError(
                        "Có lỗi khi tạo đơn hàng: Thông tin đơn hàng không hợp lệ",
                    );
                    return {
                        success: false,
                        message:
                            "Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại.",
                    };
                }
            }

            const errorMessage =
                (err as Error).message || "Không thể tạo đơn hàng.";
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const checkOrderPaymentStatus = async (orderId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await checkPaymentStatus(orderId);
            return result;
        } catch (err) {
            console.error("Error checking payment status:", err);
            const errorMessage =
                (err as Error).message ||
                "Không thể kiểm tra trạng thái thanh toán.";
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const initiateOrderPayment = async (orderId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await processPayment({ orderId });
            if (!result.success) {
                throw new Error(
                    result.message || "Không thể khởi tạo thanh toán",
                );
            }
            return result;
        } catch (err) {
            console.error("Error initiating payment:", err);
            const errorMessage =
                (err as Error).message || "Không thể khởi tạo thanh toán.";
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearOrder = () => {
        setOrderData(null);
    };

    return (
        <CheckoutContext.Provider
            value={{
                loading,
                error,
                orderData,
                createCheckoutOrder,
                checkOrderPaymentStatus,
                initiateOrderPayment,
                clearOrder,
                setError,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = (): CheckoutContextProps => {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
};
