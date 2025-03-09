"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Heart, ShoppingCart } from "lucide-react";
import { addToCart } from "@/api/cart";
import { toast } from "react-hot-toast";

interface ProductDetails {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
    description: string;
    category: string;
    rating: number;
    stockQuantity: number;
}

interface WishlistItemProps {
    product: ProductDetails;
    onRemove: () => void;
    isRemoving: boolean;
}

const WishlistItem: React.FC<WishlistItemProps> = ({
    product,
    onRemove,
    isRemoving,
}) => {
    const [isAddingToCart, setIsAddingToCart] = React.useState(false);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            await addToCart(product.id, 1);
            toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        } catch (error) {
            console.error("Error adding item to cart:", error);
            toast.error("Không thể thêm sản phẩm vào giỏ hàng");
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <li className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0">
                <Link
                    href={`/product/${product.id}`}
                >
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="w-24 h-24 object-contain bg-gray-100 rounded-md"
                    />
                </Link>
            </div>

            <div className="flex-grow">
                <Link
                    href={`/product/${product.id}`}
                >
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary">
                        {product.name}
                    </h3>
                </Link>

                <p className="text-primary font-semibold mt-2">
                    {formatCurrency(product.price)}
                </p>

                {product.stockQuantity > 0 ? (
                    <span className="text-sm text-green-600 mt-1 block">
                        Còn hàng
                    </span>
                ) : (
                    <span className="text-sm text-red-500 mt-1 block">
                        Hết hàng
                    </span>
                )}

                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || product.stockQuantity <= 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md 
                     shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {isAddingToCart ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Thêm vào giỏ hàng
                    </button>

                    <button
                        onClick={onRemove}
                        disabled={isRemoving}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                     rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Heart className="h-4 w-4 mr-2 fill-current" />
                        )}
                        Xóa
                    </button>
                </div>
            </div>

            <div className="sm:hidden w-full h-px bg-gray-200 my-2"></div>
        </li>
    );
};

export default WishlistItem;
