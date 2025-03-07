import React, { useState } from "react";
import FilterItem from "./FilterItem";

const brands = [
  { id: "intel", name: "Intel" },
  { id: "amd", name: "AMD" },
  { id: "microsoft", name: "Microsoft" },
  { id: "samsung", name: "Samsung" },
  { id: "dell", name: "Dell" },
  { id: "hp", name: "HP" },
  { id: "acer", name: "Acer" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "sony", name: "Sony" },
  { id: "asus", name: "Asus" },
  { id: "lg", name: "LG" },
  { id: "kingston", name: "Kingston" },
  { id: "crucial", name: "Crucial" },
];

const BrandFilter: React.FC = () => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([
    "intel", "amd", "microsoft", "hp", "asus", "lg"
  ]);

  const toggleBrand = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  // Split brands into two equal columns
  const midPoint = Math.ceil(brands.length / 2);
  const leftBrands = brands.slice(0, midPoint);
  const rightBrands = brands.slice(midPoint);

  return (
    <div className="flex flex-col gap-4">
      <div className="font-medium text-gray-900 text-base">
        THƯƠNG HIỆU
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          {leftBrands.map(brand => (
            <div key={brand.id} className="flex items-start gap-2">
              <FilterItem
                className={selectedBrands.includes(brand.id) ? "bg-primary-500" : ""}
                checked={selectedBrands.includes(brand.id)}
                type="checkbox"
                onChange={() => toggleBrand(brand.id)}
              />
              <div className="text-sm font-normal text-gray-700 leading-5">
                {brand.name}
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col gap-3">
          {rightBrands.map(brand => (
            <div key={brand.id} className="flex items-start gap-2">
              <FilterItem
                className={selectedBrands.includes(brand.id) ? "bg-primary-500" : ""}
                checked={selectedBrands.includes(brand.id)}
                type="checkbox"
                onChange={() => toggleBrand(brand.id)}
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
