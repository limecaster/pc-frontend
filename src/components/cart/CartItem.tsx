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
    const [localQuantity, setLocalQuantity] = React.useState(quantity);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);

    React.useEffect(() => {
        setLocalQuantity(quantity);
    }, [quantity]);

    const isIncreaseDisabled =
        stock_quantity !== undefined && localQuantity >= stock_quantity;

    const handleDecrease = () => {
        if (localQuantity > 1 && !isUpdating) {
            setIsUpdating(true);
            setLocalQuantity(localQuantity - 1);

            onUpdateQuantity(id, localQuantity - 1).finally(() => {
                setIsUpdating(false);
            });
        }
    };

    const handleIncrease = () => {
        if (!isIncreaseDisabled && !isUpdating) {
            const nextQuantity = localQuantity + 1;
            setIsUpdating(true);
            setLocalQuantity(nextQuantity);

            onUpdateQuantity(id, nextQuantity).finally(() => {
                setIsUpdating(false);
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value > 0) {
            let safeValue = Math.min(value, 100);

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

            setLocalQuantity(safeValue);

            const timer = setTimeout(() => {
                setIsUpdating(true);
                onUpdateQuantity(id, safeValue).finally(() => {
                    setIsUpdating(false);
                });
            }, 500);

            return () => clearTimeout(timer);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);

        try {
            await onRemove(id);
        } catch (error) {
            setIsRemoving(false);
            toast.error("Không thể xóa sản phẩm khỏi giỏ hàng");
            console.error("Error removing item:", error);
        }
    };

    const rowTotal = price * localQuantity;

    if (isRemoving) {
        return null;
    }

    const renderPriceInfo = () => {
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

        return (
            <span className="font-medium text-gray-900">
                {formatCurrency(price)}
            </span>
        );
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
                    <div className="flex items-center justify-center rounded-md border border-gray-300 h-8">
                        <button
                            onClick={handleDecrease}
                            type="button"
                            disabled={localQuantity <= 1 || isUpdating}
                            className={`px-2 py-1 text-gray-600 ${
                                localQuantity <= 1 || isUpdating
                                    ? "text-gray-200 cursor-not-allowed"
                                    : "hover:text-primary cursor-pointer"
                            }`}
                        >
                            -
                        </button>
                        <input
                            type="text"
                            value={localQuantity}
                            onChange={handleInputChange}
                            className="w-14 h-full text-center bg-transparent focus:outline-none border-x border-t-0 border-b-0 border-gray-300"
                            disabled={isUpdating}
                        />
                        <button
                            onClick={handleIncrease}
                            type="button"
                            disabled={isIncreaseDisabled || isUpdating}
                            className={`px-2 py-1 text-gray-600 ${
                                isIncreaseDisabled || isUpdating
                                    ? "text-gray-200 cursor-not-allowed"
                                    : "hover:text-primary cursor-pointer"
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
