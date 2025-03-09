import React, { useState, useEffect } from "react";
import FilterItem from "./FilterItem"; // Import FilterItem component

interface CategoryFilterProps {
    onCategorySelect?: (category: string) => void;
    selectedCategory?: string | null;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    onCategorySelect,
    selectedCategory: propSelectedCategory,
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(
        "components",
    );
    const [selectedSubCategory, setSelectedSubCategory] = useState<
        string | null
    >(propSelectedCategory ?? null);

    // Update internal state when prop changes
    useEffect(() => {
        setSelectedSubCategory(propSelectedCategory ?? null);
    }, [propSelectedCategory]);

    const categories = [
        {
            id: "components",
            name: "Linh kiện máy tính",
            subCategories: [
                { id: "CPU", name: "CPU" },
                { id: "Motherboard", name: "Motherboard" },
                { id: "RAM", name: "RAM" },
                { id: "GraphicsCard", name: "Card đồ họa" },
                { id: "InternalHardDrive", name: "Ổ cứng" },
                { id: "Case", name: "Case" },
                { id: "PowerSupply", name: "Nguồn" },
                { id: "CPUCooler", name: "Tản nhiệt" },
            ],
        },
        {
            id: "peripherals",
            name: "Phụ kiện máy tính",
            subCategories: [
                { id: "Speaker", name: "Loa máy tính" },
                { id: "Keyboard", name: "Bàn phím" },
                { id: "Mouse", name: "Chuột" },
                { id: "Monitor", name: "Màn hình" },
                { id: "ThermalPaste", name: "Keo tản nhiệt" },
                { id: "WiFiCard", name: "Card wifi" },
                { id: "WiredNetworkCard", name: "Card mạng có dây" },
            ],
        },
    ];

    const handleCategoryClick = (categoryId: string) => {
        setExpandedCategory(
            expandedCategory === categoryId ? null : categoryId,
        );
    };

    const handleSubCategoryClick = (subCategoryId: string) => {
        setSelectedSubCategory(subCategoryId);

        if (onCategorySelect) {
            onCategorySelect(subCategoryId);
        }
    };

    // Function to find which parent category contains a subcategory
    const findParentCategory = (
        subCategoryId: string | null,
    ): string | null => {
        if (!subCategoryId) return null;

        for (const category of categories) {
            if (
                category.subCategories.some((sub) => sub.id === subCategoryId)
            ) {
                return category.id;
            }
        }
        return null;
    };

    // Auto-expand the category that contains the selected subcategory
    useEffect(() => {
        const parentCategoryId = findParentCategory(selectedSubCategory);
        if (parentCategoryId && expandedCategory !== parentCategoryId) {
            setExpandedCategory(parentCategoryId);
        }
    }, [selectedSubCategory]);

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">DANH MỤC SẢN PHẨM</h3>
            <div className="space-y-2">
                {categories.map((category) => (
                    <div key={category.id} className="text-sm">
                        <div
                            className="flex items-center justify-between cursor-pointer hover:text-primary"
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <span className="text-base font-medium">
                                {category.name}
                            </span>
                            <span className="text-base">
                                {expandedCategory === category.id ? "-" : "+"}
                            </span>
                        </div>

                        {expandedCategory === category.id && (
                            <div className="ml-4 mt-2 space-y-1">
                                {category.subCategories.map((subCategory) => (
                                    <div
                                        key={subCategory.id}
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                                        onClick={() =>
                                            handleSubCategoryClick(
                                                subCategory.id,
                                            )
                                        }
                                    >
                                        {/* Use FilterItem instead of custom radio button */}
                                        <FilterItem
                                            type="radio"
                                            checked={
                                                selectedSubCategory ===
                                                subCategory.id
                                            }
                                            onChange={() =>
                                                handleSubCategoryClick(
                                                    subCategory.id,
                                                )
                                            }
                                        />
                                        <span
                                            className={
                                                selectedSubCategory ===
                                                subCategory.id
                                                    ? "font-medium text-primary"
                                                    : ""
                                            }
                                        >
                                            {subCategory.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
