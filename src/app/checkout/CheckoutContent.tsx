"use client";
import React, { useEffect, useState } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useDiscount } from "@/hooks/useDiscount";
import { useSearchParams } from "next/navigation";

const CheckoutContent: React.FC = () => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const searchParams = useSearchParams();
    const couponFromUrl = searchParams.get("coupon") || "";
    const [couponCode, setCouponCode] = useState(couponFromUrl);

    useEffect(() => {
        const checkoutData = localStorage.getItem("checkoutData");
        if (checkoutData) {
            try {
                const { cartItems: storedCartItems } = JSON.parse(checkoutData);
                setCartItems(storedCartItems || []);
                setSubtotal(
                    (storedCartItems || []).reduce(
                        (
                            sum: number,
                            item: { price: number; quantity: number },
                        ) => sum + (item.price || 0) * (item.quantity || 1),
                        0,
                    ),
                );
            } catch (error) {
                setCartItems([]);
                setSubtotal(0);
            }
        }
    }, []);

    const {
        discount,
        appliedAutomaticDiscounts,
        totalAutoDiscountAmount,
        couponError,
        appliedCouponAmount,
        manualDiscountAmount,
        isUsingManualDiscount,
        discountedCartItems,
    } = useDiscount({
        cartItems,
        subtotal,
        isAuthenticated: false, // or actual auth state
        loading: false, // or actual loading state
        isInitialized: true,
        couponCode,
        setCouponCode,
    });

    useEffect(() => {
        document.title = "B Store - Thanh toán";
    }, []);
    const totalDiscount = isUsingManualDiscount
        ? manualDiscountAmount
        : totalAutoDiscountAmount;
    return (
        <ProtectedRoute>
            <CheckoutPage
                cartItems={cartItems}
                subtotal={subtotal}
                couponError={couponError}
                appliedCouponAmount={appliedCouponAmount}
                immediateCartTotals={{}}
                shippingFee={0}
                totalAutoDiscountAmount={totalAutoDiscountAmount}
            />
        </ProtectedRoute>
    );
};

export default CheckoutContent;
