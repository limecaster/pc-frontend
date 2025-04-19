import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import { Tooltip } from "../ui/tooltip";

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    originalPrice?: number;
}

export interface Discount {
    id: string;
    discountCode: string;
    discountName: string;
    type?: "percentage" | "fixed";
    discountAmount?: number;
    targetType?: "all" | "products" | "categories" | "customers";
    productIds?: string[];
    targetedProducts?: string[];
}

interface CartSummaryProps {
    cartItems: Product[];
    subtotal: number;
    deliveryFee: number;
    appliedDiscount: Discount | null;
    appliedAutomaticDiscounts: Discount[];
    manualDiscountAmount: number;
    automaticDiscountAmount: number;
    totalDiscount: number;
    isUsingManualDiscount: boolean;
    onRemoveItem: (id: string) => void;
    isProcessingPayment: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    cartItems,
    subtotal,
    deliveryFee,
    appliedDiscount,
    appliedAutomaticDiscounts,
    manualDiscountAmount,
    automaticDiscountAmount,
    totalDiscount,
    isUsingManualDiscount,
    onRemoveItem,
    isProcessingPayment,
}) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate total with discounts properly applied
    const calculateTotal = () => {
        // Start with subtotal
        let total = subtotal;
        
        // Subtract discounts
        if (totalDiscount > 0) {
            total -= totalDiscount;
        }
        
        // Add delivery fee
        if (deliveryFee > 0) {
            total += deliveryFee;
        }
        
        return Math.max(0, total);
    };

    // Add helper method to calculate discounted subtotal for display
    const getDiscountedSubtotal = () => {
        return Math.max(0, subtotal - totalDiscount);
    };
    
    // Format discount display
    const displayDiscountValue = (discount: Discount) => {
        if (!discount.type || !discount.discountAmount) return "";

        if (discount.type === "percentage") {
            return `${discount.discountAmount}%`;
        } else {
            return formatCurrency(discount.discountAmount);
        }
    };

    // Add helper to determine if there are active discounts
    const hasActiveDiscounts = () => {
        return (
            (isUsingManualDiscount && appliedDiscount) || 
            (!isUsingManualDiscount && appliedAutomaticDiscounts.length > 0)
        );
    };

    // Helper to show which products a discount applies to
    const displayTargetedProducts = (discount: Discount) => {
        if (
            discount.targetType !== "products" ||
            !discount.productIds ||
            discount.productIds.length === 0
        ) {
            return null;
        }

        return (
            <p className="text-xs text-green-700 mt-1">
                Applied to: {discount.targetedProducts?.join(", ") || "selected products"}
            </p>
        );
    };

    // Add new helper function to display item-level discounts
    const renderItemDiscountInfo = (item: Product) => {
        if (!item.originalPrice || item.price >= item.originalPrice) {
            return null;
        }

        const discountAmount =
            (item.originalPrice - item.price) * item.quantity;
        const discountPercent = Math.round(
            (1 - item.price / item.originalPrice) * 100,
        );

        return (
            <div className="ml-5 text-xs text-green-600">
                <span>
                    {discountPercent}% off (${formatCurrency(discountAmount)})
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
            </h2>

            {/* Products */}
            <div className="mt-6 space-y-4">
                {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center space-x-4"
                        >
                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                <Image
                                    src={
                                        item.imageUrl ||
                                        "/images/image-placeholder.webp"
                                    }
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="object-cover object-center w-full h-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm text-gray-800 font-medium truncate">
                                    {item.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {formatCurrency(item.price)} x {item.quantity}
                                </p>
                                {renderItemDiscountInfo(item)}
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                </p>
                                {!isProcessingPayment && (
                                    <button
                                        type="button"
                                        className="mt-1 text-red-500 hover:text-red-700"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        <Tooltip content="Remove item">
                                            <TrashIcon className="h-4 w-4" />
                                        </Tooltip>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Your cart is empty</p>
                    </div>
                )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-2">
                <div className="flex justify-between text-base text-gray-900">
                    <p>Subtotal</p>
                    <p className="text-primary font-medium">
                        {formatCurrency(subtotal)}
                    </p>
                </div>

                <div className="flex justify-between text-base text-gray-900">
                    <p>Shipping fee</p>
                    <p className="text-secondary">
                        {deliveryFee === 0
                            ? "Free"
                            : formatCurrency(deliveryFee)}
                    </p>
                </div>

                {/* Manual discount if applied */}
                {appliedDiscount && isUsingManualDiscount && (
                    <div className="flex flex-col text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                        <div className="flex justify-between">
                            <div>
                                <p className="font-medium text-blue-800">
                                    {appliedDiscount.discountName || appliedDiscount.discountCode}
                                </p>
                                <p className="text-sm text-blue-600">
                                    {appliedDiscount.type === "percentage"
                                        ? `${appliedDiscount.discountAmount}% off`
                                        : `${formatCurrency(appliedDiscount.discountAmount || 0)} off`}
                                </p>
                                {displayTargetedProducts(appliedDiscount)}
                            </div>
                            <p className="font-medium">
                                -&nbsp;{formatCurrency(manualDiscountAmount)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Automatic discounts if applied */}
                {appliedAutomaticDiscounts.length > 0 &&
                    !isUsingManualDiscount && (
                        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100 mt-3">
                            <p className="font-medium mb-1">
                                Auto-applied discounts:
                            </p>
                            <ul className="space-y-2">
                                {appliedAutomaticDiscounts.map((discount) => (
                                    <li
                                        key={discount.id}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {discount.discountName}
                                            </span>
                                            {displayTargetedProducts(discount)}
                                            {discount.discountCode && (
                                                <p className="text-xs text-green-700 mt-0.5">
                                                    Code: {discount.discountCode}
                                                </p>
                                            )}
                                        </div>
                                        <div className="font-medium">
                                            {discount.type === "percentage"
                                                ? `-${discount.discountAmount}%`
                                                : `-${formatCurrency(discount.discountAmount || 0)}`}
                                        </div>
                                    </li>
                                ))}
                                <li className="flex justify-between items-center font-medium border-t border-green-200 pt-1 mt-1">
                                    <span>Total automatic discount:</span>
                                    <span>
                                        -{formatCurrency(automaticDiscountAmount)}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    )}

                {/* Display discounted subtotal if discounts are applied */}
                {hasActiveDiscounts() && (
                    <div className="flex justify-between text-base text-gray-900 font-medium mt-2">
                        <p>Subtotal after discounts:</p>
                        <p className="text-green-600">
                            {formatCurrency(getDiscountedSubtotal())}
                        </p>
                    </div>
                )}

                {/* Total with all discounts applied */}
                <div className="flex justify-between font-bold pt-4 border-t mt-4 text-lg">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isProcessingPayment || cartItems.length === 0}
                    className="w-full bg-primary py-3 px-4 rounded-md text-white font-medium 
                    hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-primary text-center block transition-colors disabled:opacity-70"
                >
                    {isProcessingPayment ? "Processing..." : "Place Order"}
                </button>
            </div>

            <div className="mt-4">
                <Link
                    href="/cart"
                    className="w-full border border-gray-300 py-3 px-4 rounded-md text-gray-700 font-medium 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-gray-500 text-center block transition-colors"
                >
                    Return to Cart
                </Link>
            </div>
        </div>
    );
};

export default CartSummary;
