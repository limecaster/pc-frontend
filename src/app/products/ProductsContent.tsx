"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import PriceFilter from "@/components/shop/filters/PriceFilter";
import BrandFilter from "@/components/shop/filters/BrandFilter";
import RatingFilter from "@/components/shop/filters/RatingFilter";
import ProductGrid from "@/components/shop/product/ProductGrid";
import FilterBar from "@/components/shop/FilterBar";
import SearchSort from "@/components/shop/SearchSort";
import Pagination from "@/components/shop/Pagination";
import { fetchProductsByCategory, fetchAllProducts } from "@/api/product";

const ProductsContent: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Get query parameters
    const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const initialSortBy = searchParams.get("sortBy") || "featured";
    const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const initialBrands = searchParams.get("brands") ? searchParams.get("brands")!.split(',') : [];
    const initialRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const initialCategory = searchParams.get("category") || null;

    // State
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
    const [sortBy, setSortBy] = useState<string>(initialSortBy);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        initialMinPrice || 0, 
        initialMaxPrice || 100_000_000
    ]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
    const [selectedRating, setSelectedRating] = useState<number | undefined>(initialRating);
    const [activeFilters, setActiveFilters] = useState<Array<{id: string, text: string}>>([]);
    const [error, setError] = useState<string | null>(null);
    
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
        const filters: Array<{id: string, text: string}> = [];
        
        // Add category filter if selected
        if (selectedCategory) {
            filters.push({ 
                id: `category-${selectedCategory}`, 
                text: `Danh mục: ${getCategoryName(selectedCategory)}` 
            });
        }
        
        // Add brand filters
        selectedBrands.forEach(brand => {
            filters.push({
                id: `brand-${brand}`,
                text: `Thương hiệu: ${brand}`
            });
        });
        
        // Add price filter
        if (priceRange[0] > 0 || priceRange[1] < 100_000_000) {
            const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
            filters.push({
                id: 'price-range',
                text: `Giá: ${formatter.format(priceRange[0])} - ${formatter.format(priceRange[1])}`
            });
        }
        
        // Add rating filter
        if (selectedRating !== undefined) {
            filters.push({
                id: 'rating-filter',
                text: `Đánh giá: Từ ${selectedRating} sao trở lên`
            });
        }
        
        setActiveFilters(filters);
    }, [selectedCategory, selectedBrands, priceRange, selectedRating]);

    // Update URL parameters - only called when shouldUpdateUrl is true
    useEffect(() => {
        if (!shouldUpdateUrl) return;

        const params = new URLSearchParams();
        
        if (currentPage > 1) params.set('page', currentPage.toString());
        if (sortBy !== 'featured') params.set('sortBy', sortBy);
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
        if (priceRange[1] < 100_000_000) params.set('maxPrice', priceRange[1].toString());
        if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
        if (selectedRating !== undefined) params.set('minRating', selectedRating.toString());
        if (selectedCategory) params.set('category', selectedCategory);
        
        const query = params.toString();
        router.push(`/products${query ? `?${query}` : ''}`);
        
        // Reset the flag after updating URL
        setShouldUpdateUrl(false);
    }, [shouldUpdateUrl, router, currentPage, sortBy, priceRange, selectedBrands, selectedRating, selectedCategory]);

    useEffect(() => {
        document.title = "B Store - Cửa hàng";
        loadProducts();
    }, [currentPage, selectedCategory, selectedBrands, priceRange, selectedRating, sortBy]);

    // Update active filters when relevant state changes
    useEffect(() => {
        updateActiveFilters();
    }, [updateActiveFilters]);

    const loadProducts = async () => {
        setIsLoading(true);
        setError(null); // Reset error state
        try {
            let response;
            
            if (selectedCategory) {
                // If category selected, fetch products for that category
                response = await fetchProductsByCategory(
                    selectedCategory, 
                    currentPage, 
                    12, 
                    selectedBrands.length > 0 ? selectedBrands : undefined,
                    priceRange[0] > 0 ? priceRange[0] : undefined,
                    priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                    selectedRating
                );
            } else {
                // If no category, fetch all products
                response = await fetchAllProducts(
                    currentPage, 
                    12, 
                    selectedBrands.length > 0 ? selectedBrands : undefined,
                    priceRange[0] > 0 ? priceRange[0] : undefined,
                    priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                    selectedRating
                );
            }
            
            // Apply sorting on the client side if needed
            if (sortBy !== 'featured') {
                const sortedProducts = [...response.products];
                switch (sortBy) {
                    case 'price-asc':
                        sortedProducts.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-desc':
                        sortedProducts.sort((a, b) => b.price - a.price);
                        break;
                    case 'newest':
                        sortedProducts.sort((a, b) => 
                            new Date(b.createdAt || 0).getTime() - 
                            new Date(a.createdAt || 0).getTime()
                        );
                        break;
                    case 'rating':
                        sortedProducts.sort((a, b) => b.rating - a.rating);
                        break;
                }
                response.products = sortedProducts;
            }
            setProducts(response.products);
            setFilteredProducts(response.products);
            setTotalResults(response.total);
            setTotalPages(response.pages);
        } catch (error) {
            console.error("Error loading products:", error);
            setError("Failed to load products. Please try again."); 
            setProducts([]);
            setFilteredProducts([]);
            setTotalResults(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategorySelect = (category: string) => {
        if (category === selectedCategory) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };
    
    const handleBrandSelect = (brands: string[]) => {
        setSelectedBrands(brands);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    const handlePriceChange = (minPrice: number, maxPrice: number) => {
        setPriceRange([minPrice, maxPrice]);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    const handleRatingChange = (rating?: number) => {
        setSelectedRating(rating);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    const handleFilteredProductsChange = (newFilteredProducts: any[]) => {
        setFilteredProducts(newFilteredProducts);
    };

    const handleSort = (sortOption: string) => {
        setSortBy(sortOption);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setShouldUpdateUrl(true); // Set flag to update URL
    };
    
    const handleRemoveFilter = (id: string) => {
        if (id.startsWith('category-')) {
            setSelectedCategory(null);
            setShouldUpdateUrl(true);
        } else if (id.startsWith('brand-')) {
            const brandName = id.replace('brand-', '');
            setSelectedBrands(prev => prev.filter(brand => brand !== brandName));
            setShouldUpdateUrl(true);
        } else if (id === 'price-range') {
            setPriceRange([0, 100_000_000]);
            setShouldUpdateUrl(true);
        } else if (id === 'rating-filter') {
            setSelectedRating(undefined);
            setShouldUpdateUrl(true);
        }
    };
    
    const resetAllFilters = () => {
        setSelectedCategory(null);
        setSelectedBrands([]);
        setPriceRange([0, 100_000_000]);
        setSelectedRating(undefined);
        setSortBy('featured');
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };
    
    return (
        <div className="bg-gray-50 min-h-screen pb-10 text-gray-900">
            <div className="container mx-auto py-2">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-[280px] flex-shrink-0">
                        <div className="flex flex-col gap-4">
                            {/* Category Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <CategoryFilter 
                                    onCategorySelect={handleCategorySelect} 
                                    selectedCategory={selectedCategory}
                                />
                            </div>

                            <div className="h-px bg-gray-300 w-full" />

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
                                onFilteredProductsChange={handleFilteredProductsChange}
                                onSort={handleSort}
                            />
                        </div>

                        {/* Active Filters */}
                        <div className="mt-4 mb-6">
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

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64 bg-white p-6 rounded-lg shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-64 bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-lg text-gray-500">Không tìm thấy sản phẩm phù hợp</div>
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
                                
                                {/* Pagination */}
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
};

export default ProductsContent;
