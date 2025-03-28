import React, { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { fetchSubcategoryValues, generateCategoryUrl } from "@/api/product";

// Use the same product categories from Navigation
const productCategories = [
    {
        title: "Linh kiện PC",
        items: [
            {
                name: "CPU - Bộ vi xử lý",
                href: "/products?category=CPU",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Socket", key: "socket" },
                ],
            },
            {
                name: "Mainboard - Bo mạch chủ",
                href: "/products?category=Motherboard",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Chipset", key: "chipset" },
                ],
            },
            {
                name: "RAM - Bộ nhớ trong",
                href: "/products?category=RAM",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Dung lượng", key: "moduleSize" },
                ],
            },
            {
                name: "VGA - Card màn hình",
                href: "/products?category=GraphicsCard",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Chipset", key: "chipset" },
                ],
            },
            {
                name: "Ổ cứng",
                href: "/products?category=InternalHardDrive",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Loại", key: "type" },
                ],
            },
            {
                name: "PSU - Nguồn máy tính",
                href: "/products?category=PowerSupply",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Công suất", key: "wattage" },
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
            {
                name: "Màn hình",
                href: "/products?category=Monitor",
                subcategories: [
                    { title: "Thương hiệu", key: "manufacturer" },
                    { title: "Kích thước", key: "screenSize" },
                    { title: "Tần số quét", key: "refreshRate" },
                    { title: "Độ phân giải", key: "resolution" },
                    { title: "Loại panel", key: "panelType" },
                ],
            },

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
];

