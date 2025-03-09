import React, { useState, useEffect } from "react";
import FilterItem from "./FilterItem";

interface BrandFilterProps {
    onBrandSelect?: (brands: string[]) => void;
    selectedBrands?: string[];
}

// Hardcoded list of popular brands
const POPULAR_BRANDS = [
    { id: "intel", name: "Intel" },
    { id: "amd", name: "AMD" },
    { id: "nvidia", name: "NVIDIA" },
    { id: "asus", name: "Asus" },
    { id: "gigabyte", name: "Gigabyte" },
    { id: "msi", name: "MSI" },
    { id: "corsair", name: "Corsair" },
    { id: "kingston", name: "Kingston" },
    { id: "samsung", name: "Samsung" },
    { id: "western-digital", name: "Western Digital" },
    { id: "seagate", name: "Seagate" },
    { id: "cooler-master", name: "Cooler Master" },
    { id: "logitech", name: "Logitech" },
    { id: "hyperx", name: "HyperX" },
    { id: "crucial", name: "Crucial" },
    { id: "asrock", name: "ASRock" },
];

const BrandFilter: React.FC<BrandFilterProps> = ({
    onBrandSelect,
    selectedBrands: propSelectedBrands,
}) => {
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        propSelectedBrands || [],
    );

    // Update internal state when prop changes
    useEffect(() => {
        if (propSelectedBrands) {
            setSelectedBrands(propSelectedBrands);
        }
    }, [propSelectedBrands]);

    const toggleBrand = (brandName: string) => {
        let newSelectedBrands: string[];

        if (selectedBrands.includes(brandName)) {
            newSelectedBrands = selectedBrands.filter(
                (brand) => brand !== brandName,
            );
        } else {
            newSelectedBrands = [...selectedBrands, brandName];
        }

        setSelectedBrands(newSelectedBrands);

        if (onBrandSelect) {
            onBrandSelect(newSelectedBrands);
        }
    };

    // Split brands into two equal columns
    const midPoint = Math.ceil(POPULAR_BRANDS.length / 2);
    const leftBrands = POPULAR_BRANDS.slice(0, midPoint);
    const rightBrands = POPULAR_BRANDS.slice(midPoint);

    return (
        <div className="flex flex-col gap-4">
            <div className="font-medium text-gray-900 text-base">
                THƯƠNG HIỆU PHỔ BIẾN
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {/* Left Column */}
                <div className="flex flex-col gap-3">
                    {leftBrands.map((brand) => (
                        <div key={brand.id} className="flex items-start gap-2">
                            <FilterItem
                                className={
                                    selectedBrands.includes(brand.name)
                                        ? "bg-primary-500"
                                        : ""
                                }
                                checked={selectedBrands.includes(brand.name)}
                                type="checkbox"
                                onChange={() => toggleBrand(brand.name)}
                            />
                            <div className="text-sm font-normal text-gray-700 leading-5">
                                {brand.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-3">
                    {rightBrands.map((brand) => (
                        <div key={brand.id} className="flex items-start gap-2">
                            <FilterItem
                                className={
                                    selectedBrands.includes(brand.name)
                                        ? "bg-primary-500"
                                        : ""
                                }
                                checked={selectedBrands.includes(brand.name)}
                                type="checkbox"
                                onChange={() => toggleBrand(brand.name)}
                            />
                            <div className="text-sm font-normal text-gray-700 leading-5">
                                {brand.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandFilter;
