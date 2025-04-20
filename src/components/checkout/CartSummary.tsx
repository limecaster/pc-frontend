import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import { Tooltip } from "../ui/tooltip";
import { calculateDiscountedCartItems } from "@/utils/discountUtils";
import { Discount } from "@/api/discount";

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    originalPrice?: number;
    category?: string;
    categoryNames?: string[];
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
    removeCoupon: () => void;
    couponError: string | null;
    immediateCartTotals: any;
    shippingFee: number;
    appliedCouponAmount: number;
    totalAutoDiscountAmount: number;
}

interface DiscountedCartItem extends Product {
    originalPrice: number;
    discountedPrice: number;
    discountAmount: number;
    discountSource?: "automatic" | "manual";
    discountType?: string;
    discountName?: string;
    discountCode?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    cartItems,
    subtotal,
    appliedDiscount,
    appliedAutomaticDiscounts,
    isUsingManualDiscount,
    onRemoveItem,
    isProcessingPayment,
    removeCoupon,
    couponError,
    immediateCartTotals,
    shippingFee,
    appliedCouponAmount,
    totalAutoDiscountAmount,
}) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Patch: Ensure category is always a string for CartItem compatibility
    const patchedCartItems = cartItems.map((item) => ({
        ...item,
        category: item.category || "",
    }));

    const calculateTotal = () => {
        let total = discountedCartItems.reduce(
            (sum, item) =>
                sum + (item.discountedPrice ?? item.price) * item.quantity,
            0,
        );
        if (shippingFee > 0) {
            total += shippingFee;
        }
        return Math.max(0, total);
    };

    const displayDiscountValue = (discount: Discount) => {
        if (!discount.type || !discount.discountAmount) return "";

        if (discount.type === "percentage") {
            return `${discount.discountAmount}%`;
        } else {
            return formatCurrency(discount.discountAmount);
        }
    };

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
                Áp dụng cho:{" "}
                {discount.targetedProducts?.join(", ") || "sản phẩm nhất định"}
            </p>
        );
    };

    const discountedCartItems = calculateDiscountedCartItems(
        patchedCartItems,
        [...appliedAutomaticDiscounts],
        appliedDiscount,
        isUsingManualDiscount,
    ) as DiscountedCartItem[];

    const displaySubtotal =
        discountedCartItems && discountedCartItems.length > 0
            ? discountedCartItems.reduce(
                  (sum, item) =>
                      sum + (item.originalPrice ?? item.price) * item.quantity,
                  0,
              )
            : subtotal;
    const freeProductsCount =
        discountedCartItems && discountedCartItems.length > 0
            ? discountedCartItems.filter(
                  (item) =>
                      (item.price ?? 0) <= 0 && (item.originalPrice ?? 0) > 0,
              ).length
            : cartItems.filter(
                  (item) =>
                      item.price <= 0 &&
                      item.originalPrice &&
                      item.originalPrice > 0,
              ).length;

    return (
        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tóm tắt đơn hàng
            </h2>

            {/* Coupon Applied Section */}
            {isUsingManualDiscount && appliedDiscount && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <div>
                        <span className="font-semibold text-green-700">
                            Mã giảm giá đã áp dụng:
                        </span>
                        <span className="ml-2 text-green-800">
                            {appliedDiscount.discountCode}
                        </span>
                        <span className="ml-2 text-green-700">
                            {displayDiscountValue(appliedDiscount)}
                        </span>
                    </div>
                </div>
            )}
            {couponError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded text-sm mb-2">
                    {couponError}
                </div>
            )}

            {/* Automatic Discounts Section (match cart/CartSummary) */}
            {appliedAutomaticDiscounts.length > 0 && !isUsingManualDiscount && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100 mt-3">
                    <p className="font-medium mb-1">
                        Mã giảm giá tự động áp dụng:
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
                            <span>Tổng tự động giảm:</span>
                            <span>
                                -{formatCurrency(totalAutoDiscountAmount)}
                            </span>
                        </li>
                    </ul>
                </div>
            )}

            {/* Enhanced Discount Details Section */}
            {discountedCartItems &&
                discountedCartItems.length > 0 &&
                discountedCartItems.some(
                    (item) => item.discountAmount && item.discountAmount > 0,
                ) && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 my-2">
                        <div className="font-semibold text-blue-700 mb-1">
                            Chi tiết giảm giá trên từng sản phẩm:
                        </div>
                        <ul className="list-disc list-inside text-blue-800 text-sm">
                            {discountedCartItems
                                .filter(
                                    (item) =>
                                        item.discountAmount &&
                                        item.discountAmount > 0,
                                )
                                .map((item) => (
                                    <li key={item.id}>
                                        {item.name}: -
                                        {formatCurrency(
                                            (item.discountAmount || 0) *
                                                item.quantity,
                                        )}
                                        {item.discountType === "percentage" &&
                                        item.originalPrice ? (
                                            <span>
                                                {" "}
                                                (
                                                {item.discountAmount &&
                                                item.originalPrice
                                                    ? Math.round(
                                                          (item.discountAmount /
                                                              item.originalPrice) *
                                                              100,
                                                      )
                                                    : ""}
                                                % giảm)
                                            </span>
                                        ) : null}
                                        {item.discountName && (
                                            <span>
                                                {" "}
                                                |{" "}
                                                <span
                                                    className={
                                                        item.discountSource ===
                                                        "manual"
                                                            ? "text-green-700"
                                                            : "text-blue-700"
                                                    }
                                                >
                                                    {item.discountName}
                                                    {item.discountCode
                                                        ? ` (${item.discountCode})`
                                                        : ""}
                                                    {item.discountSource ===
                                                    "manual"
                                                        ? " (Mã thủ công)"
                                                        : " (Tự động)"}
                                                </span>
                                            </span>
                                        )}
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}

            {/* Products */}
            <div className="mt-6 space-y-4">
                {cartItems && cartItems.length > 0 ? (
                    discountedCartItems.map((item) => (
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
                                    {formatCurrency(item.price)} x{" "}
                                    {item.quantity}
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency(
                                        (item.discountedPrice ?? item.price) *
                                            item.quantity,
                                    )}
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

            {/* Subtotal, shipping, discount, total */}
            <div className="flex justify-between text-base text-gray-900">
                <p>
                    Tạm tính (
                    {immediateCartTotals?.itemCount || cartItems.length} sản
                    phẩm
                    {freeProductsCount > 0
                        ? `, ${freeProductsCount} miễn phí`
                        : ""}
                    )
                </p>
                <p className="text-primary font-medium">
                    {displaySubtotal <= 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                    ) : (
                        formatCurrency(displaySubtotal)
                    )}
                </p>
            </div>
            <div className="flex justify-between text-base text-gray-900">
                <p>Phí vận chuyển</p>
                <p className="text-primary font-medium">
                    {shippingFee > 0 ? (
                        formatCurrency(shippingFee)
                    ) : (
                        <span className="text-green-600">Miễn phí</span>
                    )}
                </p>
            </div>
            <div className="flex justify-between text-base text-gray-900">
                <p>Giảm giá</p>
                <p className="text-green-600 font-medium">
                    {discountedCartItems && discountedCartItems.length > 0
                        ? `- ${formatCurrency(discountedCartItems.reduce((sum, item) => sum + (item.discountAmount ?? 0) * item.quantity, 0))}`
                        : isUsingManualDiscount && appliedCouponAmount > 0
                          ? `- ${formatCurrency(appliedCouponAmount)}`
                          : !isUsingManualDiscount &&
                              totalAutoDiscountAmount > 0
                            ? `- ${formatCurrency(totalAutoDiscountAmount)}`
                            : "- 0₫"}
                </p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900">
                <p className="font-semibold">Tổng thanh toán</p>
                <p className="font-bold text-primary text-lg">
                    {formatCurrency(calculateTotal())}
                </p>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isProcessingPayment || cartItems.length === 0}
                    className="w-full bg-primary py-3 px-4 rounded-md text-white font-medium 
                    hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-primary text-center block transition-colors disabled:opacity-70"
                >
                    {isProcessingPayment ? "Đang xử lý..." : "Đặt hàng"}
                </button>
            </div>

            <div className="mt-4">
                <Link
                    href="/cart"
                    className="w-full border border-gray-300 py-3 px-4 rounded-md text-gray-700 font-medium 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-gray-500 text-center block transition-colors"
                >
                    Quay lại giỏ hàng
                </Link>
            </div>
        </div>
    );
};

export default CartSummary;
