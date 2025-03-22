"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

interface CartItemProps {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
    stock_quantity?: number; // Add stock quantity
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
    formatCurrency: (amount: number) => string;
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
}) => {
    // Determine if we should disable the increase button
    const isIncreaseDisabled =
        stock_quantity !== undefined && quantity >= stock_quantity;

    // Check if stock warning needs to be shown
    const showStockWarning =
        stock_quantity !== undefined &&
        stock_quantity < 5 &&
        quantity <= stock_quantity;

    return (
        <tr className="border-b border-gray-200">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Link href={`/product/${slug}`}>
                            <Image
                                src={image || "/images/product-placeholder.jpg"}
                                alt={name}
                                width={64}
                                height={64}
                                className="h-full w-full object-contain object-center"
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
                        {showStockWarning && (
                            <p className="mt-1 text-xs text-orange-500">
                                Chỉ còn {stock_quantity} sản phẩm
                            </p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => onUpdateQuantity(id, quantity - 1)}
                        className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                        disabled={quantity <= 1}
                    >
                        <span className="text-lg font-medium">-</span>
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={stock_quantity}
                        value={quantity}
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            if (!isNaN(newValue) && newValue >= 1) {
                                onUpdateQuantity(id, newValue);
                            }
                        }}
                        className="mx-2 w-12 rounded-md border border-gray-300 p-1 text-center text-sm text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        onClick={() => onUpdateQuantity(id, quantity + 1)}
                        className={`h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 flex items-center justify-center ${
                            isIncreaseDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={isIncreaseDisabled}
                    >
                        <span className="text-lg font-medium">+</span>
                    </button>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(price)}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="text-sm font-medium text-primary">
                    {formatCurrency(price * quantity)}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onRemove(id)}
                    className="text-red-600 hover:text-red-800"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </td>
        </tr>
    );
};

export default CartItem;
