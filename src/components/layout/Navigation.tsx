"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchSubcategoryValues, generateCategoryUrl } from "@/api/product";

// Import assets
import frame from "@/assets/icon/others/Frame.svg";
import info from "@/assets/icon/others/Info.svg";
import mapPinLine from "@/assets/icon/others/MapPinLine.svg";
import caretDown from "@/assets/icon/others/CaretDown.svg";
import phone from "@/assets/icon/others/Phone.svg";
import phoneCall from "@/assets/icon/others/PhoneCall.svg";

// Define types for the category structure
interface SubcategoryType {
    title: string;
    key: string;
}

interface CategoryItemType {
    name: string;
    href: string;
    subcategories?: SubcategoryType[];
}

interface CategoryType {
    title: string;
    items: CategoryItemType[];
}

// Product categories base data (only most popular subcategories shown)
const productCategories: CategoryType[] = [
    {
        title: "Linh kiện PC",
        items: [
            {
                name: "CPU - Bộ vi xử lý",
                href: "/products?category=CPU",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Socket", key: "socket" },
                    { title: "Series", key: "series" },
                    { title: "Số lõi", key: "coreCount" },
                    { title: "Vi kiến trúc", key: "microarchitecture" },
                ],
            },
            {
                name: "Mainboard - Bo mạch chủ",
                href: "/products?category=Motherboard",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Chipset", key: "chipset" },
                    { title: "Socket", key: "socketCPU" },
                    { title: "Kích thước", key: "formFactor" },
                    { title: "Loại RAM", key: "memoryType" },
                    { title: "Số khe RAM", key: "memorySlots" },
                ],
            },
            {
                name: "RAM - Bộ nhớ trong",
                href: "/products?category=RAM",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Dung lượng", key: "moduleSize" },
                    { title: "Bus", key: "speed" },
                ],
            },
            {
                name: "VGA - Card màn hình",
                href: "/products?category=GraphicsCard",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Chipset", key: "chipset" },
                    { title: "VRAM", key: "memory" },
                    { title: "Số quạt tản nhiệt", key: "cooling" },
                    { title: "TDP", key: "tdp" },
                ],
            },
            {
                name: "Ổ cứng",
                href: "/products?category=InternalHardDrive",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Loại", key: "type" },
                    { title: "Dung lượng", key: "capacity" },
                ],
            },
            {
                name: "PSU - Nguồn máy tính",
                href: "/products?category=PowerSupply",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Công suất", key: "wattage" },
                    { title: "80 Plus", key: "efficiencyRating" },
                ],
            },
            {
                name: "Case - Vỏ máy tính",
                href: "/products?category=Case",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Kích thước", key: "type" },
                ],
            },
        ],
    },
    {
        title: "Phụ kiện máy tính",
        items: [
            { name: "Màn hình", href: "/products?category=Monitor" },
            { name: "Bàn phím", href: "/products?category=Keyboard" },
            { name: "Chuột", href: "/products?category=Mouse" },
            { name: "Loa máy tính", href: "/products?category=Speaker" },
            { name: "Kem tản nhiệt", href: "/products?category=ThermalPaste" },
            { name: "Card wifi", href: "/products?category=WiFiCard" },
            {
                name: "Card mạng có dây",
                href: "/products?category=WiredNetworkCard",
            },
        ],
    },
    {
        title: "Sản phẩm gợi ý",
        items: [
            { name: "Dành cho bạn", href: "/recommendations" },
            { name: "Xem gần đây", href: "/recommendations?tab=recent" },
            { name: "Xu hướng", href: "/recommendations?tab=trending" },
        ],
    },
];

