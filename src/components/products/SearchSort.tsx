import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SearchSortProps {
    initialQuery?: string;
    products?: any[];
    onFilteredProductsChange?: (filteredProducts: any[]) => void;
    onSort?: (sortOption: string) => void;
    isGlobalSearch?: boolean; // To differentiate between global search and local search
}

const SearchSort: React.FC<SearchSortProps> = ({
    initialQuery = "",
    products = [],
    onFilteredProductsChange,
    onSort,
    isGlobalSearch = false,
}) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [sortOption, setSortOption] = useState("relevance");

    // If initialQuery changes (from parent component), update searchTerm state
    useEffect(() => {
        setSearchTerm(initialQuery);
    }, [initialQuery]);

    // When search term or sort option changes, filter products locally
    useEffect(() => {
        // Only perform local filtering if not in global search mode and we have products
        if (
            !isGlobalSearch &&
            products.length > 0 &&
            onFilteredProductsChange
        ) {
            let filtered = [...products];

            // Filter by search term if provided
            if (searchTerm.trim()) {
                filtered = filtered.filter((product) =>
                    product.name
                        .toLowerCase()
                        .includes(searchTerm.trim().toLowerCase()),
                );
            }

            // Sort the filtered products
            sortProducts(filtered, sortOption);

            // Send filtered products back to parent
            onFilteredProductsChange(filtered);
        }
    }, [searchTerm, sortOption, products, isGlobalSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // If this is a global search (header search), navigate to search page
        if (isGlobalSearch && searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }

        // For local search, the useEffect above will handle filtering
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortOption = e.target.value;
        setSortOption(newSortOption);

        // If parent provided a sort handler, call it
        if (onSort) {
            onSort(newSortOption);
        }
    };

    // Helper to sort products based on the selected option
    const sortProducts = (productList: any[], option: string): any[] => {
        switch (option) {
            case "price-asc":
                return productList.sort((a, b) => a.price - b.price);
            case "price-desc":
                return productList.sort((a, b) => b.price - a.price);
            case "rating":
                return productList.sort((a, b) => b.rating - a.rating);
            case "newest":
                // Assuming products have a createdAt or date field
                return productList.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime(),
                );
            default: // relevance or any other option
                return productList; // Keep original order
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between text-gray-700">
            <form
                onSubmit={handleSearch}
                className="relative flex-grow max-w-md"
            >
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-primary"
                >
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </form>

            {!isGlobalSearch && (
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-700">
                        Sắp xếp theo:
                    </label>
                    <select
                        id="sort"
                        value={sortOption}
                        onChange={handleSortChange}
                        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    >
                        <option value="relevance">Phù hợp nhất</option>
                        <option value="price-asc">Giá thấp đến cao</option>
                        <option value="price-desc">Giá cao đến thấp</option>
                        <option value="newest">Mới nhất</option>
                        <option value="rating">Đánh giá cao nhất</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default SearchSort;
