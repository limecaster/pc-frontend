import React, { useState, useEffect } from "react";
import FilterItem from "./FilterItem";
import { useRouter } from "next/navigation";

const categories = [
    { id: "monitor", name: "Màn hình máy tính" },
    { id: "cpu", name: "CPU - Bộ vi xử lí" },
    { id: "gpu", name: "GPU - Card đồ họa" },
    { id: "ram", name: "RAM" },
    { id: "hdd", name: "HDD" },
    { id: "ssd", name: "SSD" },
    { id: "speaker", name: "Loa máy tính" },
    { id: "keyboard", name: "Bàn phím" },
    { id: "mouse", name: "Chuột" },
    { id: "headphone", name: "Tai nghe" },
    { id: "case", name: "Vỏ case" },
    { id: "accessories", name: "Phụ kiện khác" },
];

interface CategoryFilterProps {
    paramCategory?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ paramCategory }) => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>(
        paramCategory || "monitor"
    );

    useEffect(() => {
        // Update selected category when paramCategory changes
        if (paramCategory) {
            setSelectedCategory(paramCategory);
        }
    }, [paramCategory]);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        
        // Navigate to the category page
        if (categoryId !== paramCategory) {
            router.push(`/products/${categoryId}`);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="font-medium text-gray-900 text-base">
                PHÂN LOẠI SẢN PHẨM
            </div>

            <div className="flex flex-col gap-3">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="flex items-start gap-2"
                    >
                        <FilterItem
                            className={selectedCategory === category.id ? "bg-primary-500" : ""}
                            checked={selectedCategory === category.id}
                            type="radio"
                            onChange={() => handleCategoryChange(category.id)}
                        />
                        <div
                            className={`text-sm leading-5 ${
                                selectedCategory === category.id
                                    ? "font-medium text-gray-900"
                                    : "font-normal text-gray-700"
                            }`}
                        >
                            {category.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
