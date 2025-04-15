import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getHotSalesProducts } from "@/api/hot-sales";
import { ProductDetailsDto } from "@/types/product";
import ProductGrid from "@/components/products/product/ProductGrid";
import { FaFireAlt, FaArrowRight } from "react-icons/fa";

const HotSalesSection = () => {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getHotSalesProducts();
                // Limit to 8 products for homepage display
                setProducts(data.slice(0, 8));
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
        <section className="container mx-auto px-4 py-8 my-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white rounded-xl p-6 shadow-sm">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start mb-1">
                        <FaFireAlt className="text-rose-600 text-xl mr-2 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Hot Sales
                        </h2>
                    </div>
                    <p className="text-gray-600">
                        Sản phẩm giảm giá hot nhất hiện nay
                    </p>
                </div>
                <Link
                    href="/products/hot-sales"
                    className="group text-primary hover:text-rose-600 inline-flex items-center font-medium transition-colors"
                >
                    <span>Xem tất cả</span>
                    <FaArrowRight className="ml-1 text-sm transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Promotion banner */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50 rounded-xl p-6 shadow-md relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="relative z-10 text-center md:text-left p-4">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                Khuyến Mãi Hot!
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Tiết kiệm đến 50% cho các sản phẩm công nghệ.
                                Giá giảm mạnh chỉ trong thời gian giới hạn.
                            </p>
                            <Link
                                href="/products/hot-sales"
                                className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Mua ngay
                            </Link>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-5 right-5 w-16 h-16 bg-rose-200 rounded-full opacity-40"></div>
                        <div className="absolute bottom-5 left-5 w-24 h-24 bg-rose-300 rounded-full opacity-30"></div>
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-rose-100 rounded-full opacity-50"></div>
                    </div>
                </div>

                {/* Right column: Products */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="hot-sales-grid">
                            <ProductGrid
                                products={products}
                                isLoading={loading}
                            />
                        </div>

                        <style jsx>{`
                            .hot-sales-grid :global(.grid) {
                                grid-template-columns: repeat(
                                    auto-fill,
                                    minmax(150px, 1fr)
                                );
                                gap: 0.75rem;
                            }

                            .hot-sales-grid :global(.animate-spin) {
                                border-color: #f43f5e;
                                border-right-color: transparent;
                            }

                            @media (min-width: 768px) {
                                .hot-sales-grid :global(.grid) {
                                    grid-template-columns: repeat(
                                        auto-fill,
                                        minmax(170px, 1fr)
                                    );
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HotSalesSection;
