import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    limit?: number;
    category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ limit, category }) => {
    const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url =
                    "http://localhost:3001/products/landing-page-products";

                // Add category filter if provided
                if (category) {
                    url = `http://localhost:3001/products/category/${category}`;
                } else if (limit) {
                    // If no category but limit is provided, it's likely for the landing page
                    url =
                        "http://localhost:3001/products/landing-page-products";
                }

                const response = await fetch(url);
                const products = await response.json();

                if (Array.isArray(products)) {
                    setDisplayedProducts(
                        limit ? products.slice(0, limit) : products,
                    );
                } else {
                    console.error(
                        "Fetched products is not an array:",
                        products,
                    );
                    setDisplayedProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setDisplayedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [limit, category]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
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
