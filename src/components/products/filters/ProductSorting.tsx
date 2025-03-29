import React from "react";

interface ProductSortingProps {
    selectedOption: string;
    onChange: (option: string) => void;
}

const ProductSorting: React.FC<ProductSortingProps> = ({
    selectedOption,
    onChange,
}) => {
    return (
        <div className="flex items-center">
            <span className="text-gray-600 mr-2">Sort by:</span>
            <select
                value={selectedOption}
                onChange={(e) => onChange(e.target.value)}
                className="border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm p-2"
            >
                <option value="popular">Popularity</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Discount</option>
            </select>
        </div>
    );
};

export default ProductSorting;