const Navigation: React.FC = () => {
    // Original state variables
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // New state for dynamically fetched subcategories
    const [subcategoryValues, setSubcategoryValues] = useState<
        Record<string, Record<string, string[]>>
    >({});
    const [loadingSubcategories, setLoadingSubcategories] = useState<
        Record<string, Record<string, boolean>>
    >({});

    // Add state for subcategory search
    const [subcategorySearchQueries, setSubcategorySearchQueries] = useState<
        Record<string, Record<string, string>>
    >({});

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
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

    // Handle hovering over a category item - fetch subcategories if needed
    const handleItemMouseEnter = async (
        categoryIdx: number,
        itemIdx: number,
    ) => {
        setHoveredItem(itemIdx);

        const category = productCategories[categoryIdx];
        const item = category.items[itemIdx];

        // If this item has subcategories defined but we haven't fetched values yet
        if (item.subcategories && !subcategoryValues[item.href]) {
            // Extract category code from URL (e.g., "CPU" from "/products?category=CPU")
            const categoryCode = new URLSearchParams(
                item.href.split("?")[1],
            ).get("category");
            if (!categoryCode) return;

            // Create an empty object for this category if it doesn't exist
            if (!subcategoryValues[item.href]) {
                setSubcategoryValues((prev) => ({
                    ...prev,
                    [item.href]: {},
                }));
                setLoadingSubcategories((prev) => ({
                    ...prev,
                    [item.href]: {},
                }));
            }

            // Fetch each subcategory's values
            for (const subcategory of item.subcategories) {
                // Skip if we've already fetched this subcategory
                if (subcategoryValues[item.href]?.[subcategory.key]) continue;

                // Set loading state
                setLoadingSubcategories((prev) => ({
                    ...prev,
                    [item.href]: {
                        ...prev[item.href],
                        [subcategory.key]: true,
                    },
                }));

                try {
                    // Fetch subcategory values from the API
                    const values = await fetchSubcategoryValues(
                        categoryCode,
                        subcategory.key,
                    );

                    // Update state with fetched values
                    setSubcategoryValues((prev) => ({
                        ...prev,
                        [item.href]: {
                            ...prev[item.href],
                            [subcategory.key]: values,
                        },
                    }));
                } catch (error) {
                    console.error(
                        `Error fetching ${subcategory.key} values for ${categoryCode}:`,
                        error,
                    );
                } finally {
                    // Clear loading state
                    setLoadingSubcategories((prev) => ({
                        ...prev,
                        [item.href]: {
                            ...prev[item.href],
                            [subcategory.key]: false,
                        },
                    }));
                }
            }
        }
    };

    const handleItemMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleLinkClick = (href: string) => {
        setIsDropdownOpen(false);
        window.location.href = href;
    };

    const handleSubcategorySearch = (
        itemHref: string,
        subcategoryKey: string,
        query: string,
    ) => {
        setSubcategorySearchQueries((prev) => ({
            ...prev,
            [itemHref]: {
                ...(prev[itemHref] || {}),
                [subcategoryKey]: query,
            },
        }));
    };

    // Filter subcategory values based on search query
    const getFilteredSubcategoryValues = (
        itemHref: string,
        subcategoryKey: string,
    ) => {
        const values = subcategoryValues[itemHref]?.[subcategoryKey] || [];
        const query =
            subcategorySearchQueries[itemHref]?.[subcategoryKey]?.toLowerCase();

        if (!query) return values;

        return values.filter((value) => value.toLowerCase().includes(query));
    };

    // Extract category from href
    const getCategoryFromHref = (href: string): string => {
        const params = new URLSearchParams(href.split("?")[1]);
        return params.get("category") || "";
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
                            className={`object-contain shrink-0 self-stretch my-auto w-3 aspect-square transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-[700px] bg-white shadow-lg rounded-md border border-gray-200">
                            <div className="grid grid-cols-4 gap-4 p-5">
                                {productCategories.map((category, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col space-y-2 relative"
                                        onMouseEnter={() =>
                                            handleCategoryMouseEnter(idx)
                                        }
                                        onMouseLeave={handleCategoryMouseLeave}
                                    >
                                        <h3 className="font-medium text-zinc-900 pb-2 border-b">
                                            {category.title}
                                        </h3>
                                        <ul className="space-y-1.5">
                                            {category.items.map(
                                                (item, itemIdx) => (
                                                    <li
                                                        key={itemIdx}
                                                        className="relative group"
                                                        onMouseEnter={() =>
                                                            handleItemMouseEnter(
                                                                idx,
                                                                itemIdx,
                                                            )
                                                        }
                                                        onMouseLeave={
                                                            handleItemMouseLeave
                                                        }
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className="text-gray-600 hover:text-blue-600 hover:underline text-sm block py-1"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLinkClick(
                                                                    item.href,
                                                                );
                                                            }}
                                                        >
                                                            {item.name}
                                                        </a>

                                                        {/* Dynamically fetched subcategories dropdown */}
                                                        {item.subcategories &&
                                                            hoveredCategory ===
                                                                idx &&
                                                            hoveredItem ===
                                                                itemIdx && (
                                                                <div className="absolute left-full top-0 z-50 ml-0 w-[500px] bg-white shadow-lg rounded-md border border-gray-200 p-5 opacity-100 transition-opacity duration-200 pointer-events-auto">
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        {item.subcategories.map(
                                                                            (
                                                                                subcat: SubcategoryType,
                                                                                subcatIdx: number,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        subcatIdx
                                                                                    }
                                                                                    className="flex flex-col space-y-2"
                                                                                >
                                                                                    <h4 className="font-medium text-sm text-zinc-900 pb-1 border-b">
                                                                                        {
                                                                                            subcat.title
                                                                                        }
                                                                                    </h4>

                                                                                    {/* Search input for subcategory values */}
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Tìm kiếm..."
                                                                                        className="px-2 py-1 text-xs border rounded mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                        value={
                                                                                            subcategorySearchQueries[
                                                                                                item
                                                                                                    .href
                                                                                            ]?.[
                                                                                                subcat
                                                                                                    .key
                                                                                            ] ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            handleSubcategorySearch(
                                                                                                item.href,
                                                                                                subcat.key,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        // Prevent mousedown from closing the dropdown
                                                                                        onMouseDown={(
                                                                                            e,
                                                                                        ) =>
                                                                                            e.stopPropagation()
                                                                                        }
                                                                                    />

                                                                                    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
                                                                                        <ul className="space-y-1">
                                                                                            {loadingSubcategories[
                                                                                                item
                                                                                                    .href
                                                                                            ]?.[
                                                                                                subcat
                                                                                                    .key
                                                                                            ] ? (
                                                                                                <li className="text-gray-400 text-xs py-0.5">
                                                                                                    Đang
                                                                                                    tải...
                                                                                                </li>
                                                                                            ) : (
                                                                                                getFilteredSubcategoryValues(
                                                                                                    item.href,
                                                                                                    subcat.key,
                                                                                                ).map(
                                                                                                    (
                                                                                                        value,
                                                                                                        valueIdx,
                                                                                                    ) => (
                                                                                                        <li
                                                                                                            key={
                                                                                                                valueIdx
                                                                                                            }
                                                                                                        >
                                                                                                            <a
                                                                                                                href="#"
                                                                                                                className="text-gray-600 hover:text-blue-600 hover:underline text-xs block py-0.5"
                                                                                                                onClick={(
                                                                                                                    e,
                                                                                                                ) => {
                                                                                                                    e.preventDefault();
                                                                                                                    const category =
                                                                                                                        getCategoryFromHref(
                                                                                                                            item.href,
                                                                                                                        );
                                                                                                                    const subcategoryFilters =
                                                                                                                        {
                                                                                                                            [subcat.key]:
                                                                                                                                [
                                                                                                                                    value,
                                                                                                                                ],
                                                                                                                        };
                                                                                                                    const filterUrl =
                                                                                                                        generateCategoryUrl(
                                                                                                                            category,
                                                                                                                            subcategoryFilters,
                                                                                                                        );
                                                                                                                    handleLinkClick(
                                                                                                                        filterUrl,
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                {
                                                                                                                    value
                                                                                                                }
                                                                                                            </a>
                                                                                                        </li>
                                                                                                    ),
                                                                                                )
                                                                                            )}

                                                                                            {/* Show count when filtered */}
                                                                                            {subcategorySearchQueries[
                                                                                                item
                                                                                                    .href
                                                                                            ]?.[
                                                                                                subcat
                                                                                                    .key
                                                                                            ] &&
                                                                                                getFilteredSubcategoryValues(
                                                                                                    item.href,
                                                                                                    subcat.key,
                                                                                                )
                                                                                                    .length >
                                                                                                    0 && (
                                                                                                    <li className="text-xs text-gray-400 pt-1">
                                                                                                        {
                                                                                                            getFilteredSubcategoryValues(
                                                                                                                item.href,
                                                                                                                subcat.key,
                                                                                                            )
                                                                                                                .length
                                                                                                        }{" "}
                                                                                                        kết
                                                                                                        quả
                                                                                                    </li>
                                                                                                )}

                                                                                            {/* No results message */}
                                                                                            {subcategorySearchQueries[
                                                                                                item
                                                                                                    .href
                                                                                            ]?.[
                                                                                                subcat
                                                                                                    .key
                                                                                            ] &&
                                                                                                getFilteredSubcategoryValues(
                                                                                                    item.href,
                                                                                                    subcat.key,
                                                                                                )
                                                                                                    .length ===
                                                                                                    0 && (
                                                                                                    <li className="text-xs text-gray-400 pt-1">
                                                                                                        Không
                                                                                                        tìm
                                                                                                        thấy
                                                                                                        kết
                                                                                                        quả
                                                                                                    </li>
                                                                                                )}
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation links */}
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
