import React, { createContext, useState, useContext, ReactNode } from "react";
import { createOrder, createGuestOrder } from "@/api/checkout";
import { toast } from "react-hot-toast";
import { validateTokenFormat } from "@/api/auth";

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface ShippingInfo {
    fullName: string;
    address: string;
    phone: string;
    email: string;
}

interface CheckoutContextType {
    orderItems: OrderItem[];
    shippingInfo: ShippingInfo | null;
    paymentLoading: boolean;
    createCheckoutOrder: (
        items: OrderItem[],
        shipping: ShippingInfo,
        notes?: string,
    ) => Promise<any>;
    clearCheckout: () => void;
    setOrderItems: (items: OrderItem[]) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
    undefined,
);

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
}

interface CheckoutProviderProps {
    children: ReactNode;
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Clear checkout data
    const clearCheckout = () => {
        setOrderItems([]);
        setShippingInfo(null);
    };

    // Create an order without immediate payment
    const createCheckoutOrder = async (
        items: OrderItem[],
        shipping: ShippingInfo,
        notes?: string,
    ) => {
        setPaymentLoading(true);
        try {
            setOrderItems(items);
            setShippingInfo(shipping);

            // Calculate order total
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );

            // Format full address
            const fullAddress = shipping.address;

            // Create order in database
            let orderResponse;

            if (localStorage.getItem("token") && validateTokenFormat()) {
                // Logged-in user checkout
                const orderCreateData = {
                    total,
                    paymentMethod: "PayOS",
                    deliveryAddress: fullAddress,
                    items: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    notes,
                };

                orderResponse = await createOrder(orderCreateData);
            } else {
                // Guest checkout
                const guestOrderData = {
                    total,
                    paymentMethod: "PayOS",
                    deliveryAddress: fullAddress,
                    customerInfo: {
                        fullName: shipping.fullName,
                        email: shipping.email,
                        phone: shipping.phone,
                    },
                    items: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    notes,
                };

                orderResponse = await createGuestOrder(guestOrderData);
            }

            // If order created successfully, store order data and return
            if (orderResponse && orderResponse.success) {
                const orderId = orderResponse.order.id;
                const orderNumber =
                    orderResponse.order.orderNumber || `ORDER-${orderId}`;

                // Store order data for success page
                localStorage.setItem(
                    "latestOrder",
                    JSON.stringify({
                        orderId: orderId,
                        orderNumber: orderNumber,
                        orderDate: new Date().toISOString(),
                        orderItems: items,
                        shippingAddress: {
                            fullName: shipping.fullName,
                            address: fullAddress,
                            city: "",
                            phone: shipping.phone,
                        },
                        paymentMethod: "PayOS",
                        subtotal: total,
                        shippingFee: 0,
                        discount: 0,
                        total,
                        status: "pending_approval",
                    }),
                );

                // Clear cart after successful order creation
                localStorage.removeItem("cart");

                return {
                    success: true,
                    order: orderResponse.order,
                };
            } else {
                throw new Error("Order creation failed");
            }
        } catch (error) {
            console.error("Error in checkout process:", error);
            toast.error(
                "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.",
            );
            throw error;
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <CheckoutContext.Provider
            value={{
                orderItems,
                shippingInfo,
                paymentLoading,
                createCheckoutOrder,
                clearCheckout,
                setOrderItems,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}
