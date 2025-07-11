"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CartItems from "./CartItems";
import CartSummary from "./CartSummary";
import DiscountConfirmationModal from "./DiscountConfirmationModal";
import { useCart } from "../../hooks/useCart";
import { useDiscount } from "../../hooks/useDiscount";
import {
    recalculateCartTotals,
    saveLocalCart,
    clearLocalCart,
} from "./utils/cartHelpers";
import { clearCartAndSync } from "@/api/cart";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const CartPage: React.FC = () => {
    const {
        cartItems,
        setCartItems,
        loading,
        error,
        isAuthenticated,
        removeItem,
        subtotal,
        shippingFee,
        isEmpty,
        isInitialized,
        handleUpdateQuantity: updateCart,
    } = useCart();

    const {
        discount,
        automaticDiscounts,
        appliedAutomaticDiscounts,
        totalAutoDiscountAmount,
        couponCode,
        setCouponCode,
        couponError,
        appliedCouponAmount,
        applyingCoupon,
        isUsingManualDiscount,
        showConfirmModal,
        setShowConfirmModal,
        pendingManualDiscount,
        handleApplyCoupon,
        removeCoupon,
        handleConfirmManualDiscount,
        handleKeepAutomaticDiscount,
        formatCurrency,
        isDiscountProcessingComplete,
        discountedCartItems,
    } = useDiscount({
        cartItems,
        subtotal,
        isAuthenticated,
        loading,
        isInitialized,
    });

    // Get display cart items - MOVED UP before useEffect
    const displayCartItems = isUsingManualDiscount
        ? cartItems
        : discountedCartItems && discountedCartItems.length > 0
          ? discountedCartItems
          : cartItems;

    // Add state for immediate cart totals
    const [immediateCartTotals, setImmediateCartTotals] = useState({
        subtotal: 0,
        itemCount: 0,
        discountedItemCount: 0,
        total: 0,
    });

    // Function to recalculate totals after updates
    const recalculateCartTotals = useCallback(() => {
        const currentSubtotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        // Calculate the active discount amount
        const activeDiscountAmount = isUsingManualDiscount
            ? appliedCouponAmount
            : totalAutoDiscountAmount;

        // Calculate the discounted total
        const discountedTotal = Math.max(
            0,
            currentSubtotal - activeDiscountAmount,
        );

        setImmediateCartTotals({
            subtotal: currentSubtotal,
            itemCount: cartItems.length,
            discountedItemCount: cartItems.filter(
                (item) => item.originalPrice && item.originalPrice > item.price,
            ).length,
            total: discountedTotal, // Set the discounted total correctly
        });
    }, [
        cartItems,
        appliedCouponAmount,
        totalAutoDiscountAmount,
        isUsingManualDiscount,
    ]);

    // Add a useEffect to listen for cart updates
    useEffect(() => {
        // Calculate initial totals
        if (isInitialized && !loading) {
            recalculateCartTotals();
        }

        // Listen for cart updates
        const handleCartUpdate = (e: CustomEvent) => {
            const updatedCart = e.detail;
            recalculateCartTotals();
        };

        window.addEventListener(
            "cart-updated",
            handleCartUpdate as EventListener,
        );

        return () => {
            window.removeEventListener(
                "cart-updated",
                handleCartUpdate as EventListener,
            );
        };
    }, [isInitialized, loading, recalculateCartTotals]);

    // Enhanced updateQuantity function that triggers immediate update
    const handleUpdateQuantity = async (id: string, newQuantity: number) => {
        // First, update the local display for immediate feedback
        const updatedItems = displayCartItems.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item,
        );

        setCartItems(updatedItems);

        // Call the useCart hook's handleUpdateQuantity function
        await updateCart(id, newQuantity);

        // Update cart totals after quantity change
        recalculateCartTotals();
    };

    // Add a function to handle cart clearing
    const handleClearCart = async () => {
        try {
            // Clear local cart state first for immediate UI update
            setCartItems([]);

            // Reset immediate cart totals
            setImmediateCartTotals({
                subtotal: 0,
                itemCount: 0,
                discountedItemCount: 0,
                total: 0,
            });

            // Clear localStorage and trigger events
            clearLocalCart();

            // If authenticated, also clear backend cart
            if (isAuthenticated) {
                await clearCartAndSync();
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            toast.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    const adjustedSubtotal = useMemo(() => {
        // Use immediate totals for faster UI updates
        return immediateCartTotals.subtotal > 0
            ? immediateCartTotals.subtotal
            : displayCartItems.reduce((total, item) => {
                  // Skip free items in subtotal calculation
                  if (
                      item.price <= 0 &&
                      item.originalPrice &&
                      item.originalPrice > 0
                  ) {
                      return total;
                  }

                  const itemTotal = Math.max(0, item.price) * item.quantity;
                  return total + itemTotal;
              }, 0);
    }, [immediateCartTotals, displayCartItems]);

    const total = useMemo(() => {
        // For automatic discounts, the displayCartItems already have discounted prices,
        // so the adjustedSubtotal already includes these discounts
        let calculatedTotal = adjustedSubtotal + shippingFee;

        // Only apply manual discount if using one
        if (isUsingManualDiscount && appliedCouponAmount > 0) {
            calculatedTotal = Math.max(
                0,
                calculatedTotal - appliedCouponAmount,
            );
        }

        return Math.max(0, Math.round(calculatedTotal));
    }, [
        adjustedSubtotal,
        shippingFee,
        isUsingManualDiscount,
        appliedCouponAmount,
    ]);

    const router = useRouter();

    // Function to proceed to checkout - make sure to save cart items with discounted prices
    const handleProceedToCheckout = () => {
        // If cart is empty, prevent navigation
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        // Prepare items with correct prices (including discounts)
        const checkoutItems = cartItems.map((item) => {
            // If this item has discount applied, use the correct discounted price
            if (item.originalPrice && item.originalPrice > item.price) {
                // Item already has discounted price set correctly
                return item;
            }
            return item;
        });

        // Save checkout data
        localStorage.setItem(
            "checkoutData",
            JSON.stringify({ cartItems: checkoutItems }),
        );

        // Save applied discounts (optional, for legacy/analytics)
        localStorage.setItem(
            "appliedDiscounts",
            JSON.stringify({
                discount: isUsingManualDiscount ? discount : null,
                appliedAutomaticDiscounts: isUsingManualDiscount
                    ? []
                    : appliedAutomaticDiscounts,
                manualDiscountAmount: isUsingManualDiscount
                    ? appliedCouponAmount
                    : 0,
                totalAutoDiscountAmount: isUsingManualDiscount
                    ? 0
                    : totalAutoDiscountAmount,
                isUsingManualDiscount,
            }),
        );

        // --- MAIN LOGIC: Pass coupon code via URL if using manual discount ---
        if (isUsingManualDiscount && discount && discount.discountCode) {
            router.push(
                `/checkout?coupon=${encodeURIComponent(discount.discountCode)}`,
            );
        } else {
            router.push("/checkout");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="w-full bg-gray-100 py-8">
                <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">
                            Đang tải giỏ hàng...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full bg-gray-100 py-8">
                <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                    <div className="text-center py-16 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-primary hover:underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty cart state
    if (isEmpty) {
        return (
            <div className="w-full bg-gray-100 py-8">
                <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">
                        Giỏ hàng của bạn
                    </h1>
                    <div className="text-center py-16 bg-white rounded-lg shadow p-8 border border-gray-200">
                        <div className="text-gray-500 text-lg mb-6">
                            Giỏ hàng của bạn đang trống
                        </div>
                        <Link
                            href="/products"
                            className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Main cart content
    return (
        <div className="w-full bg-gray-100 py-8">
            <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    Giỏ hàng của bạn
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart items section */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                            <CartItems
                                cartItems={displayCartItems} // Use display cart items here
                                updateQuantity={handleUpdateQuantity} // Use the enhanced function
                                removeItem={removeItem}
                            />
                        </div>

                        {/* Continue Shopping Button */}
                        <div className="mt-6">
                            <Link
                                href="/products"
                                className="text-primary hover:text-primary-dark font-medium flex items-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* Order summary section */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-lg shadow p-6 top-20 border border-gray-200">
                            <CartSummary
                                subtotal={adjustedSubtotal} // Adjusted subtotal already includes automatic discounts
                                shippingFee={shippingFee}
                                totalDiscount={
                                    isUsingManualDiscount
                                        ? appliedCouponAmount
                                        : 0
                                } // Manual discount amount if using manual
                                total={total}
                                couponCode={couponCode}
                                couponError={couponError}
                                applyingCoupon={applyingCoupon}
                                handleApplyCoupon={handleApplyCoupon}
                                removeCoupon={removeCoupon}
                                discount={discount}
                                formatCurrency={formatCurrency}
                                appliedAutomaticDiscounts={
                                    appliedAutomaticDiscounts
                                }
                                totalAutoDiscountAmount={
                                    totalAutoDiscountAmount
                                }
                                cartItems={displayCartItems} // Use display cart items here
                                setCartItems={setCartItems}
                                appliedCouponAmount={appliedCouponAmount}
                                automaticDiscounts={automaticDiscounts}
                                setCouponCode={setCouponCode}
                                isUsingManualDiscount={isUsingManualDiscount}
                                isDiscountProcessingComplete={
                                    isDiscountProcessingComplete
                                }
                                discountedCartItems={discountedCartItems} // Add this prop
                                immediateCartTotals={immediateCartTotals} // Add this new prop
                                clearCart={handleClearCart} // Add this new prop
                                proceedToCheckout={handleProceedToCheckout} // Add this new prop
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount confirmation modal */}
            {pendingManualDiscount && (
                <DiscountConfirmationModal
                    show={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmManualDiscount}
                    onKeepAutomatic={handleKeepAutomaticDiscount}
                    couponCode={couponCode}
                    autoAmount={pendingManualDiscount.autoAmount}
                    discountAmount={pendingManualDiscount.discountAmount}
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
};

export default CartPage;
