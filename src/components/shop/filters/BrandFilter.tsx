import React, { useState } from "react";
import FilterItem from "./FilterItem";

const brands = [
    { id: "intel", name: "Intel", column: 1 },
    { id: "amd", name: "AMD", column: 2 },
    { id: "microsoft", name: "Microsoft", column: 1 },
    { id: "samsung", name: "Samsung", column: 2 },
    { id: "dell", name: "Dell", column: 1 },
    { id: "hp", name: "HP", column: 2 },
    { id: "acer", name: "Acer", column: 1 },
    { id: "xiaomi", name: "Xiaomi", column: 2 },
    { id: "sony", name: "Sony", column: 1 },
    { id: "asus", name: "Asus", column: 2 },
    { id: "lg", name: "LG", column: 1 },
    { id: "kingston", name: "Kingston", column: 2 },
    { id: "crucial", name: "Crucial", column: 1 },
];

const BrandFilter: React.FC = () => {
    const [selectedBrands, setSelectedBrands] = useState<string[]>([
        "intel",
        "amd",
        "microsoft",
        "hp",
        "asus",
        "lg",
    ]);

    const toggleBrand = (brandId: string) => {
        if (selectedBrands.includes(brandId)) {
            setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
        } else {
            setSelectedBrands([...selectedBrands, brandId]);
        }
    };

    // Organize brands into columns
    const column1Brands = brands.filter((brand) => brand.column === 1);
    const column2Brands = brands.filter((brand) => brand.column === 2);
    const maxRows = Math.max(column1Brands.length, column2Brands.length);

    return (
        <div className="relative flex-shrink-0 px-5 mx-1">
            <div className="relative w-[312px] mt-[-1.00px] font-medium text-gray-900 text-base tracking-[0] leading-6">
                THƯƠNG HIỆU
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {column1Brands[rowIndex] && (
                            <div className="grid grid-cols-[auto_1fr] items-center gap-1">
                                <FilterItem
                                    className={`!relative ${
                                        selectedBrands.includes(
                                            column1Brands[rowIndex].id,
                                        )
                                            ? "!bg-primary-500"
                                            : ""
                                    }`}
                                    checked={selectedBrands.includes(
                                        column1Brands[rowIndex].id,
                                    )}
                                    type="checkbox"
                                    onChange={() =>
                                        toggleBrand(column1Brands[rowIndex].id)
                                    }
                                />
                                <div className="relative w-[124px] mt-[-1.00px] font-normal text-gray-700 text-sm tracking-[0] leading-5">
                                    {column1Brands[rowIndex].name}
                                </div>
                            </div>
                        )}

                        {column2Brands[rowIndex] && (
                            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                                <FilterItem
                                    className={`!relative ${
                                        selectedBrands.includes(
                                            column2Brands[rowIndex].id,
                                        )
                                            ? "!bg-primary-500"
                                            : ""
                                    }`}
                                    checked={selectedBrands.includes(
                                        column2Brands[rowIndex].id,
                                    )}
                                    type="checkbox"
                                    onChange={() =>
                                        toggleBrand(column2Brands[rowIndex].id)
                                    }
                                />
                                <div className="relative w-[124px] mt-[-1.00px] font-normal text-gray-700 text-sm tracking-[0] leading-5">
                                    {column2Brands[rowIndex].name}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default BrandFilter;
