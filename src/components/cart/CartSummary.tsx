import React from "react";
import Image from "next/image";
import VietQRLogo from "@/assets/VietQRLogo.png";
import { Discount } from "@/api/discount";
import { CartItem } from "./types";

interface CartSummaryProps {
    subtotal: number;
    shippingFee: number;
    totalDiscount: number;
    total: number;
    couponCode: string;
    couponError: string;
    applyingCoupon: boolean;
    discount: Discount | null;
    appliedAutomaticDiscounts: Discount[];
    totalAutoDiscountAmount: number;
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    appliedCouponAmount: number;
    automaticDiscounts: Discount[];
    isUsingManualDiscount: boolean;
    formatCurrency: (amount: number) => string;
    setCouponCode: React.Dispatch<React.SetStateAction<string>>;
    handleApplyCoupon: () => void;
    removeCoupon: () => void;
    isDiscountProcessingComplete?: boolean;
    discountedCartItems?: CartItem[];
    immediateCartTotals?: {
        subtotal: number;
        itemCount: number;
        discountedItemCount: number;
        total: number;
    };
    clearCart?: () => void;
    proceedToCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    shippingFee,
    total,
    couponCode,
    couponError,
    applyingCoupon,
    discount,
    appliedAutomaticDiscounts,
    totalAutoDiscountAmount,
    cartItems,
    setCartItems,
    appliedCouponAmount,
    isUsingManualDiscount,
    formatCurrency,
    setCouponCode,
    handleApplyCoupon,
    removeCoupon,
    isDiscountProcessingComplete = false,
    immediateCartTotals,
    discountedCartItems,
    clearCart,
    proceedToCheckout,
}) => {
    const displaySubtotal = immediateCartTotals?.subtotal || subtotal;
    const displayTotal = immediateCartTotals
        ? immediateCartTotals.total
        : total;

    // Calculate the final total after discounts using discountedCartItems
    const calculateDiscountedTotal = () => {
        if (discountedCartItems && discountedCartItems.length > 0) {
            let discountedTotal = discountedCartItems.reduce(
                (sum, item) =>
                    sum + (item.discountedPrice ?? item.price) * item.quantity,
                0,
            );
            // Add shipping fee if any
            if (shippingFee > 0) {
                discountedTotal += shippingFee;
            }
            return Math.max(0, discountedTotal);
        }
        // Fallback to previous logic if discountedCartItems missing
        let calculatedTotal = displaySubtotal;
        if (isUsingManualDiscount && appliedCouponAmount > 0) {
            calculatedTotal -= appliedCouponAmount;
        } else if (!isUsingManualDiscount && totalAutoDiscountAmount > 0) {
            calculatedTotal -= totalAutoDiscountAmount;
        }
        if (shippingFee > 0) {
            calculatedTotal += shippingFee;
        }
        return Math.max(0, calculatedTotal);
    };

    const freeProductsCount = cartItems.filter(
        (item) =>
            item.price <= 0 && item.originalPrice && item.originalPrice > 0,
    ).length;

    return (
        <>
            <div className="space-y-4">
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
                    <p className="text-secondary">
                        {shippingFee === 0
                            ? "Miễn phí"
                            : formatCurrency(shippingFee)}
                    </p>
                </div>

                {/* Only show discount sections if processing is complete */}
                {isDiscountProcessingComplete && (
                    <>
                        {/* Automatic Discounts Section */}
                        {appliedAutomaticDiscounts.length > 0 && (
                            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="font-medium mb-1">
                                    Mã giảm giá tự động áp dụng:
                                </p>
                                <ul className="space-y-2">
                                    {appliedAutomaticDiscounts.map(
                                        (discount) => (
                                            <li
                                                key={discount.id}
                                                className="flex justify-between items-center"
                                            >
                                                <div>
                                                    <span className="font-medium">
                                                        {discount.discountName}
                                                    </span>
                                                    {discount.targetType ===
                                                        "products" &&
                                                        discount.targetedProducts && (
                                                            <p className="text-xs text-green-700 mt-0.5">
                                                                Áp dụng cho:{" "}
                                                                {discount.targetedProducts.join(
                                                                    ", ",
                                                                )}
                                                            </p>
                                                        )}
                                                    {discount.targetType ===
                                                        "categories" &&
                                                        discount.categoryNames && (
                                                            <p className="text-xs text-green-700 mt-0.5">
                                                                Áp dụng cho:{" "}
                                                                {discount.categoryNames.join(
                                                                    ", ",
                                                                )}
                                                            </p>
                                                        )}
                                                    {discount.discountCode && (
                                                        <p className="text-xs text-green-700 mt-0.5">
                                                            Code:{" "}
                                                            {
                                                                discount.discountCode
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="font-medium">
                                                    {discount.type ===
                                                    "percentage"
                                                        ? `-${discount.discountAmount}%`
                                                        : `-${formatCurrency(discount.discountAmount)}`}
                                                </div>
                                            </li>
                                        ),
                                    )}
                                    <li className="flex justify-between items-center font-medium border-t border-green-200 pt-1 mt-1">
                                        <span>Tổng tự động giảm:</span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                totalAutoDiscountAmount,
                                            )}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Coupon Input Section */}
                        <div className="mt-4 space-y-2">
                            <p className="font-medium text-gray-700">
                                {isUsingManualDiscount
                                    ? "Mã giảm giá đã áp dụng:"
                                    : "Bạn có mã giảm giá?"}
                            </p>
                            {!isUsingManualDiscount ? (
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Mã giảm giá"
                                        className="flex-1 border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-primary focus:border-primary"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                    <button
                                        className={`bg-primary text-white font-medium px-4 py-2 rounded-md transition-opacity ${
                                            applyingCoupon
                                                ? "opacity-70 cursor-not-allowed"
                                                : "hover:bg-primary-dark"
                                        }`}
                                        onClick={handleApplyCoupon}
                                        type="button"
                                        disabled={applyingCoupon}
                                    >
                                        {applyingCoupon
                                            ? "Applying..."
                                            : "Áp dụng"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div>
                                        <p className="font-medium text-blue-800">
                                            {discount?.discountName ||
                                                "Discount"}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            {discount?.type === "percentage"
                                                ? `${discount.discountAmount}% off`
                                                : `${formatCurrency(
                                                      discount?.discountAmount ||
                                                          0,
                                                  )} off`}
                                            {discount?.targetType ===
                                                "products" &&
                                                discount?.targetedProducts && (
                                                    <span className="block text-xs mt-0.5">
                                                        Áp dụng cho:{" "}
                                                        {discount.targetedProducts.join(
                                                            ", ",
                                                        )}
                                                    </span>
                                                )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={removeCoupon}
                                        type="button"
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            )}
                            {couponError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded text-sm">
                                    {couponError}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Discount Details Section */}
                        {discountedCartItems &&
                            discountedCartItems.length > 0 &&
                            discountedCartItems.some(
                                (item) =>
                                    item.discountAmount &&
                                    item.discountAmount > 0,
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
                                                        (item.discountAmount ||
                                                            0) * item.quantity,
                                                    )}
                                                    {item.discountType ===
                                                        "percentage" &&
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
                                                                {
                                                                    item.discountName
                                                                }
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
                    </>
                )}

                {/* Total Amount after all discounts */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <p className="font-semibold">Tổng thanh toán</p>
                        <p className="font-bold text-primary text-lg">
                            {formatCurrency(calculateDiscountedTotal())}
                        </p>
                    </div>
                    <div className="flex justify-between text-base text-gray-900">
                        <p>Giảm giá</p>
                        <p className="text-green-600 font-medium">
                            {discountedCartItems &&
                            discountedCartItems.length > 0
                                ? `- ${formatCurrency(discountedCartItems.reduce((sum, item) => sum + (item.discountAmount ?? 0) * item.quantity, 0))}`
                                : isUsingManualDiscount &&
                                    appliedCouponAmount > 0
                                  ? `- ${formatCurrency(appliedCouponAmount)}`
                                  : !isUsingManualDiscount &&
                                      totalAutoDiscountAmount > 0
                                    ? `- ${formatCurrency(totalAutoDiscountAmount)}`
                                    : "- 0₫"}
                        </p>
                    </div>
                </div>

                {/* Checkout button */}
                <div className="mt-6">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (cartItems.length === 0) {
                                return;
                            }
                            if (proceedToCheckout) {
                                proceedToCheckout();
                            }
                        }}
                        disabled={cartItems.length === 0}
                        type="button"
                        className={`flex justify-center items-center w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition
                            ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Tiến hành thanh toán
                    </button>
                    <div className="mt-2">
                        <button
                            type="button"
                            className="text-sm text-red-500 hover:text-red-700 flex items-center justify-center w-full"
                            onClick={clearCart}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            Xóa giỏ hàng
                        </button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-sm font-medium text-gray-900 mb-4">
                        Chúng tôi chấp nhận thanh toán qua
                    </h2>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <Image
                            src={VietQRLogo}
                            alt="Visa"
                            width={48}
                            height={48}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartSummary;
