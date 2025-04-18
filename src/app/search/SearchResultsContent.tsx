"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchSort from "@/components/products/SearchSort";
import FilterBar from "@/components/products/FilterBar";
import ProductGrid from "@/components/products/product/ProductGrid";
import Pagination from "@/components/products/Pagination";
import CategoryFilter from "@/components/products/filters/CategoryFilter";
import PriceFilter from "@/components/products/filters/PriceFilter";
import BrandFilter from "@/components/products/filters/BrandFilter";
import RatingFilter from "@/components/products/filters/RatingFilter";
import { searchProducts } from "@/api/product";

const SearchResultsContent: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get("q") || "";

    // Get query parameters
    const initialPage = searchParams.get("page")
        ? Number(searchParams.get("page"))
        : 1;
    const initialSortBy = searchParams.get("sortBy") || "featured";
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
    const initialCategory = searchParams.get("category") || null;

    // Parse subcategory filters from URL
    const initialSubcategoryFilters = searchParams.get("subcategories")
        ? JSON.parse(decodeURIComponent(searchParams.get("subcategories")!))
        : undefined;

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [activeFilters, setActiveFilters] = useState<
        Array<{ id: string; text: string }>
    >([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        initialCategory,
    );
    const [selectedBrands, setSelectedBrands] =
        useState<string[]>(initialBrands);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        initialMinPrice || 0,
        initialMaxPrice || 100_000_000,
    ]);
    const [selectedRating, setSelectedRating] = useState<number | undefined>(
        initialRating,
    );
    const [sortBy, setSortBy] = useState<string>(initialSortBy);
    const [subcategoryFilters, setSubcategoryFilters] = useState<
        Record<string, string[]> | undefined
    >(initialSubcategoryFilters);

    // Track if we need to update URL (only after user actions)
    const [shouldUpdateUrl, setShouldUpdateUrl] = useState<boolean>(false);

    // Function to get display name for category
    const getCategoryName = (categoryId: string): string => {
        const categoryMap: Record<string, string> = {
            CPU: "CPU",
            Motherboard: "Motherboard",
            RAM: "RAM",
            GraphicsCard: "Card đồ họa",
            InternalHardDrive: "Ổ cứng",
            Case: "Case",
            PowerSupply: "Nguồn",
            CPUCooler: "Tản nhiệt",
            Speaker: "Loa máy tính",
            Keyboard: "Bàn phím",
            Mouse: "Chuột",
            Monitor: "Màn hình",
            ThermalPaste: "Keo tản nhiệt",
            WiFiCard: "Card wifi",
            WiredNetworkCard: "Card mạng có dây",
        };

        return categoryMap[categoryId] || categoryId;
    };

    // Update active filters display
    const updateActiveFilters = useCallback(() => {
        const filters: Array<{ id: string; text: string }> = [];

        // Always add search query filter
        if (searchQuery) {
            filters.push({
                id: "search-query",
                text: `Tìm kiếm: ${searchQuery}`,
            });
        }

        // Add category filter if selected
        if (selectedCategory) {
            filters.push({
                id: `category-${selectedCategory}`,
                text: `Danh mục: ${getCategoryName(selectedCategory)}`,
            });
        }

        // Add brand filters
        selectedBrands.forEach((brand) => {
            filters.push({
                id: `brand-${brand}`,
                text: `Thương hiệu: ${brand}`,
            });
        });

        // Add subcategory filters
        if (subcategoryFilters) {
            Object.entries(subcategoryFilters).forEach(([key, values]) => {
                values.forEach((value) => {
                    filters.push({
                        id: `subcategory-${key}-${value}`,
                        text: `${key}: ${value}`,
                    });
                });
            });
        }

        // Add price filter
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

        // Add rating filter
        if (selectedRating !== undefined) {
            filters.push({
                id: "rating-filter",
                text: `Đánh giá: Từ ${selectedRating} sao trở lên`,
            });
        }

        setActiveFilters(filters);
    }, [
        searchQuery,
        selectedCategory,
        selectedBrands,
        priceRange,
        selectedRating,
        subcategoryFilters,
    ]);

    // Update URL parameters - only called when shouldUpdateUrl is true
    useEffect(() => {
        if (!shouldUpdateUrl) return;

        const params = new URLSearchParams();

        // Always preserve the search query
        params.set("q", searchQuery);

        if (currentPage > 1) params.set("page", currentPage.toString());
        if (sortBy !== "featured") params.set("sortBy", sortBy);
        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
        if (priceRange[1] < 100_000_000)
            params.set("maxPrice", priceRange[1].toString());
        if (selectedBrands.length > 0)
            params.set("brands", selectedBrands.join(","));
        if (selectedRating !== undefined)
            params.set("minRating", selectedRating.toString());
        if (selectedCategory) params.set("category", selectedCategory);

        // Add subcategory filters to URL if they exist
        if (subcategoryFilters && Object.keys(subcategoryFilters).length > 0) {
            params.set(
                "subcategories",
                encodeURIComponent(JSON.stringify(subcategoryFilters)),
            );
        }

        const query = params.toString();
        router.replace(`/search?${query}`, { scroll: false });

        // Reset the flag after updating URL
        setShouldUpdateUrl(false);
    }, [
        shouldUpdateUrl,
        router,
        searchQuery,
        currentPage,
        sortBy,
        priceRange,
        selectedBrands,
        selectedRating,
        selectedCategory,
        subcategoryFilters,
    ]);

    // Update document title when query changes
    useEffect(() => {
        document.title = `Kết quả tìm kiếm: "${searchQuery}" - B Store`;
    }, [searchQuery]);

    // Fetch search results when query, page, or any filters change
    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults();
        }
    }, [
        searchQuery,
        currentPage,
        selectedBrands,
        priceRange,
        selectedRating,
        sortBy,
        selectedCategory,
        subcategoryFilters,
    ]);

    // Update active filters when relevant state changes
    useEffect(() => {
        updateActiveFilters();
    }, [updateActiveFilters]);

    const fetchSearchResults = async () => {
        if (!searchQuery) return;

        setIsLoading(true);
        setError(null);
        try {
            const results = await searchProducts(
                searchQuery,
                currentPage,
                12,
                selectedBrands.length > 0 ? selectedBrands : undefined,
                priceRange[0] > 0 ? priceRange[0] : undefined,
                priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                selectedRating,
                selectedCategory,
                subcategoryFilters,
            );
            // Apply sorting if needed
            let finalProducts = [...results.products];
            if (sortBy !== "featured") {
                switch (sortBy) {
                    case "price-asc":
                        finalProducts.sort((a, b) => a.price - b.price);
                        break;
                    case "price-desc":
                        finalProducts.sort((a, b) => b.price - a.price);
                        break;
                    case "newest":
                        finalProducts.sort(
                            (a, b) =>
                                new Date(b.createdAt || 0).getTime() -
                                new Date(a.createdAt || 0).getTime(),
                        );
                        break;
                    case "rating":
                        finalProducts.sort((a, b) => b.rating - a.rating);
                        break;
                }
            }

            setProducts(finalProducts);
            setTotalResults(results.total);
            setTotalPages(results.pages);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setError("Failed to load search results. Please try again.");
            setProducts([]);
            setTotalResults(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFilter = (id: string) => {
        if (id === "search-query") {
            // Redirect to products page if removing the search query filter
            window.location.href = "/products";
        } else if (id.startsWith("category-")) {
            setSelectedCategory(null);
            setShouldUpdateUrl(true);
        } else if (id.startsWith("brand-")) {
            const brandName = id.replace("brand-", "");
            setSelectedBrands((prev) =>
                prev.filter((brand) => brand !== brandName),
            );
            setShouldUpdateUrl(true);
        } else if (id.startsWith("subcategory-")) {
            // Handle removing subcategory filters
            const parts = id.split("-");
            if (parts.length >= 3) {
                const key = parts[1];
                const value = parts.slice(2).join("-"); // Handle values that might contain hyphens

                setSubcategoryFilters((prev) => {
                    if (!prev || !prev[key]) return prev;

                    const newValues = prev[key].filter((v) => v !== value);
                    const newFilters = { ...prev };

                    if (newValues.length === 0) {
                        delete newFilters[key];
                    } else {
                        newFilters[key] = newValues;
                    }

                    return Object.keys(newFilters).length === 0
                        ? undefined
                        : newFilters;
                });

                setShouldUpdateUrl(true);
            }
        } else if (id === "price-range") {
            setPriceRange([0, 100_000_000]);
            setShouldUpdateUrl(true);
        } else if (id === "rating-filter") {
            setSelectedRating(undefined);
            setShouldUpdateUrl(true);
        }
    };

    const resetAllFilters = () => {
        // Keep search query but reset all other filters
        setSelectedCategory(null);
        setSelectedBrands([]);
        setPriceRange([0, 100_000_000]);
        setSelectedRating(undefined);
        setSubcategoryFilters(undefined);
        setSortBy("featured");
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    const handleCategorySelect = (category: string) => {
        if (category === selectedCategory) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
        setCurrentPage(1);
        setSubcategoryFilters(undefined);
        setShouldUpdateUrl(true);
    };

    const handleBrandSelect = (brands: string[]) => {
        setSelectedBrands(brands);
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    const handlePriceChange = (minPrice: number, maxPrice: number) => {
        setPriceRange([minPrice, maxPrice]);
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    const handleRatingChange = (rating?: number) => {
        setSelectedRating(rating);
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    const handleSort = (sortOption: string) => {
        setSortBy(sortOption);
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setShouldUpdateUrl(true);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 pt-10 pb-10 px-4 md:px-6 bg-white text-gray-800">
            {/* Left Column - Filters - with fixed width */}
            <div className="w-full md:w-[280px] flex-shrink-0">
                <div className="flex flex-col gap-4">
                    <CategoryFilter
                        onCategorySelect={handleCategorySelect}
                        selectedCategory={selectedCategory}
                    />
                    <div className="h-px bg-gray-200 w-full" />
                    <PriceFilter
                        onPriceChange={handlePriceChange}
                        initialMinPrice={priceRange[0]}
                        initialMaxPrice={priceRange[1]}
                    />
                    <div className="h-px bg-gray-200 w-full" />
                    <BrandFilter
                        onBrandSelect={handleBrandSelect}
                        selectedBrands={selectedBrands}
                    />
                    <div className="h-px bg-gray-200 w-full" />
                    <RatingFilter
                        onRatingChange={handleRatingChange}
                        selectedRating={selectedRating}
                    />
                </div>
            </div>

            {/* Right Column - Products - flexible width */}
            <div className="flex-1 min-w-0 drop-shadow-lg rounded-lg bg-white p-4 border border-gray-200">
                {/* Search and Sort */}
                <SearchSort
                    initialQuery={searchQuery}
                    products={products}
                    onSort={handleSort}
                />

                {/* Active Filters */}
                <div className="mt-6">
                    <FilterBar
                        activeFilters={activeFilters}
                        resultCount={totalResults}
                        onRemoveFilter={handleRemoveFilter}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        {error}
                    </div>
                )}

                {/* Product Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 mt-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 mt-6">
                        <div className="text-lg text-gray-500">
                            Không tìm thấy sản phẩm phù hợp
                        </div>
                        <button
                            className="mt-4 text-primary hover:underline"
                            onClick={resetAllFilters}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="mt-6">
                        <ProductGrid
                            products={products}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsContent;
