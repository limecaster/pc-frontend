"use client";

import React, { useEffect, useState } from "react";
import SearchSort from "@/components/shop/SearchSort";
import FilterBar from "@/components/shop/FilterBar";
import ProductGrid from "@/components/shop/product/ProductGrid";
import Pagination from "@/components/shop/Pagination";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import PriceFilter from "@/components/shop/filters/PriceFilter";
import BrandFilter from "@/components/shop/filters/BrandFilter";
import RatingFilter from "@/components/shop/filters/RatingFilter";

const ShopPage: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Cửa hàng";
    }, []);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState([
        { id: "category-monitor", text: "Màn hình máy tính" },
        { id: "rating-5star", text: "Đánh giá 5 sao" },
    ]);

    const handleRemoveFilter = (id: string) => {
        setActiveFilters(activeFilters.filter((filter) => filter.id !== id));
    };
    return (
        <div className="flex flex-col md:flex-row gap-6 pt-10 pb-10 px-4 md:px-6 bg-white">
            {/* Left Column - Filters - with fixed width */}
            <div className="w-full md:w-[280px] flex-shrink-0">
                <div className="flex flex-col gap-4">
                    <CategoryFilter />

                    <div className="h-px bg-gray-200 w-full" />

                    <PriceFilter />

                    <div className="h-px bg-gray-200 w-full" />

                    <BrandFilter />

                    <div className="h-px bg-gray-200 w-full" />

                    <RatingFilter />
                </div>
            </div>

            {/* Right Column - Products - flexible width */}
            <div className="flex-1 min-w-0 drop-shadow-lg rounded-lg bg-white p-4">
                {/* Search and Sort */}
                <SearchSort />

                {/* Active Filters */}
                <div className="mt-6">
                    <FilterBar
                        activeFilters={activeFilters}
                        resultCount={65867}
                        onRemoveFilter={handleRemoveFilter}
                    />
                </div>

                {/* Product Grid */}
                <div className="mt-6">
                    <ProductGrid />
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={10}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