const SidebarMenu: React.FC = () => {
    const [expandedCategory, setExpandedCategory] = useState<number | null>(
        null,
    );
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // States for dynamic subcategory loading
    const [subcategoryValues, setSubcategoryValues] = useState<
        Record<string, Record<string, string[]>>
    >({});
    const [loadingSubcategories, setLoadingSubcategories] = useState<
        Record<string, Record<string, boolean>>
    >({});
    const [subcategorySearchQueries, setSubcategorySearchQueries] = useState<
        Record<string, Record<string, string>>
    >({});

    const handleCategoryClick = (index: number) => {
        setExpandedCategory(expandedCategory === index ? null : index);
    };

    const handleItemClick = async (categoryIdx: number, itemHref: string) => {
        // Toggle item expansion
        setExpandedItem(expandedItem === itemHref ? null : itemHref);

        // If this item doesn't have subcategories or is being collapsed, do nothing else
        const item = productCategories[categoryIdx].items.find(
            (i) => i.href === itemHref,
        );
        if (!item?.subcategories || expandedItem === itemHref) return;

        // Extract category code from URL
        const categoryCode = new URLSearchParams(itemHref.split("?")[1]).get(
            "category",
        );
        if (!categoryCode) return;

        // Initialize values object for this item if it doesn't exist
        if (!subcategoryValues[itemHref]) {
            setSubcategoryValues((prev) => ({
                ...prev,
                [itemHref]: {},
            }));
            setLoadingSubcategories((prev) => ({
                ...prev,
                [itemHref]: {},
            }));
        }

        // Fetch subcategory values
        for (const subcategory of item.subcategories) {
            // Skip if already fetched
            if (subcategoryValues[itemHref]?.[subcategory.key]) continue;

            // Set loading state
            setLoadingSubcategories((prev) => ({
                ...prev,
                [itemHref]: {
                    ...prev[itemHref],
                    [subcategory.key]: true,
                },
            }));

            try {
                // Fetch values from API
                const values = await fetchSubcategoryValues(
                    categoryCode,
                    subcategory.key,
                );

                // Update state with fetched values
                setSubcategoryValues((prev) => ({
                    ...prev,
                    [itemHref]: {
                        ...prev[itemHref],
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
                    [itemHref]: {
                        ...prev[itemHref],
                        [subcategory.key]: false,
                    },
                }));
            }
        }
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

    const handleSubcategoryValueClick = (
        e: React.MouseEvent,
        itemHref: string,
        subcategoryKey: string,
        value: string,
    ) => {
        e.preventDefault();
        const category = getCategoryFromHref(itemHref);
        const subcategoryFilters = { [subcategoryKey]: [value] };
        const filterUrl = generateCategoryUrl(category, subcategoryFilters);
        window.location.href = filterUrl;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-2 h-full">
            <h3 className="font-medium text-zinc-900 p-3 border-b mb-2">
                Danh mục sản phẩm
            </h3>

            <div className="space-y-1">
                {productCategories.map((category, idx) => (
                    <div key={idx} className="mb-2">
                        <div
                            className="flex justify-between items-center w-full p-2 text-left font-medium text-zinc-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            onClick={() => handleCategoryClick(idx)}
                        >
                            <span>{category.title}</span>
                            <ChevronRightIcon
                                className={`transition-transform ${expandedCategory === idx ? "rotate-90" : ""}`}
                            />
                        </div>

                        {expandedCategory === idx && (
                            <div className="ml-2 border-l-2 border-gray-200 pl-2">
                                {category.items.map((item, itemIdx) => (
                                    <div key={itemIdx}>
                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={item.href}
                                                className="block flex-grow p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                                onClick={(e) => {
                                                    if (item.subcategories) {
                                                        e.preventDefault();
                                                        handleItemClick(
                                                            idx,
                                                            item.href,
                                                        );
                                                    }
                                                }}
                                            >
                                                {item.name}
                                            </Link>
                                            {item.subcategories && (
                                                <ChevronRightIcon
                                                    className={`transition-transform mr-2 ${expandedItem === item.href ? "rotate-90" : ""}`}
                                                    onClick={() =>
                                                        handleItemClick(
                                                            idx,
                                                            item.href,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>

                                        {/* Subcategories panel */}
                                        {item.subcategories &&
                                            expandedItem === item.href && (
                                                <div className="pl-3 pr-1 py-2 bg-gray-50 rounded-md mb-1">
                                                    {item.subcategories.map(
                                                        (subcat, subcatIdx) => (
                                                            <div
                                                                key={subcatIdx}
                                                                className="mb-3"
                                                            >
                                                                <h5 className="font-medium text-xs text-zinc-900 mb-1 pb-1 border-b">
                                                                    {
                                                                        subcat.title
                                                                    }
                                                                </h5>

                                                                {/* Search input */}
                                                                <div className="relative mb-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Tìm kiếm..."
                                                                        className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 pl-6"
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
                                                                    />
                                                                    <MagnifyingGlassIcon className="absolute left-1.5 top-1.5 h-3 w-3 text-gray-400" />
                                                                </div>

                                                                {/* Subcategory values */}
                                                                <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                                    {loadingSubcategories[
                                                                        item
                                                                            .href
                                                                    ]?.[
                                                                        subcat
                                                                            .key
                                                                    ] ? (
                                                                        <div className="text-gray-400 text-xs py-1">
                                                                            Đang
                                                                            tải...
                                                                        </div>
                                                                    ) : (
                                                                        <ul className="space-y-1">
                                                                            {getFilteredSubcategoryValues(
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
                                                                                            className="block text-xs text-gray-600 hover:text-blue-600 hover:underline py-0.5"
                                                                                            onClick={(
                                                                                                e,
                                                                                            ) =>
                                                                                                handleSubcategoryValueClick(
                                                                                                    e,
                                                                                                    item.href,
                                                                                                    subcat.key,
                                                                                                    value,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                value
                                                                                            }
                                                                                        </a>
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    )}

                                                                    {/* Result count */}
                                                                    {subcategorySearchQueries[
                                                                        item
                                                                            .href
                                                                    ]?.[
                                                                        subcat
                                                                            .key
                                                                    ] && (
                                                                        <div className="text-xs text-gray-400 pt-1">
                                                                            {getFilteredSubcategoryValues(
                                                                                item.href,
                                                                                subcat.key,
                                                                            )
                                                                                .length ===
                                                                            0
                                                                                ? "Không tìm thấy kết quả"
                                                                                : `${getFilteredSubcategoryValues(item.href, subcat.key).length} kết quả`}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
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

export default SidebarMenu;
