import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchSubcategoryValues } from "@/api/product";
import FilterItem from "./FilterItem";

const ProductFilters: React.FC<{ category: string }> = ({ category }) => {
    const searchParams = useSearchParams();
    const [subcategoryValues, setSubcategoryValues] = useState<
        Record<string, string[]>
    >({});
    const [loadingSubcategories, setLoadingSubcategories] = useState<
        Record<string, boolean>
    >({});
    const [activeFilters, setActiveFilters] = useState<
        Record<string, string[]>
    >({});

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!category || category === "all") return;

            // Determine which subcategories to fetch based on category
            const subcategoriesToFetch = getCategorySubcategories(category);

            for (const subcategory of subcategoriesToFetch) {
                setLoadingSubcategories((prev) => ({
                    ...prev,
                    [subcategory]: true,
                }));
                try {
                    const values = await fetchSubcategoryValues(
                        category,
                        subcategory,
                    );
                    setSubcategoryValues((prev) => ({
                        ...prev,
                        [subcategory]: values,
                    }));
                } catch (error) {
                    console.error(
                        `Error fetching ${subcategory} values for ${category}:`,
                        error,
                    );
                } finally {
                    setLoadingSubcategories((prev) => ({
                        ...prev,
                        [subcategory]: false,
                    }));
                }
            }
        };

        // Parse existing subcategory filters
        const subcategoriesParam = searchParams.get("subcategories");
        if (subcategoriesParam) {
            try {
                const parsedFilters = JSON.parse(
                    decodeURIComponent(subcategoriesParam),
                );
                setActiveFilters(parsedFilters);
            } catch (e) {
                console.error("Error parsing active filters:", e);
            }
        }

        fetchSubcategories();
    }, [category, searchParams]);

    const handleSubcategoryFilterChange = (
        key: string,
        value: string,
        isChecked: boolean,
    ) => {
        // Get current URL and parameters
        const url = new URL(window.location.href);
        let subcategoryFilters: Record<string, string[]> = {};

        // Parse existing subcategory filters if present
        const subcategoriesParam = url.searchParams.get("subcategories");
        if (subcategoriesParam) {
            try {
                subcategoryFilters = JSON.parse(
                    decodeURIComponent(subcategoriesParam),
                );
            } catch (e) {
                console.error("Error parsing subcategory filters:", e);
            }
        }

        // Update filter
        if (!subcategoryFilters[key]) {
            subcategoryFilters[key] = [];
        }

        if (isChecked) {
            // Add value if checked
            if (!subcategoryFilters[key].includes(value)) {
                subcategoryFilters[key].push(value);
            }
        } else {
            // Remove value if unchecked
            subcategoryFilters[key] = subcategoryFilters[key].filter(
                (v) => v !== value,
            );

            // Remove empty arrays
            if (subcategoryFilters[key].length === 0) {
                delete subcategoryFilters[key];
            }
        }

        // Update URL
        if (Object.keys(subcategoryFilters).length > 0) {
            url.searchParams.set(
                "subcategories",
                encodeURIComponent(JSON.stringify(subcategoryFilters)),
            );
        } else {
            url.searchParams.delete("subcategories");
        }

        // Reset to page 1 when filters change
        url.searchParams.set("page", "1");

        // Navigate to filtered URL
        window.location.href = url.toString();
    };

    // Helper function to check if a filter is active
    const isFilterActive = (key: string, value: string): boolean => {
        return activeFilters[key]?.includes(value) || false;
    };

    // Helper function to determine which subcategories to fetch based on category
    const getCategorySubcategories = (categoryName: string): string[] => {
        switch (categoryName) {
            case "CPU":
                return ["manufacturer", "socket", "series", "coreCount"];
            case "Motherboard":
                return ["manufacturer", "chipset", "socketCPU", "formFactor"];
            case "RAM":
                return ["manufacturer", "moduleSize", "speed", "casLatency"];
            case "GraphicsCard":
                return ["manufacturer", "chipset", "memory", "series"];
            case "InternalHardDrive":
                return ["manufacturer", "type", "capacity", "interface"];
            default:
                return ["manufacturer"];
        }
    };

    const renderSubcategorySection = (key: string, title: string) => {
        if (!subcategoryValues[key] || subcategoryValues[key].length === 0) {
            return null;
        }

        return (
            <div key={key} className="mb-6">
                <h3 className="font-medium text-lg mb-3">{title}</h3>
                {loadingSubcategories[key] ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                    <div className="space-y-2">
                        {subcategoryValues[key].map((value) => (
                            <div
                                key={value}
                                className="flex items-center gap-2"
                            >
                                <FilterItem
                                    type="checkbox"
                                    checked={isFilterActive(key, value)}
                                    onChange={() =>
                                        handleSubcategoryFilterChange(
                                            key,
                                            value,
                                            !isFilterActive(key, value),
                                        )
                                    }
                                />
                                <label className="text-sm cursor-pointer">
                                    {value}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Map subcategory keys to display titles
    const subcategoryTitles: Record<string, string> = {
        manufacturer: "Thương hiệu",
        socket: "Socket",
        socketCPU: "Socket CPU",
        chipset: "Chipset",
        series: "Series",
        moduleSize: "Dung lượng",
        memory: "Bộ nhớ",
        type: "Loại",
        capacity: "Dung lượng",
        coreCount: "Số nhân",
        speed: "Tốc độ",
        casLatency: "Độ trễ",
        interface: "Cổng kết nối",
        formFactor: "Kích thước",
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="font-bold text-xl mb-4">Bộ lọc</h2>

            {/* Render filter sections for each subcategory */}
            {Object.keys(subcategoryTitles)
                .filter((key) => subcategoryValues[key]?.length > 0)
                .map((key) =>
                    renderSubcategorySection(key, subcategoryTitles[key]),
                )}
        </div>
    );
};

export default ProductFilters;
