import React, { useState } from "react";
import FilterItem from "./FilterItem";

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

const CategoryFilter: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("monitor");

    return (
        <div className="grid grid-cols-1 gap-4 relative px-5 mx-1">
            <div className="relative w-80 mt-[-1px] font-medium text-gray-900 text-base tracking-normal leading-6">
                PHÂN LOẠI SẢN PHẨM
            </div>

            <div className="grid grid-cols-1 gap-3 relative">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="grid grid-cols-[auto_1fr] gap-2 relative"
                    >
                        <FilterItem
                            className={`relative ${
                                selectedCategory === category.id
                                    ? "bg-primary"
                                    : ""
                            }`}
                            checked={selectedCategory === category.id}
                            type="radio"
                            onChange={() => setSelectedCategory(category.id)}
                        />
                        <div
                            className={`relative w-72 mt-[-1px] text-sm tracking-normal leading-5 ${
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
