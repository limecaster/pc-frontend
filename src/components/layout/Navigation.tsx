import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Import assets
import frame from "@/assets/icon/others/Frame.svg";
import info from "@/assets/icon/others/Info.svg";
import mapPinLine from "@/assets/icon/others/MapPinLine.svg";
import caretDown from "@/assets/icon/others/CaretDown.svg";
import phone from "@/assets/icon/others/Phone.svg";
import phoneCall from "@/assets/icon/others/PhoneCall.svg";

// Enhanced product categories data with subcategories
const productCategories = [
    {
        title: "Linh kiện PC",
        items: [
            { 
                name: "CPU - Bộ vi xử lý", 
                href: "/products/cpu",
                subcategories: [
                    { title: "Thương hiệu", items: ["Intel", "AMD"] },
                    { title: "Kiến trúc", items: ["Intel Core i9", "Intel Core i7", "Intel Core i5", "AMD Ryzen 9", "AMD Ryzen 7", "AMD Ryzen 5"] },
                    { title: "Thế hệ", items: ["Intel Gen 13", "Intel Gen 12", "AMD Zen 4", "AMD Zen 3"] }
                ]
            },
            { 
                name: "Mainboard - Bo mạch chủ", 
                href: "/products/mainboard",
                subcategories: [
                    { title: "Thương hiệu", items: ["Asus", "MSI", "Gigabyte", "ASRock"] },
                    { title: "Chipset", items: ["Intel Z790", "Intel B760", "AMD X670", "AMD B650"] },
                    { title: "Kích thước", items: ["ATX", "Micro-ATX", "Mini-ITX"] }
                ]
            },
            { 
                name: "RAM - Bộ nhớ trong", 
                href: "/products/ram",
                subcategories: [
                    { title: "Thương hiệu", items: ["Corsair", "G.Skill", "Kingston", "Crucial"] },
                    { title: "Thế hệ", items: ["DDR5", "DDR4", "DDR3"] },
                    { title: "Dung lượng", items: ["8GB", "16GB", "32GB", "64GB"] }
                ]
            },
            { 
                name: "VGA - Card màn hình", 
                href: "/products/vga",
                subcategories: [
                    { title: "Thương hiệu", items: ["NVIDIA", "AMD", "Intel"] },
                    { title: "Series", items: ["NVIDIA RTX 40", "NVIDIA RTX 30", "AMD RX 7000", "AMD RX 6000"] },
                    { title: "Nhà sản xuất", items: ["ASUS", "MSI", "Gigabyte", "EVGA"] }
                ]
            },
            { name: "SSD - Ổ cứng thể rắn", href: "/products/ssd" },
            { name: "PSU - Nguồn máy tính", href: "/products/psu" },
            { name: "Case - Vỏ máy tính", href: "/products/case" },
        ]
    },
    {
        title: "Màn hình",
        items: [
            { name: "Màn hình Gaming", href: "/products/gaming-monitor" },
            { name: "Màn hình đồ họa", href: "/products/graphic-monitor" },
            { name: "Màn hình văn phòng", href: "/products/office-monitor" }
        ]
    },
    {
        title: "Laptop",
        items: [
            { name: "Laptop Gaming", href: "/products/gaming-laptop" },
            { name: "Laptop văn phòng", href: "/products/office-laptop" },
            { name: "Laptop đồ họa", href: "/products/design-laptop" },
        ]
    },
    {
        title: "Thiết bị ngoại vi",
        items: [
            { name: "Bàn phím", href: "/products/keyboard" },
            { name: "Chuột", href: "/products/mouse" },
            { name: "Tai nghe", href: "/products/headphone" },
            { name: "Webcam", href: "/products/webcam" },
        ]
    }
];

