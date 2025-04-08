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

    // Calculate total
    const calculateTotal = () => {
        let total = subtotal + deliveryFee;
        if (totalDiscount > 0) {
            total -= totalDiscount;
        }
        return Math.max(0, total);
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
            <p className="text-xs italic mt-1">
                Chỉ áp dụng cho:{" "}
                {discount.targetedProducts?.join(", ") || "sản phẩm đã chọn"}
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
                    Giảm {discountPercent}% ({formatCurrency(discountAmount)})
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Chi tiết đơn hàng
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
                                        "/images/placeholder.png"
                                    }
                                    alt={item.name || "Product"}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-grow w-0">
                                <Tooltip content={item.name}>
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        <Link
                                            href={`/product/${item.id}`}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </h3>
                                </Tooltip>
                                <span className="text-sm text-gray-500">
                                    {item.quantity} x{" "}
                                </span>
                                <span className="text-sm font-medium text-primary">
                                    {formatCurrency(item.price)}
                                </span>

                                {/* Add item-level discount info */}
                                {renderItemDiscountInfo(item)}
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isProcessingPayment}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        Giỏ hàng của bạn đang trống
                    </div>
                )}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between text-base text-gray-900">
                    <p>Tạm tính</p>
                    <p className="text-primary font-medium">
                        {formatCurrency(subtotal)}
                    </p>
                </div>

                <div className="flex justify-between text-base text-gray-900">
                    <p>Phí vận chuyển</p>
                    <p className="text-secondary">
                        {deliveryFee === 0
                            ? "Miễn phí"
                            : formatCurrency(deliveryFee)}
                    </p>
                </div>

                {/* Manual discount if applied */}
                {appliedDiscount && isUsingManualDiscount && (
                    <div className="flex flex-col text-green-600 text-sm">
                        <div className="flex justify-between">
                            <p>
                                Mã giảm giá: {appliedDiscount.discountCode}
                                {appliedDiscount.type &&
                                    ` (${displayDiscountValue(appliedDiscount)})`}
                            </p>
                            <p>- {formatCurrency(manualDiscountAmount)}</p>
                        </div>
                        {displayTargetedProducts(appliedDiscount)}
                    </div>
                )}

                {/* Automatic discounts if applied */}
                {appliedAutomaticDiscounts.length > 0 &&
                    !isUsingManualDiscount && (
                        <div className="text-green-600 text-base">
                            <div className="flex justify-between">
                                <p>Khuyến mãi tự động:</p>
                                <p>
                                    - {formatCurrency(automaticDiscountAmount)}
                                </p>
                            </div>
                            {appliedAutomaticDiscounts.length > 1 && (
                                <ul className="mt-1 text-xs">
                                    {appliedAutomaticDiscounts.map((d) => (
                                        <li
                                            key={d.id}
                                            className="flex justify-between"
                                        >
                                            <span>{d.discountName}</span>
                                            {d.type && (
                                                <span>
                                                    {displayDiscountValue(d)}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                {/* Total with all discounts applied */}
                <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
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
