"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { getCart } from "@/api/cart";
import { useCheckout } from "@/contexts/CheckoutContext";
import { initiateOrderPayment } from "@/api/order";
import { getOrderDetails } from "@/api/checkout";

// Import our new modular components
import ShippingForm, { CheckoutFormData } from "./ShippingForm";
// Rename the imported Product type to avoid conflict with our local interface
import CartSummary, {
    Product as CartSummaryProduct,
    Discount,
} from "./CartSummary";
import PaymentSection from "./PaymentSection";
import PaymentMode from "./PaymentMode";

// Dynamically import Alert components to prevent SSR issues
const Alert = dynamic(
    () => import("@/components/ui/alert").then((mod) => mod.Alert),
    { ssr: false },
);
const AlertTitle = dynamic(
    () => import("@/components/ui/alert").then((mod) => mod.AlertTitle),
    { ssr: false },
);
const AlertDescription = dynamic(
    () => import("@/components/ui/alert").then((mod) => mod.AlertDescription),
    { ssr: false },
);

interface CheckoutPageProps {
    paymentOnly?: boolean;
    existingOrderId?: string;
    appliedDiscount: Discount | null;
    appliedAutomaticDiscounts: Discount[];
    manualDiscountAmount: number;
    automaticDiscountAmount: number;
    totalDiscount: number;
    isUsingManualDiscount: boolean;
}

