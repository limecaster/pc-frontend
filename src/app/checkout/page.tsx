"use client";
import React, { useEffect, useState } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Discount } from "@/api/discount"; // Import the Discount type

const Checkout: React.FC = () => {
    // Fix the type of discount to match the imported Discount type
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [autoDiscounts, setAutoDiscounts] = useState<Discount[]>([]);
    const [autoDiscountValue, setAutoDiscountValue] = useState<number>(0);
    const [manualDiscountAmount, setManualDiscountAmount] = useState<number>(0);
    const [isUsingManualDiscount, setIsUsingManualDiscount] =
        useState<boolean>(false);

    useEffect(() => {
        document.title = "B Store - Thanh toán";
    }, []);

    // Retrieve discounts from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("appliedDiscounts");
        const checkoutData = localStorage.getItem("checkoutData");
        
        // Process discount information
        if (stored) {
            try {
                const {
                    discount,
                    appliedAutomaticDiscounts,
                    manualDiscountAmount,
                    totalAutoDiscountAmount,
                    isUsingManualDiscount,
                } = JSON.parse(stored);

                // Set states based on which discount type is being used
                setDiscount(isUsingManualDiscount ? discount : null);
                setAutoDiscounts(
                    !isUsingManualDiscount ? appliedAutomaticDiscounts : [],
                );
                setAutoDiscountValue(
                    !isUsingManualDiscount ? totalAutoDiscountAmount : 0,
                );
                setManualDiscountAmount(
                    isUsingManualDiscount ? manualDiscountAmount : 0,
                );
                setIsUsingManualDiscount(isUsingManualDiscount || false);
            } catch (error) {
                console.error("Error parsing stored discounts:", error);
            }
        }
        
        // Check if we have detailed checkout data with discounted items
        if (checkoutData) {
            try {
                const { cartItems } = JSON.parse(checkoutData);
                // Store the discounted cart items to be used in the checkout
                if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
                    localStorage.setItem("checkoutItems", JSON.stringify(cartItems));
                }
            } catch (error) {
                console.error("Error parsing checkout data:", error);
            }
        }
    }, []);

    // Convert the API Discount type to the CheckoutPage expected format
    const convertToCheckoutDiscount = (apiDiscount: Discount | null) => {
        if (!apiDiscount) return null;
        return {
            id: apiDiscount.id.toString(), // Convert number id to string
            discountCode: apiDiscount.discountCode,
            discountName: apiDiscount.discountName,
            type: apiDiscount.type, // Include type for proper display
            discountAmount: apiDiscount.discountAmount, // Include amount for proper display
            targetType: apiDiscount.targetType, // Include targeting information
            productIds: apiDiscount.productIds, // For product-specific discounts
            targetedProducts: apiDiscount.targetedProducts, // Names of targeted products
            categoryNames: apiDiscount.categoryNames, // For category-specific discounts
        };
    };

    const convertToCheckoutDiscounts = (apiDiscounts: Discount[]) => {
        return apiDiscounts.map((d) => ({
            id: d.id.toString(),
            discountCode: d.discountCode,
            discountName: d.discountName,
            type: d.type,
            discountAmount: d.discountAmount,
            targetType: d.targetType,
            productIds: d.productIds,
            targetedProducts: d.targetedProducts,
            categoryNames: d.categoryNames,
        }));
    };

    return (
        <ProtectedRoute>
            {/* Pass discount data to CheckoutPage component, with proper type conversion */}
            <CheckoutPage
                appliedDiscount={
                    isUsingManualDiscount
                        ? convertToCheckoutDiscount(discount)
                        : null
                }
                appliedAutomaticDiscounts={
                    !isUsingManualDiscount
                        ? convertToCheckoutDiscounts(autoDiscounts)
                        : []
                }
                manualDiscountAmount={manualDiscountAmount}
                automaticDiscountAmount={autoDiscountValue}
                totalDiscount={
                    isUsingManualDiscount
                        ? manualDiscountAmount
                        : autoDiscountValue
                }
                isUsingManualDiscount={isUsingManualDiscount}
            />
        </ProtectedRoute>
    );
};

export default Checkout;