const Navigation: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
            setHoveredCategory(null);
            setHoveredItem(null);
        }, 300);
    };

    const handleCategoryMouseEnter = (idx: number) => {
        setHoveredCategory(idx);
        setHoveredItem(null);
    };

    const handleCategoryMouseLeave = () => {
        // We'll let the parent handleMouseLeave handle this
    };

    const handleItemMouseEnter = (itemIdx: number) => {
        setHoveredItem(itemIdx);
    };

    const handleItemMouseLeave = () => {
        setHoveredItem(null);
    };

    return (
        <nav className="flex flex-wrap gap-10 justify-between items-center px-20 py-4 w-full bg-white shadow-sm max-md:px-5 max-md:max-w-full max-md:flex-col">
            <div className="flex flex-wrap gap-6 justify-center items-center self-stretch my-auto text-sm leading-none text-gray-500 min-w-[240px] max-md:max-w-full">
                <div 
                    className="flex flex-col self-stretch px-0.5 my-auto font-medium text-zinc-900 w-[203px] relative" 
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button 
                        className="flex gap-2 justify-center items-center px-6 py-3.5 bg-gray-100 rounded-sm max-md:px-5"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className="self-stretch my-auto">
                            Danh mục sản phẩm
                        </span>
                        <Image
                            src={caretDown}
                            alt=""
                            className={`object-contain shrink-0 self-stretch my-auto w-3 aspect-square transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-[700px] bg-white shadow-lg rounded-md border border-gray-200">
                            <div className="grid grid-cols-4 gap-4 p-5">
                                {productCategories.map((category, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex flex-col space-y-2 relative"
                                        onMouseEnter={() => handleCategoryMouseEnter(idx)}
                                        onMouseLeave={handleCategoryMouseLeave}
                                    >
                                        <h3 className="font-medium text-zinc-900 pb-2 border-b">{category.title}</h3>
                                        <ul className="space-y-1.5">
                                            {category.items.map((item, itemIdx) => (
                                                <li key={itemIdx} 
                                                    className="relative group"
                                                    onMouseEnter={() => handleItemMouseEnter(itemIdx)}
                                                    onMouseLeave={handleItemMouseLeave}>
                                                    <Link 
                                                        href={item.href}
                                                        className="text-gray-600 hover:text-blue-600 hover:underline text-sm block py-1"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    
                                                    {/* Subcategories dropdown */}
                                                    {item.subcategories && hoveredCategory === idx && hoveredItem === itemIdx && (
                                                        <div className="absolute left-full top-0 z-50 ml-0 w-[500px] bg-white shadow-lg rounded-md border border-gray-200 p-5 opacity-100 transition-opacity duration-200 pointer-events-auto">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {item.subcategories.map((subcat, subcatIdx) => (
                                                                    <div key={subcatIdx} className="flex flex-col space-y-2">
                                                                        <h4 className="font-medium text-sm text-zinc-900 pb-1 border-b">{subcat.title}</h4>
                                                                        <ul className="space-y-1">
                                                                            {subcat.items.map((subItem, subItemIdx) => (
                                                                                <li key={subItemIdx}>
                                                                                    <Link
                                                                                        href={`${item.href}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                                                                                        className="text-gray-600 hover:text-blue-600 hover:underline text-xs block py-0.5"
                                                                                        onClick={() => setIsDropdownOpen(false)}
                                                                                    >
                                                                                        {subItem}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Link
                    href="/track-order" 
                    className="flex gap-1.5 items-center self-stretch my-auto"
                >
                    <Image
                        src={mapPinLine}
                        alt=""
                        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                    />
                    <span className="self-stretch my-auto">
                        Trạng thái đơn hàng
                    </span>
                </Link>
                <Link
                    href="/manual-build-pc"
                    className="flex gap-1 justify-between items-center self-stretch my-auto w-[143px]"
                >
                    <Image
                        src={frame}
                        alt=""
                        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                    />
                    <span className="self-stretch my-auto">
                        Xây dựng cấu hình
                    </span>
                </Link>
                <Link
                    href="/auto-build-pc"
                    className="flex gap-1.5 items-center self-stretch my-auto"
                >
                    <Image
                        src={phone}
                        alt=""
                        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                    />

                    <span className="self-stretch my-auto">
                        Đề xuất cấu hình
                    </span>
                </Link>
                <Link
                    href="/faq"
                    className="flex gap-1.5 items-center self-stretch my-auto"
                >
                    <Image
                        src={info}
                        alt=""
                        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                    />
                    <span className="self-stretch my-auto">Trợ giúp</span>
                </Link>
            </div>
            <div className="flex gap-2 justify-center items-center self-stretch my-auto text-lg leading-none text-zinc-900">
                <Image
                    src={phoneCall}
                    alt=""
                    className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                />
                <span className="self-stretch my-auto">1900 123 456</span>
            </div>
        </nav>
    );
};

export default Navigation;
