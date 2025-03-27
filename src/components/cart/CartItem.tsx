"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface CartItemProps {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
    stock_quantity?: number;
    onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    formatCurrency: (amount: number) => string;
    originalPrice?: number;
    discountSource?: "automatic" | "manual";
    discountType?: "fixed" | "percentage";
}

const CartItem: React.FC<CartItemProps> = ({
    id,
    name,
    price,
    quantity,
    image,
    slug,
    stock_quantity,
    onUpdateQuantity,
    onRemove,
    formatCurrency,
    originalPrice,
    discountSource,
    discountType,
}) => {
    // IMPROVED: Add local state to prevent UI lag
    const [localQuantity, setLocalQuantity] = React.useState(quantity);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // Update local state when prop changes
    React.useEffect(() => {
        setLocalQuantity(quantity);
    }, [quantity]);

    // Determine if we should disable the increase button based on stock
    const isIncreaseDisabled =
        stock_quantity !== undefined && localQuantity >= stock_quantity;

    // Check if this item has a discount applied
    const hasDiscount = originalPrice && originalPrice > price;

    // Handle quantity decrease with immediate local update
    const handleDecrease = () => {
        if (localQuantity > 1 && !isUpdating) {
            setIsUpdating(true);
            setLocalQuantity(localQuantity - 1);

            onUpdateQuantity(id, localQuantity - 1).finally(() => {
                setIsUpdating(false);
            });
        }
    };

    // Handle quantity increase with validation for numeric safety
    const handleIncrease = () => {
        if (!isIncreaseDisabled && !isUpdating) {
            // Prevent numeric overflow by checking price * quantity
            const nextQuantity = localQuantity + 1;

            // // Check price-based limits
            // if (price > 0) {
            //     const total = price * nextQuantity;
            //     if (total > 99999999) {
            //         toast.error(
            //             "Đạt số lượng tối đa cho sản phẩm này với giá hiện tại.",
            //         );
            //         return;
            //     }
            // }

            // // Prevent exceeding 100 units
            // if (nextQuantity > 100) {
            //     toast.error("Số lượng tối đa cho phép là 100");
            //     return;
            // }

            setIsUpdating(true);
            setLocalQuantity(nextQuantity);

            onUpdateQuantity(id, nextQuantity).finally(() => {
                setIsUpdating(false);
            });
        }
    };

    // Handle input change with validation and debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value > 0) {
            // Limit maximum quantity based on price to prevent overflow
            let safeValue = Math.min(value, 100);

            // Calculate if this would cause numeric overflow (99,999,999.99 limit)
            // if (price > 0) {
            //     const total = price * safeValue;
            //     if (total > 99999999) {
            //         const maxSafeQuantity = Math.floor(99999999 / price);
            //         safeValue = Math.min(
            //             safeValue,
            //             Math.max(1, maxSafeQuantity),
            //         );
            //         toast.error(
            //             "Số lượng đã được điều chỉnh để phù hợp với hệ thống.",
            //         );
            //     }
            // }

            // Apply stock limit if needed
            if (stock_quantity !== undefined) {
                safeValue = Math.min(safeValue, stock_quantity);
            }

            if (safeValue !== value) {
                if (stock_quantity !== undefined && value > stock_quantity) {
                    toast.error(
                        `Số lượng tối đa có thể mua là ${stock_quantity}`,
                    );
                }
            }

            // Update local UI immediately
            setLocalQuantity(safeValue);

            // Debounce the actual API call
            const timer = setTimeout(() => {
                setIsUpdating(true);
                onUpdateQuantity(id, safeValue).finally(() => {
                    setIsUpdating(false);
                });
            }, 500);

            return () => clearTimeout(timer);
        }
    };

    // Add a calculated total for the row that handles free items properly
    const rowTotal =
        price <= 0
            ? 0 // If item is free, row total is 0
            : price * quantity;

    // Add more informative display for item discount
    const renderPriceInfo = () => {
        // If item is free, show special styling
        if (price <= 0 && originalPrice && originalPrice > 0) {
            return (
                <>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                    <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(originalPrice)}
                    </div>
                    <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-sm">
                        Khuyến mãi
                    </span>
                </>
            );
        }

        // If item has a regular discount
        if (originalPrice && originalPrice > price) {
            return (
                <>
                    <span className="font-medium text-gray-900">
                        {formatCurrency(price)}
                    </span>
                    <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(originalPrice)}
                    </div>
                    <span
                        className={`text-xs px-1.5 py-0.5 rounded-sm ${
                            discountSource === "automatic"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-rose-100 text-rose-600"
                        }`}
                    >
                        {discountSource === "automatic"
                            ? "Khuyến mãi"
                            : "Giảm giá"}
                    </span>
                </>
            );
        }

        // Regular price (no discount)
        return (
            <span className="font-medium text-gray-900">
                {formatCurrency(price)}
            </span>
        );
    };

    // Simplify the remove handler since tracking is now in the API
    const handleRemove = async () => {
        // Simply call the onRemove function which now has tracking built in
        await onRemove(id);
    };

    return (
        <tr>
            <td className="py-4 px-6">
                <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        <Link href={`/product/${slug}`}>
                            <Image
                                src={image || "/images/placeholder.png"}
                                alt={name}
                                fill
                                sizes="64px"
                                className="object-cover object-center"
                            />
                        </Link>
                    </div>
                    <div className="ml-4">
                        <Link
                            href={`/product/${slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                        >
                            {name}
                        </Link>
                        {stock_quantity !== undefined &&
                            stock_quantity < 10 && (
                                <p className="mt-1 text-xs text-orange-500">
                                    Chỉ còn {stock_quantity} sản phẩm
                                </p>
                            )}
                    </div>
                </div>
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center justify-center">
                    <div className="flex border border-gray-800 rounded items-center h-8">
                        <button
                            onClick={handleDecrease}
                            disabled={localQuantity <= 1 || isUpdating}
                            className={`px-2 py-1 h-full ${
                                localQuantity <= 1 || isUpdating
                                    ? "text-gray-200"
                                    : "text-gray-600"
                            }`}
                        >
                            -
                        </button>
                        <input
                            type="text"
                            value={localQuantity}
                            onChange={handleInputChange}
                            className="w-14 h-full text-center focus:outline-none"
                            disabled={isUpdating}
                        />
                        <button
                            onClick={handleIncrease}
                            disabled={isIncreaseDisabled || isUpdating}
                            className={`px-2 py-1 h-full ${
                                isIncreaseDisabled || isUpdating
                                    ? "text-gray-200"
                                    : "text-gray-600"
                            }`}
                        >
                            +
                        </button>
                    </div>
                </div>
            </td>
            <td className="py-4 px-6 text-right">
                <div>{renderPriceInfo()}</div>
            </td>
            <td className="py-4 px-6 text-right font-medium text-primary">
                {rowTotal <= 0 ? (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                ) : (
                    formatCurrency(rowTotal)
                )}
            </td>
            <td className="py-4 px-6 text-right">
                <button
                    onClick={handleRemove}
                    className="text-red-500 hover:text-red-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </td>
        </tr>
    );
};

export default CartItem;
