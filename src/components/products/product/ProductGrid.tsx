import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import {
    fetchProductsByCategory,
    fetchNewProducts,
    batchLoadProductsWithDiscounts,
} from "@/api/product";
import { ProductDetailsDto } from "@/types/product";

interface ProductGridProps {
    category?: string;
    products?: ProductDetailsDto[];
    isLoading?: boolean;
    page?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    category,
    products: propProducts,
    isLoading: propIsLoading,
    page = 1,
}) => {
    useEffect(() => {
        console.log("🔵 Products Grid mounted");
        return () => console.log("🔴 Products Grid unmounted");
    }, []);

    if (propIsLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {propProducts && propProducts.length > 0 ? (
                propProducts.map((product) => (
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
                        imageUrl={product.imageUrl || "/images/placeholder.png"}
                    />
                ))
            ) : (
                <div className="col-span-4 text-center py-10">
                    <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
