import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/products/product/ProductCard";
import { getHotSalesProducts } from "@/api/hot-sales";
import { ProductDetailsDto } from "@/types/product";

const HotSalesSection = () => {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getHotSalesProducts();
                // Limit to 4 products for homepage display
                setProducts(data.slice(0, 4));
            } catch (error) {
                console.error(
                    "Error fetching hot sales products for homepage:",
                    error,
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // If no products, don't render the section
    if (!loading && products.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-12 bg-gradient-to-r from-rose-50 to-rose-100 rounded-3xl my-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Hot Sales
                    </h2>
                    <p className="text-gray-600">
                        Special deals on our most popular products
                    </p>
                </div>
                <Link
                    href="/products/hot-sales"
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg inline-block font-medium transition-colors"
                >
                    View All Deals
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4)
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
            ) : (
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
                                product.imageUrl || "/images/placeholder.png"
                            }
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default HotSalesSection;
