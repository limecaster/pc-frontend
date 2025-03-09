import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { fetchProductsByCategory, fetchNewProducts } from "@/api/product";

interface ProductGridProps {
    category?: string;
    products?: any[];
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
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(propIsLoading || true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If loading state is controlled by parent, use that
        if (propIsLoading !== undefined) {
            setLoading(propIsLoading);
        }
    }, [propIsLoading]);

    useEffect(() => {
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

    if (loading) {
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
