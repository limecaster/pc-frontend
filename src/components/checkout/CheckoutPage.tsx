"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { getCart } from "@/api/cart";
import { useCheckout } from "@/contexts/CheckoutContext";
import { initiateOrderPayment } from "@/api/order";
import { getOrderDetails } from "@/api/checkout";
import { getAddresses, getProfile } from "@/api/account";
import { calculateDiscountedCartItems } from "@/utils/discountUtils";
import { useDiscount } from "@/hooks/useDiscount";

import ShippingForm, { CheckoutFormData } from "./ShippingForm";
import CartSummary, { Product as CartSummaryProduct } from "./CartSummary";
import { Discount } from "@/api/discount";
import PaymentSection from "./PaymentSection";
import PaymentMode from "./PaymentMode";

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
    cartItems: Product[];
    subtotal: number;
    couponError?: string;
    appliedCouponAmount?: number;
    immediateCartTotals?: any;
    shippingFee?: number;
    totalAutoDiscountAmount?: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    originalPrice?: number;
    discountAmount?: number;
    discountType?: "percentage" | "fixed" | "none";
    discountId?: string | number;
    discountSource?: "automatic" | "manual" | undefined;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    originalPrice?: number;
    discountAmount?: number;
    discountType?: "percentage" | "fixed" | undefined;
    discountId?: string | number;
    discountSource?: "automatic" | "manual" | undefined;
    category: string;
    categoryNames: string[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
    paymentOnly = false,
    existingOrderId = "",
    cartItems,
    subtotal,
    couponError,
    appliedCouponAmount,
    immediateCartTotals,
    shippingFee,
    totalAutoDiscountAmount,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { createCheckoutOrder } = useCheckout();

    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        address: "",
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

    const mode = searchParams.get("mode");
    const orderId = searchParams.get("orderId");
    const [isPaymentMode, setIsPaymentMode] = useState(false);
    const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    const defaultCartItems = useMemo(() => {
        return cartItems.map((item) => ({
            ...item,
            category: (item as any).category || "",
            categoryNames: (item as any).categoryNames || [],
            originalPrice: item.originalPrice ?? item.price,
            discountSource: ["automatic", "manual"].includes(
                (item as any).discountSource,
            )
                ? (item as any).discountSource
                : undefined,
            discountType:
                (item as any).discountType === "none"
                    ? undefined
                    : (item as any).discountType,
        }));
    }, [cartItems]);

    const isAuthenticated =
        typeof window !== "undefined" && !!localStorage.getItem("token");
    const loading = isLoadingCart;

    const couponCodeFromQuery = searchParams.get("coupon") || "";

    const {
        discount: manualDiscount,
        automaticDiscounts,
        isUsingManualDiscount,
        discountsLoading,
        manualDiscountReady,
    } = useDiscount({
        cartItems: defaultCartItems,
        subtotal,
        isAuthenticated,
        loading,
        couponCode: couponCodeFromQuery,
    });

    const discountsReady = useMemo(
        () =>
            !discountsLoading &&
            (isUsingManualDiscount ? manualDiscountReady : true),
        [discountsLoading, isUsingManualDiscount, manualDiscountReady],
    );

    const discountedCartItems = useMemo(() => {
        if (!discountsReady) return [];
        return calculateDiscountedCartItems(
            defaultCartItems,
            automaticDiscounts,
            manualDiscount,
            isUsingManualDiscount,
        );
    }, [
        discountsReady,
        defaultCartItems,
        automaticDiscounts,
        manualDiscount,
        isUsingManualDiscount,
    ]);

    useEffect(() => {
        const loadDefaultAddress = async () => {
            try {
                if (localStorage.getItem("token")) {
                    const [addresses, profile] = await Promise.all([
                        getAddresses(),
                        getProfile(),
                    ]);

                    const defaultAddress = addresses.find(
                        (addr) => addr.isDefault,
                    );

                    if (defaultAddress) {
                        setFormData((prev) => ({
                            ...prev,
                            fullName: defaultAddress.fullName,
                            address: defaultAddress.street,
                            province: defaultAddress.city,
                            district: defaultAddress.district,
                            ward: defaultAddress.ward,
                            phone: defaultAddress.phoneNumber,
                            email: profile.email,
                        }));
                    } else {
                        setFormData((prev) => ({
                            ...prev,
                            email: profile.email,
                        }));
                    }
                }
            } catch (error) {
                console.error("Error loading default address:", error);
            }
        };

        loadDefaultAddress();
    }, []);

    useEffect(() => {
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            setIsLoadingCart(false);
        }
    }, [cartItems]);

    const fetchPaymentDetails = async (orderId: string) => {
        try {
            setIsLoadingCart(true);

            try {
                const paymentResult = await initiateOrderPayment(orderId);

                if (paymentResult.success && paymentResult.data) {
                    setPaymentData(paymentResult.data);
                    setIsLoadingCart(false);
                    return;
                }
            } catch (error) {
                console.error("Failed to get direct payment data:", error);
            }

            const orderDetails = await getOrderDetails(orderId);

            if (orderDetails && orderDetails.success) {
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

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = {
        onCityChange: (city: string) =>
            setFormData((prev) => ({ ...prev, province: city })),
        onDistrictChange: (district: string) =>
            setFormData((prev) => ({ ...prev, district })),
        onWardChange: (ward: string) =>
            setFormData((prev) => ({ ...prev, ward })),
    };

    const removeItem = (id: string) => {
        // setCartItems((items) => items.filter((item) => item.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.fullName ||
            !formData.province ||
            !formData.district ||
            !formData.ward ||
            !formData.email ||
            !formData.phone ||
            !formData.address
        ) {
            setErrorMessage("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (cartItems.length === 0) {
            setErrorMessage("Giỏ hàng của bạn đang trống");
            return;
        }

        setIsProcessingPayment(true);
        setErrorMessage(null);

        try {
            const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`;

            let discountInfo = undefined;
            if (manualDiscount && manualDiscount.discountAmount > 0) {
                const discountCode =
                    manualDiscount && "code" in manualDiscount
                        ? manualDiscount.code
                        : undefined;
                discountInfo = {
                    discountId: manualDiscount.id,
                    discountCode,
                    discountAmount: manualDiscount.discountAmount,
                    isManual: true,
                };
            } else if (automaticDiscounts.length > 0) {
                discountInfo = {
                    automaticDiscountIds: automaticDiscounts.map((d) => d.id),
                    discountAmount: automaticDiscounts.reduce(
                        (acc, curr) => acc + (curr.discountAmount || 0),
                        0,
                    ),
                    isManual: false,
                };
            }

            const orderItems = defaultCartItems.map((item) => {
                const originalPrice = item.originalPrice || item.price;
                const finalPrice = item.price;

                const discountAmount =
                    manualDiscount &&
                    manualDiscount.targetedProducts &&
                    manualDiscount.targetedProducts.includes(item.name)
                        ? (originalPrice - finalPrice) * item.quantity
                        : item.discountAmount ||
                          (originalPrice - finalPrice) * item.quantity;

                const hasDiscount = discountAmount > 0;

                return {
                    productId: item.id,
                    quantity: item.quantity,
                    price: finalPrice,
                    ...(hasDiscount && {
                        originalPrice: originalPrice,
                        finalPrice: finalPrice,
                        discountAmount: discountAmount,
                        discountType:
                            item.discountType ||
                            (discountAmount > 0 ? "percentage" : "none"),
                        discountId: manualDiscount && manualDiscount.id,
                    }),
                };
            });

            const orderData = {
                customerInfo: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                },
                orderItems: orderItems,
                subtotal: subtotal,
                shippingFee: shippingFee,
                total: calculateFinalTotal(),
                ...(discountInfo && {
                    discountAmount: discountInfo.discountAmount,
                    ...(discountInfo.isManual && {
                        manualDiscountId: discountInfo.discountId,
                    }),
                    ...(!discountInfo.isManual &&
                        discountInfo.automaticDiscountIds && {
                            appliedDiscountIds:
                                discountInfo.automaticDiscountIds,
                        }),
                }),
                notes: formData.notes,
            };

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
                // setCartItems([]);
                // localStorage.removeItem("cart");
                // localStorage.removeItem("appliedDiscounts");

                toast.success("Đơn hàng đã được tạo thành công!");
                router.push("/dashboard/orders");
            } else {
                const errorMsg =
                    result?.message ||
                    "Không thể tạo đơn hàng. Vui lòng thử lại.";
                setErrorMessage(errorMsg);

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

    const calculateFinalTotal = () => {
        let calculatedSubtotal = subtotal;
        if (manualDiscount && manualDiscount.discountAmount > 0) {
            calculatedSubtotal -= manualDiscount.discountAmount;
        } else if (automaticDiscounts.length > 0) {
            calculatedSubtotal -= automaticDiscounts.reduce(
                (acc, curr) => acc + (curr.discountAmount || 0),
                0,
            );
        }
        if (shippingFee && shippingFee > 0) {
            calculatedSubtotal += shippingFee;
        }
        return Math.max(0, calculatedSubtotal);
    };

    if (!discountsReady) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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

                            <div className="w-full lg:w-1/3">
                                <CartSummary
                                    cartItems={
                                        discountedCartItems as unknown as CartSummaryProduct[]
                                    }
                                    subtotal={subtotal}
                                    deliveryFee={shippingFee || 0}
                                    appliedDiscount={manualDiscount}
                                    appliedAutomaticDiscounts={
                                        automaticDiscounts
                                    }
                                    manualDiscountAmount={
                                        manualDiscount?.discountAmount || 0
                                    }
                                    automaticDiscountAmount={
                                        automaticDiscounts.reduce(
                                            (acc, curr) =>
                                                acc +
                                                (curr.discountAmount || 0),
                                            0,
                                        ) || 0
                                    }
                                    totalDiscount={
                                        manualDiscount?.discountAmount ||
                                        automaticDiscounts.reduce(
                                            (acc, curr) =>
                                                acc +
                                                (curr.discountAmount || 0),
                                            0,
                                        ) ||
                                        0
                                    }
                                    isUsingManualDiscount={
                                        !!(
                                            manualDiscount &&
                                            manualDiscount.discountAmount > 0
                                        )
                                    }
                                    onRemoveItem={removeItem}
                                    isProcessingPayment={!!isProcessingPayment}
                                    removeCoupon={() => {}} // TODO: Implement or connect actual removeCoupon logic
                                    couponError={couponError || null} // TODO: Replace with actual error state if available
                                    immediateCartTotals={immediateCartTotals} // TODO: Replace with actual immediate cart totals if available
                                    shippingFee={shippingFee || 0} // deliveryFee is used as shippingFee
                                    appliedCouponAmount={
                                        appliedCouponAmount || 0
                                    }
                                    totalAutoDiscountAmount={
                                        automaticDiscounts.reduce(
                                            (acc, curr) =>
                                                acc +
                                                (curr.discountAmount || 0),
                                            0,
                                        ) || 0
                                    }
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
