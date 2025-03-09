"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import PriceFilter from "@/components/shop/filters/PriceFilter";
import BrandFilter from "@/components/shop/filters/BrandFilter";
import ProductGrid from "@/components/shop/product/ProductGrid";
import FilterBar from "@/components/shop/FilterBar";
import SearchSort from "@/components/shop/SearchSort";
import Pagination from "@/components/shop/Pagination";

// Define product type
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    stock: string;
    brand: string;
}

// Fetch products by category from API
const fetchProductsByCategory = async (
    category: string,
    page: number = 1,
    limit: number = 12,
    sortBy?: string,
    minPrice?: number,
    maxPrice?: number,
    brands?: string[],
    rating?: number
): Promise<{products: Product[], total: number, pages: number}> => {
    try {
        let url = `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/products?category=${category}&page=${page}&limit=${limit}`;

        // Add optional query parameters
        if (sortBy) url += `&sortBy=${sortBy}`;
        if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
        if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
        if (brands && brands.length > 0) url += `&brands=${brands.join(',')}`;
        if (rating !== undefined) url += `&minRating=${rating}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        return {
            products: data.products || data, // Handle both formats
            total: data.total || data.length || 0,
            pages: data.pages || Math.ceil((data.total || data.length || 0) / limit)
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [], total: 0, pages: 1 };
    }
};

const ProductsCategoryContent = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = params?.category as string;
    
    // Get query parameters
    const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const initialSortBy = searchParams.get("sortBy") || "featured";
    const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const initialBrands = searchParams.get("brands") ? searchParams.get("brands")!.split(',') : [];
    const initialRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;

    // State
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalResults, setTotalResults] = useState<number>(0);
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

    // Update active filters display - moved outside useEffect to avoid re-render cycles
    const updateActiveFilters = useCallback(() => {
        const filters: Array<{id: string, text: string}> = [];
        
        // Category is always active (it's in the URL path)
        filters.push({ 
            id: `category-${category}`, 
            text: `Danh mục: ${getCategoryName(category)}` 
        });
        
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
    }, [category, selectedBrands, priceRange, selectedRating    ]);

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
        
        const query = params.toString();
        router.push(`/products/${category}${query ? `?${query}` : ''}`);
        
        // Reset the flag after updating URL
        setShouldUpdateUrl(false);
    }, [shouldUpdateUrl, router, category, currentPage, sortBy, priceRange, selectedBrands, selectedRating]);

    // Load products when parameters change
    useEffect(() => {
        document.title = `B Store - ${getCategoryName(category)}`;
        loadProducts();
        // Don't include loadProducts in the dependency array to avoid loops
    }, [category, currentPage, sortBy, priceRange, selectedBrands, selectedRating]);

    // Update active filters when relevant state changes
    useEffect(() => {
        updateActiveFilters();
    }, [updateActiveFilters]);

    // Load products from API - don't update URL here to avoid loops
    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchProductsByCategory(
                category,
                currentPage,
                12,
                sortBy,
                priceRange[0] > 0 ? priceRange[0] : undefined,
                priceRange[1] < 100_000_000 ? priceRange[1] : undefined,
                selectedBrands.length > 0 ? selectedBrands : undefined,
                selectedRating
            );
            
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
            setLoading(false);
        }
    };

    // Handle category change
    const handleCategorySelect = (newCategory: string) => {
        router.push(`/products/${newCategory}`);
    };

    // Handle brand selection - set flag to update URL
    const handleBrandSelect = (brands: string[]) => {
        setSelectedBrands(brands);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    // Handle price change - set flag to update URL
    const handlePriceChange = (minPrice: number, maxPrice: number) => {
        setPriceRange([minPrice, maxPrice]);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    // Handle rating change - set flag to update URL
    const handleRatingChange = (rating?: number) => {
        setSelectedRating(rating);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    // Handle sort change - set flag to update URL
    const handleSort = (sortOption: string) => {
        setSortBy(sortOption);
        setCurrentPage(1); // Reset to first page
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    // Handle page change - set flag to update URL
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setShouldUpdateUrl(true); // Set flag to update URL
    };

    // Handle filtered products change (from search) - don't update URL
    const handleFilteredProductsChange = (newFilteredProducts: any[]) => {
        // This won't cause loops because it's not triggering further renders
        setFilteredProducts(newFilteredProducts);
    };

    // Handle removing a filter - set flag to update URL
    const handleRemoveFilter = (id: string) => {
        if (id.startsWith('brand-')) {
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

    // Reset all filters - set flag to update URL
    const resetAllFilters = () => {
        setSelectedBrands([]);
        setPriceRange([0, 100_000_000]);
        setSelectedRating(undefined);
        setSortBy('featured');
        setCurrentPage(1);
        setShouldUpdateUrl(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10 text-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <span className="hover:text-primary cursor-pointer">Trang chủ</span> /{" "}
                    <span className="hover:text-primary cursor-pointer">Sản phẩm</span> /{" "}
                    <span className="font-medium text-gray-900">{getCategoryName(category)}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-[280px] flex-shrink-0">
                        <div className="flex flex-col gap-4">
                            {/* Category Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <CategoryFilter 
                                    onCategorySelect={handleCategorySelect} 
                                    selectedCategory={category}
                                />
                            </div>

                            <div className="h-px bg-gray-200 w-full" />

                            {/* Price Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <PriceFilter 
                                    onPriceChange={handlePriceChange}
                                    initialMinPrice={priceRange[0]}
                                    initialMaxPrice={priceRange[1]}
                                />
                            </div>

                            <div className="h-px bg-gray-200 w-full" />

                            {/* Brand Filter */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <BrandFilter 
                                    onBrandSelect={handleBrandSelect}
                                    selectedBrands={selectedBrands}
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
                        {loading ? (
                            <div className="flex justify-center items-center h-64 bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-lg">Đang tải sản phẩm...</div>
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
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <ProductGrid 
                                    products={filteredProducts} 
                                    isLoading={loading} 
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

export default ProductsCategoryContent;
