"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
    const query = searchParams.get("q") || "";

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [activeFilters, setActiveFilters] = useState<
        Array<{ id: string; text: string }>
    >([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        0, 100_000_000,
    ]);
    const [selectedRating, setSelectedRating] = useState<number | undefined>(
        undefined,
    );
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    // Reference to track if we should skip the next fetch due to query change
    const skipNextFetch = React.useRef(false);

    // Handle initialization, title and active filters when query changes
    useEffect(() => {
        document.title = `Kết quả tìm kiếm: "${query}" - B Store`;

        // Add search query as an active filter
        if (query) {
            setActiveFilters([
                { id: "search-query", text: `Tìm kiếm: ${query}` },
            ]);

            // Flag to avoid double fetching - the page change will trigger its own fetch
            skipNextFetch.current = true;
            setCurrentPage(1);
        }
    }, [query]);

    // Handle page initialization - only fetch once on mount or when query changes
    useEffect(() => {
        if (query && currentPage === 1) {
            // If this is from a query change, we need to avoid double fetching
            if (skipNextFetch.current) {
                skipNextFetch.current = false;
            } else {
                fetchSearchResults(1);
            }
        }
    }, [query]); // Only depends on query

    // Handle search parameter changes (excluding initial load)
    useEffect(() => {
        // Only fetch if this isn't the initial page load
        if (query && !skipNextFetch.current) {
            fetchSearchResults(currentPage);
        }
    }, [currentPage, selectedBrands, priceRange, selectedRating]); // Does NOT depend on query or products

    // Update filtered products when main products change
    useEffect(() => {
        if (products.length > 0) {
            setFilteredProducts(products);
        }
    }, [products]);

    const fetchSearchResults = async (page: number) => {
        if (!query) return;

        setIsLoading(true);
        setError(null);
        try {
            const results = await searchProducts(
                query,
                page,
                12,
                selectedBrands.length > 0 ? selectedBrands : undefined,
                priceRange[0] > 0 ? priceRange[0] : undefined,
                priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                selectedRating,
            );
            setProducts(results.products);
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
        } else if (id.startsWith("brand-")) {
            const brandName = id.replace("brand-", "");
            setSelectedBrands((prev) =>
                prev.filter((brand) => brand !== brandName),
            );
        } else if (id === "price-range") {
            setPriceRange([0, 100_000_000]);
        } else if (id === "rating-filter") {
            setSelectedRating(undefined);
        } else {
            setActiveFilters(
                activeFilters.filter((filter) => filter.id !== id),
            );
        }
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        // You might want to implement category filtering for search results here
    };

    const handleBrandSelect = (brands: string[]) => {
        setSelectedBrands(brands);

        // Update active filters for brands
        const currentFilters = activeFilters.filter(
            (filter) => !filter.id.startsWith("brand-"),
        );
        const brandFilters = brands.map((brand) => ({
            id: `brand-${brand}`,
            text: `Thương hiệu: ${brand}`,
        }));

        setActiveFilters([...currentFilters, ...brandFilters]);
    };

    const handlePriceChange = (minPrice: number, maxPrice: number) => {
        setPriceRange([minPrice, maxPrice]);
        setCurrentPage(1); // Reset to first page when changing price

        // Update active filters
        updatePriceFilter(minPrice, maxPrice);
    };

    const updatePriceFilter = (min: number, max: number) => {
        // Remove existing price filters
        const currentFilters = activeFilters.filter(
            (filter) => filter.id !== "price-range",
        );

        // Only add price filter if it's not the default range
        if (min > 0 || max < 100_000_000) {
            const formatter = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            });
            const filterText = `Giá: ${formatter.format(min)} - ${formatter.format(max)}`;

            setActiveFilters([
                ...currentFilters,
                { id: "price-range", text: filterText },
            ]);
        } else {
            setActiveFilters(currentFilters);
        }
    };

    const updateRatingFilter = (rating?: number) => {
        // Remove existing rating filters
        const currentFilters = activeFilters.filter(
            (filter) => filter.id !== "rating-filter",
        );

        // Add new rating filter if defined
        if (rating !== undefined) {
            setActiveFilters([
                ...currentFilters,
                {
                    id: "rating-filter",
                    text: `Đánh giá: Từ ${rating} sao trở lên`,
                },
            ]);
        } else {
            setActiveFilters(currentFilters);
        }
    };

    const handleRatingChange = (rating?: number) => {
        setSelectedRating(rating);
        setCurrentPage(1);
        updateRatingFilter(rating);
    };

    const handleFilteredProductsChange = (newFilteredProducts: any[]) => {
        setFilteredProducts(newFilteredProducts);
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
            <div className="flex-1 min-w-0 drop-shadow-lg rounded-lg bg-white p-4">
                {/* Search and Sort - Set isGlobalSearch to false for local filtering */}
                <SearchSort
                    initialQuery={query}
                    products={products}
                    onFilteredProductsChange={handleFilteredProductsChange}
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

                {/* Product Grid - Use filteredProducts */}
                <div className="mt-6">
                    <ProductGrid
                        products={filteredProducts}
                        isLoading={isLoading}
                    />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsContent;
