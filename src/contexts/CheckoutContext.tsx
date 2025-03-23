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
        items: CartItem[],
        shippingInfo: ShippingInfo,
        notes?: string,
        discountInfo?: DiscountInfo, // Add discountInfo parameter
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
        items: CartItem[],
        shippingInfo: ShippingInfo,
        notes?: string,
        discountInfo?: DiscountInfo, // Add discountInfo parameter
    ) => {
        setLoading(true);
        setError(null);
        try {
            const isAuthenticated = !!localStorage.getItem("token");
            const orderItems = items.map((item) => ({
                productId: item.productId || item.id,
                quantity: item.quantity,
                price: item.price,
            }));

            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );

            // Calculate total with discount applied
            const subtotal = total;
            let finalTotal = total;
            if (discountInfo?.discountAmount) {
                finalTotal = Math.max(0, total - discountInfo.discountAmount);
            }

            const orderData = {
                total: finalTotal,
                subtotal: subtotal, // Add subtotal field
                paymentMethod: "PAYOS", // Default payment method
                deliveryAddress: shippingInfo.address,
                items: orderItems,
                notes: notes || "",
                // Add discount information
                discountAmount: discountInfo?.discountAmount || 0,
                manualDiscountId: discountInfo?.isManual
                    ? discountInfo.discountId
                    : undefined,
                appliedDiscountIds: !discountInfo?.isManual
                    ? discountInfo?.automaticDiscountIds
                    : undefined,
            };

            let result;

            if (isAuthenticated) {
                // Authenticated user checkout
                result = await createOrder(orderData);
            } else {
                // Guest checkout with additional shipping info
                result = await createGuestOrder({
                    ...orderData,
                    customerName: shippingInfo.fullName,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                });
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
            const errorMessage =
                (err as Error).message || "Không thể tạo đơn hàng.";
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Add missing function for checking order payment status
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

    // Add missing function for initiating order payment
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
