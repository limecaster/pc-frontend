"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip";
import { getViewedProducts, clearViewedProducts } from "@/api/product";
import { ProductDetailsDto } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { trackProductClick } from "@/api/events";
import { addToCartAndSync } from "@/api/cart";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface GroupedProducts {
    [key: string]: ProductDetailsDto[];
}

const ViewedProductsPage: React.FC = () => {
    const [viewedProducts, setViewedProducts] = useState<ProductDetailsDto[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchViewedProducts();
    }, [currentPage]);

    const fetchViewedProducts = async () => {
        try {
            setLoading(true);
            const response = await getViewedProducts(currentPage);
            setViewedProducts(response.products);
            setTotalPages(response.pages);
            setTotalProducts(response.total);
            setError(null);
        } catch (err) {
            setError("Failed to load viewed products");
            console.error("Error fetching viewed products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearViewedProducts = async () => {
        try {
            const result = await clearViewedProducts();
            if (result.success) {
                setViewedProducts([]);
                toast.success("Đã xóa tất cả sản phẩm đã xem");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Failed to clear viewed products");
            console.error("Error clearing viewed products:", err);
        }
    };

    const groupProductsByDay = (
        products: ProductDetailsDto[],
    ): GroupedProducts => {
        const grouped: GroupedProducts = {};

        products.forEach((product) => {
            if (!product.viewedAt) return;

            const date = new Date(product.viewedAt);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(product);
        });

        return grouped;
    };

    const filterProducts = (
        products: ProductDetailsDto[],
    ): ProductDetailsDto[] => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query),
            );
        }

        // Apply date filter
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            );

            filtered = filtered.filter((product) => {
                if (!product.viewedAt) return false;
                const viewedDate = new Date(product.viewedAt);

                switch (dateFilter) {
                    case "today":
                        return viewedDate >= today;
                    case "week":
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return viewedDate >= weekAgo;
                    case "month":
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return viewedDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    };

    const filteredProducts = filterProducts(viewedProducts);
    const groupedProducts = groupProductsByDay(filteredProducts);
    const sortedDates = Object.keys(groupedProducts).sort((a, b) =>
        b.localeCompare(a),
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchViewedProducts}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Sản phẩm đã xem gần đây
                </h1>
                {viewedProducts.length > 0 && (
                    <button
                        onClick={handleClearViewedProducts}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Tất cả thời gian</option>
                        <option value="today">Hôm nay</option>
                        <option value="week">7 ngày qua</option>
                        <option value="month">30 ngày qua</option>
                    </select>
                </div>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="space-y-8">
                    {sortedDates.map((date) => (
                        <div key={date} className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                {format(
                                    new Date(date),
                                    "EEEE, d 'tháng' M, yyyy",
                                    { locale: vi },
                                )}
                            </h2>
                            <div className="space-y-4">
                                {groupedProducts[date].map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full sm:w-24 h-24 relative">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div>
                                                        <Tooltip
                                                            content={
                                                                product.name
                                                            }
                                                        >
                                                            <Link
                                                                href={`/product/${product.id}`}
                                                                className="text-base font-medium text-gray-900 hover:text-primary line-clamp-2"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </Tooltip>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            Danh mục:{" "}
                                                            {product.category}
                                                        </div>
                                                    </div>
                                                    <div className="text-primary font-semibold">
                                                        {formatCurrency(
                                                            product.price || 0,
                                                        )}
                                                        {product.isDiscounted && (
                                                            <span className="ml-2 text-sm text-gray-500 line-through">
                                                                {formatCurrency(
                                                                    product.originalPrice ||
                                                                        0,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-3">
                                                    <Link
                                                        href={`/product/${product.id}`}
                                                        className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            trackProductClick(
                                                                product.id,
                                                                {
                                                                    name: product.name,
                                                                    price: product.price,
                                                                    originalPrice:
                                                                        product.originalPrice,
                                                                    discountPercentage:
                                                                        product.discountPercentage,
                                                                    isDiscounted:
                                                                        product.isDiscounted,
                                                                    discountSource:
                                                                        product.discountSource,
                                                                    discountType:
                                                                        product.discountType,
                                                                    rating: product.rating,
                                                                    reviewCount:
                                                                        product.reviewCount,
                                                                },
                                                            );
                                                            router.push(
                                                                `/product/${product.id}`,
                                                            );
                                                        }}
                                                    >
                                                        Xem sản phẩm
                                                    </Link>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            try {
                                                                const result =
                                                                    await addToCartAndSync(
                                                                        product.id,
                                                                        1,
                                                                    );
                                                                toast.success(
                                                                    `Đã thêm sản phẩm vào giỏ hàng!`,
                                                                    {
                                                                        duration: 3000,
                                                                    },
                                                                );
                                                            } catch (error) {
                                                                console.error(
                                                                    "Error adding to cart:",
                                                                    error,
                                                                );
                                                                toast.error(
                                                                    "Không thể thêm vào giỏ hàng. Vui lòng thử lại!",
                                                                );
                                                            }
                                                        }}
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
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <span className="text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">
                        {searchQuery || dateFilter !== "all"
                            ? "Không tìm thấy sản phẩm phù hợp"
                            : "Bạn chưa xem sản phẩm nào gần đây"}
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
