"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/products/product/ProductCard";
import { getHotSalesProducts } from "@/api/hot-sales";
import { ProductDetailsDto } from "@/types/product";

export default function HotSalesPage() {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "B Store - Hot Sales";
        fetchHotSalesProducts();
    }, []);

    const fetchHotSalesProducts = async () => {
        try {
            setLoading(true);
            const data = await getHotSalesProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching hot sales products:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="my-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array(8)
                            .fill(0)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md p-4 h-80 animate-pulse"
                                >
                                    <div className="bg-gray-300 h-40 rounded-md mb-4"></div>
                                    <div className="bg-gray-300 h-6 w-3/4 rounded-md mb-2"></div>
                                    <div className="bg-gray-300 h-4 w-1/2 rounded-md mb-4"></div>
                                    <div className="bg-gray-300 h-10 w-full rounded-md"></div>
                                </div>
                            ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                originalPrice={product.originalPrice}
                                discountPercentage={product.discountPercentage}
                                isDiscounted={product.isDiscounted}
                                discountSource={product.discountSource}
                                discountType={product.discountType}
                                rating={product.rating || 0}
                                reviewCount={product.reviewCount || 0}
                                imageUrl={
                                    product.imageUrl ||
                                    "/images/placeholder.png"
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            No hot sales products available right now.
                        </p>
                        <p className="text-gray-500 mt-2">
                            Check back later for new deals!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
