import React from "react";
import Link from "next/link";
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
    isDiscountProcessingComplete?: boolean; // Add this prop
    discountedCartItems?: CartItem[]; // Add this prop for items with discounts applied
    immediateCartTotals?: {
        subtotal: number;
        itemCount: number;
        discountedItemCount: number;
    }; // Add this new prop
    clearCart: () => void; // Add this new prop
}

const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    shippingFee,
    totalDiscount,
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
    automaticDiscounts,
    isUsingManualDiscount,
    formatCurrency,
    setCouponCode,
    handleApplyCoupon,
    removeCoupon,
    isDiscountProcessingComplete = false,
    discountedCartItems = [], // Add default empty array
    immediateCartTotals,
    clearCart, // Add this to destructuring
}) => {
    // Use immediate totals if available
    const displaySubtotal = immediateCartTotals?.subtotal || subtotal;
    const displayTotal = immediateCartTotals
        ? Math.max(
              0,
              immediateCartTotals.subtotal +
                  shippingFee -
                  (isUsingManualDiscount ? appliedCouponAmount : 0),
          )
        : total;

    // Calculate how many free products based on immediateCartTotals if available
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
                                    Mã giảm giá tự áp dụng:
                                </p>
                                <ul className="space-y-2">
                                    {appliedAutomaticDiscounts.map((d: any) => (
                                        <li key={d.id} className="mb-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium">
                                                    {d.discountCode}
                                                </span>
                                                <span>
                                                    -
                                                    {d.type === "percentage"
                                                        ? `${d.discountAmount}%`
                                                        : formatCurrency(
                                                              Math.min(
                                                                  d.calculatedDiscountAmount,
                                                                  d.discountAmount,
                                                              ),
                                                          )}
                                                </span>
                                            </div>

                                            {/* Category discounts */}
                                            {d.targetType === "categories" &&
                                                d.categoryNames &&
                                                d.categoryNames.length > 0 && (
                                                    <div className="text-xs italic mt-1 text-gray-600">
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Áp dụng cho danh
                                                                mục:
                                                            </span>
                                                            <span className="font-medium text-green-700">
                                                                {d.categoryNames.join(
                                                                    ", ",
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* List affected products with clearer discount information */}
                                                        <div className="mt-1.5 border-t border-green-100 pt-1.5">
                                                            <span className="font-medium">
                                                                Sản phẩm được
                                                                giảm giá:
                                                            </span>
                                                            <ul className="mt-1 list-disc pl-5 space-y-0.5">
                                                                {cartItems
                                                                    .filter(
                                                                        (
                                                                            item,
                                                                        ) => {
                                                                            // Filter for items in this category
                                                                            const itemCategories =
                                                                                item.categoryNames &&
                                                                                item
                                                                                    .categoryNames
                                                                                    .length >
                                                                                    0
                                                                                    ? item.categoryNames
                                                                                    : item.category
                                                                                      ? [
                                                                                            item.category,
                                                                                        ]
                                                                                      : [];

                                                                            return (
                                                                                d.categoryNames?.some(
                                                                                    (
                                                                                        cat: string,
                                                                                    ) =>
                                                                                        itemCategories.some(
                                                                                            (
                                                                                                itemCat,
                                                                                            ) =>
                                                                                                itemCat.toLowerCase() ===
                                                                                                cat.toLowerCase(),
                                                                                        ),
                                                                                ) ||
                                                                                false
                                                                            ); // Add explicit fallback when categoryNames is undefined
                                                                        },
                                                                    )
                                                                    .sort(
                                                                        (
                                                                            a,
                                                                            b,
                                                                        ) => {
                                                                            // Free items first
                                                                            const aIsFree =
                                                                                a.price <=
                                                                                    0 &&
                                                                                a.originalPrice &&
                                                                                a.originalPrice >
                                                                                    0;
                                                                            const bIsFree =
                                                                                b.price <=
                                                                                    0 &&
                                                                                b.originalPrice &&
                                                                                b.originalPrice >
                                                                                    0;
                                                                            if (
                                                                                aIsFree !==
                                                                                bIsFree
                                                                            )
                                                                                return aIsFree
                                                                                    ? -1
                                                                                    : 1;

                                                                            // Then sort by discount amount (most discounted first)
                                                                            const aDiscount =
                                                                                a.originalPrice &&
                                                                                a.originalPrice >
                                                                                    a.price
                                                                                    ? (a.originalPrice -
                                                                                          a.price) *
                                                                                      a.quantity
                                                                                    : 0;
                                                                            const bDiscount =
                                                                                b.originalPrice &&
                                                                                b.originalPrice >
                                                                                    b.price
                                                                                    ? (b.originalPrice -
                                                                                          b.price) *
                                                                                      b.quantity
                                                                                    : 0;
                                                                            return (
                                                                                bDiscount -
                                                                                aDiscount
                                                                            );
                                                                        },
                                                                    )
                                                                    .map(
                                                                        (
                                                                            item,
                                                                        ) => {
                                                                            // Calculate discount amount for display
                                                                            const isFree =
                                                                                item.price <=
                                                                                    0 &&
                                                                                item.originalPrice &&
                                                                                item.originalPrice >
                                                                                    0;
                                                                            const unitDiscount =
                                                                                item.originalPrice &&
                                                                                item.price <
                                                                                    item.originalPrice
                                                                                    ? item.originalPrice -
                                                                                      item.price
                                                                                    : 0;
                                                                            const totalDiscount =
                                                                                unitDiscount *
                                                                                item.quantity;

                                                                            return (
                                                                                <li
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                    className={`${isFree ? "text-green-600 font-medium" : "text-gray-700"}`}
                                                                                >
                                                                                    {/* Show name and discount status */}
                                                                                    {item
                                                                                        .name
                                                                                        .length >
                                                                                    30
                                                                                        ? `${item.name.substring(0, 30)}...`
                                                                                        : item.name}
                                                                                    {isFree
                                                                                        ? " (Miễn phí)"
                                                                                        : totalDiscount >
                                                                                            0
                                                                                          ? ` (−${formatCurrency(totalDiscount)})`
                                                                                          : ""}
                                                                                </li>
                                                                            );
                                                                        },
                                                                    )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Product-specific discounts */}
                                            {d.targetType === "products" &&
                                                d.productIds && (
                                                    <div className="text-xs italic mt-1 text-gray-600">
                                                        <span className="font-medium">
                                                            Sản phẩm được giảm
                                                            giá:
                                                        </span>
                                                        <ul className="mt-1 list-disc pl-5 space-y-0.5">
                                                            {cartItems
                                                                .filter(
                                                                    (item) =>
                                                                        d.productIds?.includes(
                                                                            item.id,
                                                                        ),
                                                                )
                                                                .map((item) => (
                                                                    <li
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className={`${item.price <= 0 && item.originalPrice ? "text-green-600 font-medium" : "text-gray-700"}`}
                                                                    >
                                                                        {item
                                                                            .name
                                                                            .length >
                                                                        30
                                                                            ? `${item.name.substring(0, 30)}...`
                                                                            : item.name}
                                                                        {item.price <=
                                                                            0 &&
                                                                        item.originalPrice
                                                                            ? " (Miễn phí)"
                                                                            : ""}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2 font-medium text-green-700 border-t border-green-200 pt-2">
                                    Tổng khuyến mãi tự động:{" "}
                                    {formatCurrency(totalAutoDiscountAmount)}
                                </p>
                            </div>
                        )}

                        {/* Manual Discount Section */}
                        {discount && (
                            <div className="flex flex-col text-green-600 text-sm">
                                <div className="flex justify-between">
                                    <p>
                                        Mã giảm giá: {discount.discountCode}
                                        {discount.type === "percentage"
                                            ? ` (${discount.discountAmount}%)`
                                            : ""}
                                    </p>
                                    <p>
                                        - {formatCurrency(appliedCouponAmount)}
                                    </p>
                                </div>
                                {discount.targetType === "products" &&
                                    discount.productIds && (
                                        <p className="text-xs italic mt-1">
                                            Chỉ áp dụng cho sản phẩm:
                                            {discount.targetedProducts?.join(
                                                ", ",
                                            ) ||
                                                cartItems
                                                    .filter((item) =>
                                                        discount.productIds?.includes(
                                                            item.id,
                                                        ),
                                                    )
                                                    .map((item) => item.name)
                                                    .join(", ")}
                                        </p>
                                    )}
                                {discount.targetType === "categories" &&
                                    discount.categoryNames &&
                                    discount.categoryNames.length > 0 && (
                                        <p className="text-xs italic mt-1">
                                            Chỉ áp dụng cho danh mục:{" "}
                                            {discount.categoryNames.join(", ")}
                                        </p>
                                    )}
                            </div>
                        )}
                    </>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-medium">
                    <p className="text-gray-900">Tổng cộng</p>
                    <p className="text-primary font-semibold">
                        {displayTotal <= 0 ? (
                            <span className="text-green-600">Miễn phí</span>
                        ) : (
                            formatCurrency(displayTotal)
                        )}
                    </p>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="mt-6">
                <Link
                    href="/checkout"
                    className={`w-full bg-primary py-3 px-4 rounded-md text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center block transition-colors ${
                        cartItems.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                    onClick={(e) => {
                        if (cartItems.length === 0) {
                            e.preventDefault();
                            return;
                        }

                        // Determine which cart items to use based on discount type
                        const checkoutCartItems = isUsingManualDiscount
                            ? cartItems // Original cart items for manual discount
                            : discountedCartItems &&
                                discountedCartItems.length > 0
                              ? discountedCartItems // Cart items with automatic discounts applied
                              : cartItems;

                        // Store both discount information and the actual cart items to use
                        localStorage.setItem(
                            "checkoutData",
                            JSON.stringify({
                                // Discount information
                                discountInfo: {
                                    discount: isUsingManualDiscount
                                        ? discount
                                        : null,
                                    appliedAutomaticDiscounts:
                                        isUsingManualDiscount
                                            ? []
                                            : appliedAutomaticDiscounts,
                                    manualDiscountAmount: isUsingManualDiscount
                                        ? appliedCouponAmount
                                        : 0,
                                    totalAutoDiscountAmount:
                                        isUsingManualDiscount
                                            ? 0
                                            : totalAutoDiscountAmount,
                                    isUsingManualDiscount,
                                },
                                // Cart items to use for checkout with discounts already applied
                                cartItems: checkoutCartItems,
                                // Additional summary information
                                summary: {
                                    subtotal: subtotal,
                                    shippingFee: shippingFee,
                                    total: total,
                                },
                            }),
                        );

                        // For backward compatibility, also store the original appliedDiscounts
                        localStorage.setItem(
                            "appliedDiscounts",
                            JSON.stringify({
                                discount: isUsingManualDiscount
                                    ? discount
                                    : null,
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
                    }}
                >
                    Tiến hành thanh toán
                </Link>
            </div>

            {/* Clear Cart Button - Updated to use the new handler */}
            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Hoặc</p>
                <button
                    onClick={clearCart}
                    className="font-medium text-red-600 hover:text-red-800 mt-1 transition-colors"
                >
                    Xóa giỏ hàng
                </button>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                    Sử dụng mã giảm giá
                </h2>

                {!discount ? (
                    <div className="flex flex-col space-y-3">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                className="w-full border border-gray-200 rounded-md p-2"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button
                                className={`bg-primary text-white font-medium px-4 py-2 rounded-md ${
                                    applyingCoupon ? "opacity-70" : ""
                                }`}
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                            >
                                {applyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
                            </button>
                        </div>
                        {couponError && (
                            <p className="text-red-500 text-sm">
                                {couponError}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                            <div>
                                <p className="font-medium text-green-800">
                                    {discount.discountName}
                                </p>
                                <p className="text-sm text-green-600">
                                    {discount.type === "percentage"
                                        ? `Giảm ${discount.discountAmount}%`
                                        : `Giảm ${formatCurrency(
                                              discount.discountAmount,
                                          )}`}
                                </p>
                            </div>
                            <button
                                onClick={removeCoupon}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
                {automaticDiscounts.length > 0 &&
                    automaticDiscounts.length !== 1 && (
                        <div className="mt-4 text-xs text-gray-500">
                            <p className="font-medium mb-1">
                                Các khuyến mãi tự động khác:
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                {automaticDiscounts
                                    .filter(
                                        (d) =>
                                            !appliedAutomaticDiscounts.some(
                                                (ad) => ad.id === d.id,
                                            ),
                                    )
                                    .map((d: Discount) => (
                                        <li key={d.id}>{d.discountName}</li>
                                    ))}
                            </ul>
                        </div>
                    )}
            </div>

            {/* Payment Methods */}
            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                    Chúng tôi chấp nhận thanh toán qua
                </h2>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <Image src={VietQRLogo} alt="Visa" width={48} height={48} />
                </div>
            </div>
        </>
    );
};

export default CartSummary;