// Use our own Product interface for this component
export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    originalPrice?: number;
    // Add missing discount properties
    discountAmount?: number;
    discountType?: "percentage" | "fixed" | "none";
    discountId?: string | number;
    discountSource?: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
    paymentOnly = false,
    existingOrderId = "",
    appliedDiscount,
    appliedAutomaticDiscounts,
    manualDiscountAmount,
    automaticDiscountAmount,
    totalDiscount,
    isUsingManualDiscount,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { createCheckoutOrder } = useCheckout();

    // States
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        houseNumber: "",
        streetName: "",
        province: "",
        district: "",
        ward: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [paymentData, setPaymentData] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Payment mode states (from URL parameters)
    const mode = searchParams.get("mode");
    const orderId = searchParams.get("orderId");
    const [isPaymentMode, setIsPaymentMode] = useState(false);
    const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    // Calculate order totals
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );
    const deliveryFee = 0; // Free shipping

    // Load cart data
    useEffect(() => {
        const loadCart = async () => {
            setIsLoadingCart(true);
            try {
                // First try to load from API if user is logged in
                if (localStorage.getItem("token")) {
                    try {
                        const response = await getCart();
                        if (response.success && response.cart) {
                            // Map cart items from API to the Product interface with safety checks
                            const apiCartItems =
                                response.cart.items
                                    ?.map((item: any) => {
                                        // Handle both possible structures:
                                        // 1. Item with nested product object: { product: { id, name, ... }, quantity, ... }
                                        // 2. Item with flat structure: { id, productId, productName, quantity, ... }

                                        if (
                                            item.productId &&
                                            item.productName
                                        ) {
                                            // Flat structure
                                            return {
                                                id: item.productId,
                                                name: item.productName,
                                                price:
                                                    parseFloat(
                                                        item.price ||
                                                            item.subPrice /
                                                                item.quantity,
                                                    ) || 0,
                                                quantity: item.quantity || 1,
                                                imageUrl:
                                                    item.imageUrl ||
                                                    "/images/placeholder.png",
                                            };
                                        } else if (item.product) {
                                            // Nested structure
                                            return {
                                                id:
                                                    item.product.id ||
                                                    `temp-${Date.now()}-${Math.random()}`,
                                                name:
                                                    item.product.name ||
                                                    "Unknown Product",
                                                price:
                                                    parseFloat(
                                                        item.product.price,
                                                    ) || 0,
                                                quantity: item.quantity || 1,
                                                imageUrl:
                                                    item.product.imageUrl ||
                                                    (item.product.images &&
                                                        item.product
                                                            .images[0]) ||
                                                    "/images/placeholder.png",
                                            };
                                        } else {
                                            console.error(
                                                "Unrecognized cart item structure:",
                                                item,
                                            );
                                            return null;
                                        }
                                    })
                                    .filter(Boolean) || []; // Filter out any null items

                            setCartItems(apiCartItems);

                            // Also update localStorage for consistency
                            localStorage.setItem(
                                "cart",
                                JSON.stringify(apiCartItems),
                            );
                            return;
                        }
                    } catch (error) {
                        console.error("Error loading cart from API:", error);
                        // Fall back to localStorage if API fails
                    }
                }

                // If API call fails or user is not logged in, try localStorage
                const storedCart = localStorage.getItem("cart");
                if (storedCart) {
                    try {
                        const parsedCart = JSON.parse(storedCart);

                        // Ensure all cart items have necessary properties
                        const validCartItems = parsedCart.filter(
                            (item: any) =>
                                item && typeof item === "object" && item.id,
                        );

                        setCartItems(validCartItems);
                    } catch (error) {
                        console.error(
                            "Error parsing cart from localStorage:",
                            error,
                        );
                        setCartItems([]);
                    }
                }
            } catch (error) {
                console.error("Error loading cart:", error);
                setCartItems([]);
            } finally {
                setIsLoadingCart(false);
            }
        };

        loadCart();
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        if (!isLoadingCart) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems, isLoadingCart]);

    // Handle payment mode
    useEffect(() => {
        if (mode === "pay" && orderId) {
            // Retrieve the payment data from sessionStorage
            const paymentDataString = sessionStorage.getItem(
                `payment_data_${orderId}`,
            );
            if (paymentDataString) {
                try {
                    const paymentData = JSON.parse(paymentDataString);
                    const timestamp = paymentData.timestamp || 0;
                    const now = new Date().getTime();

                    // Only use the data if it's less than 5 minutes old
                    if (now - timestamp < 5 * 60 * 1000) {
                        setIsPaymentMode(true);
                        setPaymentOrderId(orderId);
                        setPaymentAmount(paymentData.finalPrice || 0);

                        // If we have complete payment data in the stored object, use it directly
                        if (
                            paymentData.paymentData &&
                            (paymentData.paymentData.checkoutUrl ||
                                paymentData.paymentData.paymentLinkId)
                        ) {
                            setPaymentData(paymentData.paymentData);
                        } else {
                            // Otherwise fetch payment details
                            fetchPaymentDetails(orderId);
                        }
                    } else {
                        // Data is too old, clean it up
                        sessionStorage.removeItem(`payment_data_${orderId}`);
                        toast.error(
                            "Thông tin thanh toán đã hết hạn. Vui lòng thử lại.",
                        );
                        router.push("/dashboard/orders");
                    }
                } catch (err) {
                    console.error("Error parsing payment data:", err);
                    toast.error("Có lỗi xảy ra khi khởi tạo thanh toán");
                    router.push("/dashboard/orders");
                }
            } else {
                toast.error("Không tìm thấy thông tin thanh toán");
                router.push("/dashboard/orders");
            }
        }
    }, [mode, orderId, router]);

    // Fetch payment details for an order
    const fetchPaymentDetails = async (orderId: string) => {
        try {
            setIsLoadingCart(true);

            // Try to get payment details directly from the payment API first
            try {
                const paymentResult = await initiateOrderPayment(orderId);

                if (paymentResult.success && paymentResult.data) {
                    // Use direct payment data if available
                    setPaymentData(paymentResult.data);
                    setIsLoadingCart(false);
                    return;
                }
            } catch (error) {
                console.error("Failed to get direct payment data:", error);
                // Continue to fallback approach if direct payment fails
            }

            // Fallback: Use order details API
            const orderDetails = await getOrderDetails(orderId);

            if (orderDetails && orderDetails.success) {
                // Generate payment data for PayOS with minimal info
                const paymentData = {
                    checkoutUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
                    paymentLinkId: orderId,
                };

                setPaymentData(paymentData);
            } else {
                throw new Error("Failed to fetch order details");
            }
        } catch (err) {
            console.error("Error fetching payment details:", err);
            toast.error("Không thể tải thông tin thanh toán");
        } finally {
            setIsLoadingCart(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle address selection
    const handleAddressChange = {
        onCityChange: (city: string) =>
            setFormData((prev) => ({ ...prev, province: city })),
        onDistrictChange: (district: string) =>
            setFormData((prev) => ({ ...prev, district })),
        onWardChange: (ward: string) =>
            setFormData((prev) => ({ ...prev, ward })),
    };

    // Remove cart item
    const removeItem = (id: string) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (
            !formData.fullName ||
            !formData.province ||
            !formData.district ||
            !formData.ward ||
            !formData.email ||
            !formData.phone
        ) {
            setErrorMessage("Vui lòng điền đầy đủ thông tin");
            return;
        }

        // Validate cart
        if (cartItems.length === 0) {
            setErrorMessage("Giỏ hàng của bạn đang trống");
            return;
        }

        setIsProcessingPayment(true);
        setErrorMessage(null);

        try {
            // Format the complete address
            const fullAddress = `${formData.houseNumber}, ${formData.streetName}, ${formData.ward}, ${formData.district}, ${formData.province}`;

            // Create discount info to pass to the order
            let discountInfo = undefined;
            if (totalDiscount > 0) {
                if (isUsingManualDiscount && appliedDiscount) {
                    discountInfo = {
                        discountId: parseInt(appliedDiscount.id),
                        discountCode: appliedDiscount.discountCode,
                        discountAmount: manualDiscountAmount,
                        isManual: true,
                    };
                } else if (appliedAutomaticDiscounts.length > 0) {
                    discountInfo = {
                        automaticDiscountIds: appliedAutomaticDiscounts.map(
                            (d) => parseInt(d.id),
                        ),
                        discountAmount: automaticDiscountAmount,
                        isManual: false,
                    };
                }
            }

            // Prepare order items with discount information
            const orderItems = cartItems.map((item) => {
                // Get original price if available, otherwise use current price
                const originalPrice = item.originalPrice || item.price;
                const finalPrice = item.price;

                // Calculate discount amount for this item
                const discountAmount =
                    isUsingManualDiscount &&
                    appliedDiscount &&
                    appliedDiscount.targetedProducts &&
                    appliedDiscount.targetedProducts.includes(item.name)
                        ? // Item-specific manual discount
                          (originalPrice - finalPrice) * item.quantity
                        : // Automatic discount already applied in the price
                          item.discountAmount ||
                          (originalPrice - finalPrice) * item.quantity;

                // Only include discount fields if there's actually a discount
                const hasDiscount = discountAmount > 0;

                return {
                    productId: item.id,
                    quantity: item.quantity,
                    price: finalPrice,
                    // Only include discount details if there's a discount
                    ...(hasDiscount && {
                        originalPrice: originalPrice,
                        finalPrice: finalPrice,
                        discountAmount: discountAmount,
                        discountType:
                            item.discountType ||
                            (discountAmount > 0 ? "percentage" : "none"),
                        discountId:
                            isUsingManualDiscount && appliedDiscount
                                ? appliedDiscount.id
                                : item.discountId,
                    }),
                };
            });

            // Create order payload with both order-level and item-level discount info
            const orderData = {
                customerInfo: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                },
                orderItems: orderItems,
                subtotal: subtotal,
                shippingFee: deliveryFee,
                total: subtotal + deliveryFee - totalDiscount,
                // Only include discount info if there's actually a discount
                ...(totalDiscount > 0 && {
                    discountAmount: totalDiscount,
                    ...(isUsingManualDiscount &&
                        appliedDiscount && {
                            manualDiscountId: appliedDiscount.id,
                        }),
                    ...(!isUsingManualDiscount &&
                        appliedAutomaticDiscounts?.length > 0 && {
                            appliedDiscountIds: appliedAutomaticDiscounts.map(
                                (d) => d.id,
                            ),
                        }),
                }),
                notes: formData.notes,
            };

            console.log(
                "Submitting order:",
                JSON.stringify(orderData, null, 2),
            );

            // Fix: Improve error handling in the createCheckoutOrder call
            const result = await createCheckoutOrder(
                orderData,
                {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                },
                formData.notes || "",
            );

            if (result && result.success) {
                // Clear cart
                setCartItems([]);
                localStorage.removeItem("cart");
                localStorage.removeItem("appliedDiscounts");

                // Navigate to dashboard or success page
                toast.success("Đơn hàng đã được tạo thành công!");
                router.push("/dashboard/orders");
            } else {
                // Display specific error from the result if available
                const errorMsg =
                    result?.message ||
                    "Không thể tạo đơn hàng. Vui lòng thử lại.";
                setErrorMessage(errorMsg);

                // Instead of throwing an error, just display it to the user
                console.error("Order creation failed:", errorMsg);
            }
        } catch (error) {
            console.error("Error creating order:", error);
            setErrorMessage(
                (error as Error).message ||
                    "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
            );
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // If cart is loading, show a loading indicator
    if (isLoadingCart) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    {isPaymentMode ? "Thanh toán đơn hàng" : "Thanh toán"}
                </h1>

                {errorMessage && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {isPaymentMode ? (
                    <PaymentMode
                        orderId={paymentOrderId}
                        paymentAmount={paymentAmount}
                        paymentData={paymentData}
                    />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col lg:flex-row gap-8 text-gray-700">
                            {/* Left column - Checkout form */}
                            <div className="w-full lg:w-2/3">
                                <ShippingForm
                                    formData={formData}
                                    onChange={handleInputChange}
                                    onAddressChange={handleAddressChange}
                                />
                                <PaymentSection
                                    notes={formData.notes}
                                    onNotesChange={handleInputChange}
                                />
                            </div>

                            {/* Right column - Order Summary */}
                            <div className="w-full lg:w-1/3">
                                <CartSummary
                                    cartItems={
                                        cartItems as unknown as CartSummaryProduct[]
                                    } // Type cast to match CartSummary's expected props
                                    subtotal={subtotal}
                                    deliveryFee={deliveryFee}
                                    appliedDiscount={appliedDiscount}
                                    appliedAutomaticDiscounts={
                                        appliedAutomaticDiscounts
                                    }
                                    manualDiscountAmount={manualDiscountAmount}
                                    automaticDiscountAmount={
                                        automaticDiscountAmount
                                    }
                                    totalDiscount={totalDiscount}
                                    isUsingManualDiscount={
                                        isUsingManualDiscount
                                    }
                                    onRemoveItem={removeItem}
                                    isProcessingPayment={isProcessingPayment}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
