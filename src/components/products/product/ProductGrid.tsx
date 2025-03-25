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
    onPageChange?: (page: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    category,
    products: propProducts,
    isLoading: propIsLoading,
    page = 1,
    onPageChange,
}) => {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState<boolean>(propIsLoading || true);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);

    // Use this ref to track which product IDs we've already requested discounts for
    // This prevents infinite loops by ensuring we don't request discounts for the same products twice
    const processedProductIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        // If loading state is controlled by parent, use that
        if (propIsLoading !== undefined) {
            setLoading(propIsLoading);
        }
    }, [propIsLoading]);

    useEffect(() => {
        // Reset the processed products when category or page changes
        processedProductIds.current = new Set();

        // If products are provided as props, use them
        if (propProducts) {
            setProducts(propProducts);
            if (propIsLoading === undefined) {
                setLoading(false);
            }
            return;
        }

        // Otherwise load products by category or fetch new products
        const loadProducts = async () => {
            if (propIsLoading === undefined) {
                setLoading(true);
            }

            try {
                let fetchedProducts;

                if (category) {
                    const response = await fetchProductsByCategory(
                        category,
                        page,
                    );
                    fetchedProducts = response.products || response;
                } else {
                    fetchedProducts = await fetchNewProducts();
                }
                setProducts(fetchedProducts);
            } catch (err) {
                setError("Failed to load products");
                console.error(err);
            } finally {
                if (propIsLoading === undefined) {
                    setLoading(false);
                }
            }
        };

        loadProducts();
    }, [category, propProducts, page, propIsLoading]);

    // Batch load discount information when product list changes
    useEffect(() => {
        // Skip if we're already in a loading state or have no products
        if (
            loading ||
            isLoadingDiscounts ||
            !products ||
            products.length === 0
        ) {
            return;
        }

        const loadDiscountInfo = async () => {
            try {
                // Get product IDs that need discount information
                const productIdsNeedingDiscounts = products
                    .filter(
                        (p) =>
                            !p.isDiscounted &&
                            !p.originalPrice &&
                            !processedProductIds.current.has(p.id),
                    )
                    .map((p) => p.id);

                // If no products need discounts, we can skip the request
                if (productIdsNeedingDiscounts.length === 0) {
                    return;
                }

                // Mark these IDs as processed so we don't request them again
                productIdsNeedingDiscounts.forEach((id) =>
                    processedProductIds.current.add(id),
                );

                setIsLoadingDiscounts(true);

                // Batch load products with discount information
                const productsWithDiscounts =
                    await batchLoadProductsWithDiscounts(
                        productIdsNeedingDiscounts,
                    );

                // Log the received discount information for debugging
                if (productsWithDiscounts.length > 0) {
                    const discounted = productsWithDiscounts.filter(
                        (p) => p.isDiscounted,
                    );
                }

                // Create a map for quick lookup
                const discountProductMap = productsWithDiscounts.reduce(
                    (map, product) => {
                        map[product.id] = product;
                        return map;
                    },
                    {} as Record<string, ProductDetailsDto>,
                );

                // Merge discount info with original product list
                // We'll use a functional update to ensure we have the latest state
                setProducts((currentProducts) =>
                    currentProducts.map((product) => {
                        if (discountProductMap[product.id]) {
                            return {
                                ...product,
                                ...discountProductMap[product.id],
                            };
                        }
                        return product;
                    }),
                );
            } catch (error) {
                console.error("Failed to load discount information:", error);
            } finally {
                setIsLoadingDiscounts(false);
            }
        };

        loadDiscountInfo();
    }, [products, loading]); // We're keeping these dependencies but added guards inside

    if (loading || isLoadingDiscounts) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.length > 0 ? (
                products.map((product) => (
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
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        imageUrl={product.imageUrl}
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
