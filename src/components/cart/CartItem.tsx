"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

export interface CartItemProps {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
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
    onUpdateQuantity,
    onRemove,
    formatCurrency,
}) => {
    return (
        <tr>
            {/* Product */}
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                            src={image}
                            alt={name}
                            className="h-full w-full object-contain object-center"
                            width={80}
                            height={80}
                        />
                    </div>
                    <div className="ml-4">
                        <Link
                            href={`/product/${slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                        >
                            {name}
                        </Link>
                    </div>
                </div>
            </td>

            {/* Quantity */}
            <td className="px-6 py-4">
                <div className="flex items-center justify-center text-gray-900">
                    <button
                        onClick={() => onUpdateQuantity(id, quantity - 1)}
                        disabled={quantity <= 1}
                        className={`p-1 rounded-md ${quantity <= 1 ? "text-gray-300" : "hover:bg-gray-100"}`}
                    >
                        <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                            onUpdateQuantity(id, parseInt(e.target.value) || 1)
                        }
                        className="mx-2 w-12 text-center border border-gray-300 rounded-md p-1"
                    />
                    <button
                        onClick={() => onUpdateQuantity(id, quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                </div>
            </td>

            {/* Price */}
            <td className="px-6 py-4 text-right text-sm font-medium text-primary">
                {formatCurrency(price)}
            </td>

            {/* Subtotal */}
            <td className="px-6 py-4 text-right text-sm font-semibold text-primary">
                {formatCurrency(price * quantity)}
            </td>

            {/* Remove button */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onRemove(id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove item"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </td>
        </tr>
    );
};

export default CartItem;
