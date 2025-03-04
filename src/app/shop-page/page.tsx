"use client";

import React, { useState } from "react";
import SearchSort from "@/components/shop/SearchSort";
import FilterBar from "@/components/shop/FilterBar";
import ProductGrid from "@/components/shop/product/ProductGrid";
import Pagination from "@/components/shop/Pagination";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import PriceFilter from "@/components/shop/filters/PriceFilter";
import BrandFilter from "@/components/shop/filters/BrandFilter";
import RatingFilter from "@/components/shop/filters/RatingFilter";

const ShopPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState([
    { id: "category-monitor", text: "Màn hình máy tính" },
    { id: "rating-5star", text: "Đánh giá 5 sao" },
  ]);

  const handleRemoveFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(filter => filter.id !== id));
  };

  return (
    <div className="inline-flex h-auto items-start gap-6 pt-10 pb-10 px-0 relative bg-white max-md:px-5 max-md:max-w-full max-md:py-2">
      {/* Left Column - Filters */}
      <div className="inline-flex flex-col items-start gap-6 relative flex-auto">
        <CategoryFilter />

        <img
          className="relative w-[312px] h-px object-cover"
          alt="Line"
          src="https://c.animaapp.com/OZxJqJj9/img/line-16.svg"
        />

        <PriceFilter />

        <img
          className="relative w-[312px] h-px object-cover"
          alt="Line"
          src="https://c.animaapp.com/OZxJqJj9/img/line-16.svg"
        />

        <BrandFilter />

        <img
          className="relative w-[312px] h-px object-cover"
          alt="Line"
          src="https://c.animaapp.com/OZxJqJj9/img/line-16.svg"
        />

        <RatingFilter />
      </div>

      {/* Right Column - Products */}
      <div className="relative w-[986px]">
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
