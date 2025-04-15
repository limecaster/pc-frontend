"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFilteredHotSalesProducts } from "@/api/hot-sales";
import { ProductDetailsDto } from "@/types/product";
import PriceFilter from "@/components/products/filters/PriceFilter";
import BrandFilter from "@/components/products/filters/BrandFilter";
import RatingFilter from "@/components/products/filters/RatingFilter";
import ProductGrid from "@/components/products/product/ProductGrid";
import FilterBar from "@/components/products/FilterBar";
import SearchSort from "@/components/products/SearchSort";
import Pagination from "@/components/products/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

export default function HotSalesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialSortBy = searchParams.get("sortBy") || "popular";
    const initialMinPrice = searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined;
    const initialMaxPrice = searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined;
    const initialBrands = searchParams.get("brands")
        ? searchParams.get("brands")!.split(",")
        : [];
    const initialRating = searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined;

    // State
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<
        ProductDetailsDto[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortBy, setSortBy] = useState<string>(initialSortBy);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        initialMinPrice || 0,
        initialMaxPrice || 100_000_000,
    ]);
    const [selectedBrands, setSelectedBrands] =
        useState<string[]>(initialBrands);
    const [selectedRating, setSelectedRating] = useState<number | undefined>(
        initialRating,
    );
    const [activeFilters, setActiveFilters] = useState<
        Array<{ id: string; text: string }>
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [shouldUpdateUrl, setShouldUpdateUrl] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const updateActiveFilters = useCallback(() => {
        const filters: Array<{ id: string; text: string }> = [];

        selectedBrands.forEach((brand) => {
            filters.push({
                id: `brand-${brand}`,
                text: `Thương hiệu: ${brand}`,
            });
        });

        if (priceRange[0] > 0 || priceRange[1] < 100_000_000) {
            const formatter = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            });
            filters.push({
                id: "price-range",
                text: `Giá: ${formatter.format(priceRange[0])} - ${formatter.format(priceRange[1])}`,
            });
        }

        if (selectedRating !== undefined) {
            filters.push({
                id: "rating-filter",
                text: `Đánh giá: Từ ${selectedRating} sao trở lên`,
            });
        }

        setActiveFilters(filters);
    }, [selectedBrands, priceRange, selectedRating]);

    useEffect(() => {
        if (!shouldUpdateUrl) return;

        const params = new URLSearchParams();

        if (currentPage > 1) params.set("page", currentPage.toString());
        if (sortBy !== "popular") params.set("sortBy", sortBy);
        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
        if (priceRange[1] < 100_000_000)
            params.set("maxPrice", priceRange[1].toString());
        if (selectedBrands.length > 0)
            params.set("brands", selectedBrands.join(","));
        if (selectedRating !== undefined)
            params.set("minRating", selectedRating.toString());
        if (searchQuery) params.set("search", searchQuery);

        const query = params.toString();
        router.push(`/products/hot-sales${query ? `?${query}` : ""}`);

        setShouldUpdateUrl(false);
    }, [
        shouldUpdateUrl,
        router,
        currentPage,
        sortBy,
        priceRange,
        selectedBrands,
        selectedRating,
        searchQuery,
    ]);

    useEffect(() => {
        document.title = "B Store - Hot Sales";
        fetchHotSalesProducts();
    }, [
        currentPage,
        sortBy,
        selectedBrands,
        priceRange,
        selectedRating,
        searchQuery,
    ]);

    useEffect(() => {
        updateActiveFilters();
    }, [updateActiveFilters]);

    const fetchHotSalesProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getFilteredHotSalesProducts(
                currentPage,
                12,
                selectedBrands.length > 0 ? selectedBrands : undefined,
                priceRange[0] > 0 ? priceRange[0] : undefined,
                priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                selectedRating,
                sortBy,
                searchQuery,
            );

            setProducts(result.products);
            setFilteredProducts(result.products);
            setTotalPages(result.pages);
            setTotalResults(result.total);
        } catch (error) {
            console.error("Error fetching hot sales products:", error);
            setError("Có lỗi xảy ra khi tải sản phẩm khuyến mãi.");
            setProducts([]);
            setFilteredProducts([]);
            setTotalPages(1);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrandSelect = (brands: string[]) => {
        setSelectedBrands(brands);
        setShouldUpdateUrl(true);
    };

    const handlePriceChange = (minPrice: number, maxPrice: number) => {
        setPriceRange([minPrice, maxPrice]);
        setShouldUpdateUrl(true);
    };

    const handleRatingChange = (rating?: number) => {
        setSelectedRating(rating);
        setShouldUpdateUrl(true);
    };

    const handleFilteredProductsChange = (
        newFilteredProducts: ProductDetailsDto[],
    ) => {
        setFilteredProducts(newFilteredProducts);
    };

    const handleSort = (sortOption: string) => {
        setSortBy(sortOption);
        setShouldUpdateUrl(true);
    };

    const handleRemoveFilter = (id: string) => {
        if (id.startsWith("brand-")) {
            const brandName = id.replace("brand-", "");
            setSelectedBrands((prev) =>
                prev.filter((brand) => brand !== brandName),
            );
            setShouldUpdateUrl(true);
        } else if (id === "price-range") {
            setPriceRange([0, 100_000_000]);
            setShouldUpdateUrl(true);
        } else if (id === "rating-filter") {
            setSelectedRating(undefined);
            setShouldUpdateUrl(true);
        }
    };

    const resetAllFilters = () => {
        setSelectedBrands([]);
        setPriceRange([0, 100_000_000]);
        setSelectedRating(undefined);
        setSortBy("popular");
        setShouldUpdateUrl(true);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setShouldUpdateUrl(true);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10 text-gray-900">
            <div className="container mx-auto py-2">
                {/* Header */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <h1 className="text-2xl font-bold flex items-center text-primary">
                        <FontAwesomeIcon
                            icon={faFire}
                            className="mr-2 text-rose-500"
                        />
                        Hot Sales
                    </h1>
                    <p className="text-gray-600">
                        Sản phẩm giảm giá hot nhất hiện nay
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-[280px] flex-shrink-0">
                        <div className="flex flex-col gap-4">
                            {/* Price Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <PriceFilter
                                    onPriceChange={handlePriceChange}
                                    initialMinPrice={priceRange[0]}
                                    initialMaxPrice={priceRange[1]}
                                />
                            </div>

                            <div className="h-px bg-gray-300 w-full" />

                            {/* Brand Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <BrandFilter
                                    onBrandSelect={handleBrandSelect}
                                    selectedBrands={selectedBrands}
                                />
                            </div>

                            <div className="h-px bg-gray-300 w-full" />

                            {/* Rating Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <RatingFilter
                                    onRatingChange={handleRatingChange}
                                    selectedRating={selectedRating}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Header with search and sort */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <SearchSort
                                products={products}
                                onFilteredProductsChange={
                                    handleFilteredProductsChange
                                }
                                onSort={handleSort}
                                onSearch={handleSearch}
                                initialSearchQuery={searchQuery}
                            />
                        </div>

                        {/* Active Filters */}
                        <div className="mt-4 mb-6">
                            <FilterBar
                                activeFilters={activeFilters}
                                resultCount={filteredProducts.length}
                                onRemoveFilter={handleRemoveFilter}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64 bg-white p-6 rounded-lg shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-64 bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-lg text-gray-500">
                                    Không tìm thấy sản phẩm khuyến mãi phù hợp
                                </div>
                                <button
                                    className="mt-4 text-primary hover:underline"
                                    onClick={resetAllFilters}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <ProductGrid
                                    products={filteredProducts}
                                    isLoading={isLoading}
                                />

                                {/* Add pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
