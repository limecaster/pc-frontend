"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip";

interface ViewedProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    viewedAt: string;
    category: string;
}

const ViewedProductsPage: React.FC = () => {
    const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([
        {
            id: "1",
            name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
            price: 17990000,
            image: "/products/rtx4070.jpg",
            viewedAt: "Hôm nay, 10:30",
            category: "Card đồ họa",
        },
        {
            id: "2",
            name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
            price: 2190000,
            image: "/products/keyboard.jpg",
            viewedAt: "Hôm qua, 14:15",
            category: "Bàn phím",
        },
        {
            id: "3",
            name: "Chuột gaming Logitech G502 X PLUS LightForce",
            price: 3490000,
            image: "/products/mouse.jpg",
            viewedAt: "22/10/2023, 09:45",
            category: "Chuột",
        },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Sản phẩm đã xem gần đây
            </h1>

            {viewedProducts.length > 0 ? (
                <div className="space-y-4">
                    {viewedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-24 h-24 relative">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div>
                                            <Tooltip content={product.name}>
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    className="text-base font-medium text-gray-900 hover:text-primary line-clamp-2"
                                                >
                                                    {product.name}
                                                </Link>
                                            </Tooltip>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Danh mục: {product.category}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Xem gần đây: {product.viewedAt}
                                            </div>
                                        </div>
                                        <div className="text-primary font-semibold">
                                            {formatCurrency(product.price)}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark"
                                        >
                                            Xem sản phẩm
                                        </Link>
                                        <button
                                            onClick={() =>
                                                console.log(
                                                    "Add to cart:",
                                                    product.id,
                                                )
                                            }
                                            className="px-4 py-2 border border-primary text-primary text-sm rounded-md hover:bg-primary-50"
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">
                        Bạn chưa xem sản phẩm nào gần đây
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                    >
                        Khám phá sản phẩm
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ViewedProductsPage;
