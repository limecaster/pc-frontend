import React, { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";

// Reuse the same product categories from Navigation
const productCategories = [
    {
        title: "Linh kiện PC",
        items: [
            {
                name: "CPU - Bộ vi xử lý",
                href: "/products/cpu",
                subcategories: [
                    { title: "Thương hiệu", items: ["Intel", "AMD"] },
                    {
                        title: "Kiến trúc",
                        items: [
                            "Intel Core i9",
                            "Intel Core i7",
                            "Intel Core i5",
                            "AMD Ryzen 9",
                            "AMD Ryzen 7",
                            "AMD Ryzen 5",
                        ],
                    },
                    {
                        title: "Thế hệ",
                        items: [
                            "Intel Gen 13",
                            "Intel Gen 12",
                            "AMD Zen 4",
                            "AMD Zen 3",
                        ],
                    },
                ],
            },
            {
                name: "Mainboard - Bo mạch chủ",
                href: "/products/mainboard",
                subcategories: [
                    {
                        title: "Thương hiệu",
                        items: ["Asus", "MSI", "Gigabyte", "ASRock"],
                    },
                    {
                        title: "Chipset",
                        items: [
                            "Intel Z790",
                            "Intel B760",
                            "AMD X670",
                            "AMD B650",
                        ],
                    },
                    {
                        title: "Kích thước",
                        items: ["ATX", "Micro-ATX", "Mini-ITX"],
                    },
                ],
            },
            {
                name: "RAM - Bộ nhớ trong",
                href: "/products/ram",
                subcategories: [
                    {
                        title: "Thương hiệu",
                        items: ["Corsair", "G.Skill", "Kingston", "Crucial"],
                    },
                    { title: "Thế hệ", items: ["DDR5", "DDR4", "DDR3"] },
                    {
                        title: "Dung lượng",
                        items: ["8GB", "16GB", "32GB", "64GB"],
                    },
                ],
            },
            {
                name: "VGA - Card màn hình",
                href: "/products/vga",
                subcategories: [
                    { title: "Thương hiệu", items: ["NVIDIA", "AMD", "Intel"] },
                    {
                        title: "Series",
                        items: [
                            "NVIDIA RTX 40",
                            "NVIDIA RTX 30",
                            "AMD RX 7000",
                            "AMD RX 6000",
                        ],
                    },
                    {
                        title: "Nhà sản xuất",
                        items: ["ASUS", "MSI", "Gigabyte", "EVGA"],
                    },
                ],
            },
            { name: "SSD - Ổ cứng thể rắn", href: "/products/ssd" },
            { name: "PSU - Nguồn máy tính", href: "/products/psu" },
            { name: "Case - Vỏ máy tính", href: "/products/case" },
        ],
    },
    {
        title: "Màn hình",
        items: [
            { name: "Màn hình Gaming", href: "/products/gaming-monitor" },
            { name: "Màn hình đồ họa", href: "/products/graphic-monitor" },
            { name: "Màn hình văn phòng", href: "/products/office-monitor" },
        ],
    },
    {
        title: "Laptop",
        items: [
            { name: "Laptop Gaming", href: "/products/gaming-laptop" },
            { name: "Laptop văn phòng", href: "/products/office-laptop" },
            { name: "Laptop đồ họa", href: "/products/design-laptop" },
        ],
    },
    {
        title: "Thiết bị ngoại vi",
        items: [
            { name: "Bàn phím", href: "/products/keyboard" },
            { name: "Chuột", href: "/products/mouse" },
            { name: "Tai nghe", href: "/products/headphone" },
            { name: "Webcam", href: "/products/webcam" },
        ],
    },
];

const SidebarMenu: React.FC = () => {
    const [expandedCategory, setExpandedCategory] = useState<number | null>(
        null,
    );

    const handleMouseEnter = (index: number) => {
        setExpandedCategory(index);
    };

    const handleMouseLeave = () => {
        setExpandedCategory(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-2 h-full">
            <h3 className="font-medium text-zinc-900 p-3 border-b mb-2">
                Danh mục sản phẩm
            </h3>

            <div className="space-y-1">
                {productCategories.map((category, idx) => (
                    <div
                        key={idx}
                        className="mb-2"
                        onMouseEnter={() => handleMouseEnter(idx)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="flex justify-between items-center w-full p-2 text-left font-medium text-zinc-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                            <span>{category.title}</span>
                            <ChevronRightIcon
                                className={`transition-transform ${expandedCategory === idx ? "rotate-90" : ""}`}
                            />
                        </div>

                        {expandedCategory === idx && (
                            <div className="ml-2 border-l-2 border-gray-200 pl-3">
                                {category.items.map((item, itemIdx) => (
                                    <Link
                                        key={itemIdx}
                                        href={item.href}
                                        className="block p-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SidebarMenu;
