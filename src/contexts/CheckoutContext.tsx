import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
} from "react";
import { processPayment, createOrder, createGuestOrder } from "@/api/checkout";
import { toast } from "react-hot-toast";
import { validateTokenFormat } from "@/api/auth";
import { useRouter } from "next/navigation";

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
        shippingInfo: ShippingInfo,
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
    const router = useRouter();
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Clear checkout data
    const clearCheckout = () => {
        setOrderItems([]);
        setShippingInfo(null);
    };

    // Create an order and process payment
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

            // Prepare order data
            const orderData = {
                orderId: `ORDER-${Date.now()}`,
                items: items.map((item) => ({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                customer: {
                    fullName: shipping.fullName,
                    email: shipping.email,
                    phone: shipping.phone,
                    address: fullAddress,
                },
                total,
                subtotal: total,
                shippingFee: 0,
                discount: 0,
                notes,
                paymentMethod: "PayOS",
                returnUrl: window.location.origin + "/checkout/success",
                cancelUrl: window.location.origin + "/checkout/failure",
            };

            // Create order in database first
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

            // If order created successfully, process payment
            if (orderResponse && orderResponse.success) {
                // Update order ID with the one from database
                orderData.orderId = orderResponse.order.id.toString();
                // orderData.description = `Order #${orderResponse.order.id}`;

                // Process payment
                const paymentResponse = await processPayment(orderData);

                if (paymentResponse && paymentResponse.success) {
                    // Store order data for success page
                    localStorage.setItem(
                        "latestOrder",
                        JSON.stringify({
                            orderId:
                                paymentResponse.originalOrderId ||
                                orderData.orderId,
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
                        }),
                    );

                    // Return payment data for redirect
                    return paymentResponse.data;
                } else {
                    throw new Error("Payment processing failed");
                }
            } else {
                throw new Error("Order creation failed");
            }
        } catch (error) {
            console.error("Error in checkout process:", error);
            toast.error(
                "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
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
