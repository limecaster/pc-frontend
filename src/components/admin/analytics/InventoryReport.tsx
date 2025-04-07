"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faExclamationTriangle,
    faSpinner,
    faWarning,
    faSearch,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
    getInventoryReport,
    getLowStockProducts,
    getOutOfStockProducts,
    getProductCategories,
} from "@/api/analytics";
import { Pie } from "react-chartjs-2";
import toast from "react-hot-toast";

interface InventorySummary {
    totalProducts: number;
    totalValue: number;
    outOfStock: number;
    lowStock: number;
    excessStock: number;
}

interface CategoryData {
    name: string;
    count: number;
    value: number;
}

interface LowStockItem {
    id: string;
    name: string;
    stock: number;
    threshold: number;
}

interface OutOfStockItem {
    id: string;
    name: string;
    lastInStock: string;
}

interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const InventoryReport: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
        totalProducts: 0,
        totalValue: 0,
        outOfStock: 0,
        lowStock: 0,
        excessStock: 0,
    });
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [outOfStockItems, setOutOfStockItems] = useState<OutOfStockItem[]>(
        [],
    );

    // New state for pagination and search
    const [lowStockPage, setLowStockPage] = useState(1);
    const [lowStockLimit] = useState(5);
    const [lowStockSearch, setLowStockSearch] = useState("");
    const [lowStockTotal, setLowStockTotal] = useState(0);
    const [lowStockTotalPages, setLowStockTotalPages] = useState(0);
    const [lowStockSearchInput, setLowStockSearchInput] = useState("");

    const [outOfStockPage, setOutOfStockPage] = useState(1);
    const [outOfStockLimit] = useState(5);
    const [outOfStockSearch, setOutOfStockSearch] = useState("");
    const [outOfStockTotal, setOutOfStockTotal] = useState(0);
    const [outOfStockTotalPages, setOutOfStockTotalPages] = useState(0);
    const [outOfStockSearchInput, setOutOfStockSearchInput] = useState("");

    const [loadingLowStock, setLoadingLowStock] = useState(false);
    const [loadingOutOfStock, setLoadingOutOfStock] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884D8",
        "#82CA9D",
        "#D53E4F",
        "#FC8D59",
        "#FEE08B",
        "#E6F598",
        "#99D594",
        "#3288BD",
    ];

    useEffect(() => {
        const fetchInventoryData = async () => {
            setIsLoading(true);
            try {
                const inventoryData = await getInventoryReport();
                setInventorySummary(inventoryData.summary);

                // We'll load full data in separate requests
                setLowStockItems(inventoryData.lowStockItems); // Preview
                setOutOfStockItems(inventoryData.outOfStockItems); // Preview

                // Set the total counts for pagination info
                setLowStockTotal(inventoryData.summary.lowStock);
                setLowStockTotalPages(
                    Math.ceil(inventoryData.summary.lowStock / lowStockLimit),
                );

                setOutOfStockTotal(inventoryData.summary.outOfStock);
                setOutOfStockTotalPages(
                    Math.ceil(
                        inventoryData.summary.outOfStock / outOfStockLimit,
                    ),
                );

                // Load categories separately
                fetchCategoryData();
            } catch (error) {
                console.error("Failed to fetch inventory data:", error);
                toast.error("Không thể tải dữ liệu báo cáo tồn kho");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventoryData();
    }, [lowStockLimit, outOfStockLimit]);

    // Memoize data fetching functions to prevent unnecessary re-renders
    const fetchCategoryData = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const categoryData = await getProductCategories();
            setCategories(categoryData);
        } catch (error) {
            console.error("Failed to fetch category data:", error);
            toast.error("Không thể tải dữ liệu danh mục");
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    const fetchLowStockItems = useCallback(
        async (page: number, limit: number, search: string) => {
            setLoadingLowStock(true);
            try {
                const response = await getLowStockProducts(page, limit, search);
                setLowStockItems(response.items);
                setLowStockTotal(response.pagination.total);
                setLowStockTotalPages(response.pagination.totalPages);
            } catch (error) {
                console.error("Failed to fetch low stock items:", error);
                toast.error("Không thể tải danh sách sản phẩm sắp hết hàng");
            } finally {
                setLoadingLowStock(false);
            }
        },
        [],
    );

    const fetchOutOfStockItems = useCallback(
        async (page: number, limit: number, search: string) => {
            setLoadingOutOfStock(true);
            try {
                const response = await getOutOfStockProducts(
                    page,
                    limit,
                    search,
                );
                setOutOfStockItems(response.items);
                setOutOfStockTotal(response.pagination.total);
                setOutOfStockTotalPages(response.pagination.totalPages);
            } catch (error) {
                console.error("Failed to fetch out of stock items:", error);
                toast.error("Không thể tải danh sách sản phẩm hết hàng");
            } finally {
                setLoadingOutOfStock(false);
            }
        },
        [],
    );

    // Memoize search handlers
    const handleLowStockSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setLowStockSearch(lowStockSearchInput);
            setLowStockPage(1); // Reset to first page on new search
        },
        [lowStockSearchInput],
    );

    const handleOutOfStockSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setOutOfStockSearch(outOfStockSearchInput);
            setOutOfStockPage(1); // Reset to first page on new search
        },
        [outOfStockSearchInput],
    );

    // Update reset functions with useCallback
    const clearLowStockSearch = useCallback(() => {
        setLowStockSearchInput("");
        setLowStockSearch("");
        setLowStockPage(1);
    }, []);

    const clearOutOfStockSearch = useCallback(() => {
        setOutOfStockSearchInput("");
        setOutOfStockSearch("");
        setOutOfStockPage(1);
    }, []);

    // Update useEffect hooks to use the memoized functions
    useEffect(() => {
        fetchLowStockItems(lowStockPage, lowStockLimit, lowStockSearch);
    }, [lowStockPage, lowStockLimit, lowStockSearch, fetchLowStockItems]);

    useEffect(() => {
        fetchOutOfStockItems(outOfStockPage, outOfStockLimit, outOfStockSearch);
    }, [
        outOfStockPage,
        outOfStockLimit,
        outOfStockSearch,
        fetchOutOfStockItems,
    ]);

    // Format large currency values
    const formatLargeCurrency = (value: number): string => {
        // Format for trillions (larger than 1 trillion)
        if (value >= 1_000_000_000_000) {
            return (
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                    maximumFractionDigits: 2,
                }).format(value / 1_000_000_000_000) + " nghìn tỷ"
            );
        }
        // Format for billions (larger than 1 billion)
        else if (value >= 1_000_000_000) {
            return (
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                    maximumFractionDigits: 2,
                }).format(value / 1_000_000_000) + " tỷ"
            );
        }
        // Regular currency format
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Prepare data for Chart.js pie chart
    const categoriesData = {
        labels: categories.map((cat) => cat.name),
        datasets: [
            {
                data: categories.map((cat) => cat.value),
                backgroundColor: COLORS.slice(0, categories.length),
                borderColor: COLORS.slice(0, categories.length).map(
                    (color) => `${color}DD`,
                ),
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce(
                            (a: number, b: number) => a + b,
                            0,
                        );
                        const percentage = ((value / total) * 100).toFixed(0);
                        return `${label}: ${formatLargeCurrency(
                            value,
                        )} (${percentage}%)`;
                    },
                },
            },
            legend: {
                position: "right" as const,
                labels: {
                    boxWidth: 15,
                },
            },
        },
    };

    // Pagination controls component
    const PaginationControls = ({
        currentPage,
        totalPages,
        onPageChange,
    }: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    }) => {
        const handlePageChange = (e: React.MouseEvent, page: number) => {
            e.preventDefault();
            onPageChange(page);
        };

        return (
            <div className="flex items-center justify-between mt-4">
                <button
                    type="button"
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => handlePageChange(e, currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="text-gray-700"
                    />
                </button>
                <span className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPages || 1}
                </span>
                <button
                    type="button"
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => handlePageChange(e, currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-gray-700"
                    />
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    size="2x"
                    className="text-blue-600"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    Báo cáo tồn kho
                </h2>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng sản phẩm
                    </div>
                    <div className="text-2xl font-bold mt-1">
                        {inventorySummary.totalProducts.toLocaleString("vi-VN")}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng giá trị tồn kho
                    </div>
                    <div
                        className="text-2xl font-bold mt-1 truncate"
                        title={formatLargeCurrency(inventorySummary.totalValue)}
                    >
                        {formatLargeCurrency(inventorySummary.totalValue)}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Sản phẩm hết hàng
                    </div>
                    <div className="flex items-end mt-1">
                        <div className="text-2xl font-bold">
                            {inventorySummary.outOfStock}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                            (
                            {inventorySummary.totalProducts
                                ? (
                                      (inventorySummary.outOfStock /
                                          inventorySummary.totalProducts) *
                                      100
                                  ).toFixed(1)
                                : "0"}
                            %)
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Sắp hết hàng (≤ 5)
                    </div>
                    <div className="flex items-end mt-1">
                        <div className="text-2xl font-bold">
                            {inventorySummary.lowStock}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                            (
                            {inventorySummary.totalProducts
                                ? (
                                      (inventorySummary.lowStock /
                                          inventorySummary.totalProducts) *
                                      100
                                  ).toFixed(1)
                                : "0"}
                            %)
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Tồn kho nhiều
                    </div>
                    <div className="flex items-end mt-1">
                        <div className="text-2xl font-bold">
                            {inventorySummary.excessStock}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                            (
                            {inventorySummary.totalProducts
                                ? (
                                      (inventorySummary.excessStock /
                                          inventorySummary.totalProducts) *
                                      100
                                  ).toFixed(1)
                                : "0"}
                            %)
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory by category and warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories pie chart */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Giá trị tồn kho theo danh mục
                    </h3>
                    <div className="h-64">
                        {categories.length > 0 ? (
                            <Pie data={categoriesData} options={pieOptions} />
                        ) : loadingCategories ? (
                            <div className="flex items-center justify-center h-full">
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    size="lg"
                                    className="text-blue-600"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>
                </div>

                {/* Low stock products */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                        <FontAwesomeIcon
                            icon={faWarning}
                            className="text-amber-500 mr-2"
                        />
                        Sản phẩm sắp hết hàng
                    </h3>

                    {/* Search form */}
                    <form onSubmit={handleLowStockSearch} className="mb-4 flex">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full p-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                                value={lowStockSearchInput}
                                onChange={(e) =>
                                    setLowStockSearchInput(e.target.value)
                                }
                            />
                            {lowStockSearch && (
                                <button
                                    type="button"
                                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={clearLowStockSearch}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>

                    <div className="overflow-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                        Mã sản phẩm
                                    </th>
                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                        Sản phẩm
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-500">
                                        Tồn kho
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-500">
                                        Ngưỡng
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingLowStock ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-4 text-center"
                                        >
                                            <FontAwesomeIcon
                                                icon={faSpinner}
                                                spin
                                                className="text-blue-600"
                                            />
                                        </td>
                                    </tr>
                                ) : lowStockItems.length > 0 ? (
                                    lowStockItems.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-gray-200"
                                        >
                                            <td className="py-2 text-sm">
                                                {item.id}
                                            </td>
                                            <td className="py-2 text-sm font-medium">
                                                {item.name}
                                            </td>
                                            <td className="py-2 text-sm text-right text-amber-600 font-bold">
                                                {item.stock}
                                            </td>
                                            <td className="py-2 text-sm text-right">
                                                {item.threshold}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-t border-gray-200">
                                        <td
                                            colSpan={4}
                                            className="py-4 text-center text-sm text-gray-500"
                                        >
                                            Không có sản phẩm nào sắp hết hàng
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination for low stock */}
                    {lowStockTotalPages > 1 && (
                        <PaginationControls
                            currentPage={lowStockPage}
                            totalPages={lowStockTotalPages}
                            onPageChange={setLowStockPage}
                        />
                    )}
                </div>
            </div>

            {/* Out of stock products */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-red-500 mr-2"
                    />
                    Sản phẩm hết hàng
                </h3>

                {/* Search form */}
                <form onSubmit={handleOutOfStockSearch} className="mb-4 flex">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full p-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                            value={outOfStockSearchInput}
                            onChange={(e) =>
                                setOutOfStockSearchInput(e.target.value)
                            }
                        />
                        {outOfStockSearch && (
                            <button
                                type="button"
                                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={clearOutOfStockSearch}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </form>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Mã sản phẩm
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Còn hàng lần cuối
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingOutOfStock ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-4 text-center"
                                    >
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            spin
                                            className="text-blue-600"
                                        />
                                    </td>
                                </tr>
                            ) : outOfStockItems.length > 0 ? (
                                outOfStockItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-gray-200"
                                    >
                                        <td className="py-2 text-sm">
                                            {item.id}
                                        </td>
                                        <td className="py-2 text-sm font-medium">
                                            {item.name}
                                        </td>
                                        <td className="py-2 text-sm text-right">
                                            {item.lastInStock}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-t border-gray-200">
                                    <td
                                        colSpan={3}
                                        className="py-4 text-center text-sm text-gray-500"
                                    >
                                        Không có sản phẩm nào hết hàng
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination for out of stock */}
                {outOfStockTotalPages > 1 && (
                    <PaginationControls
                        currentPage={outOfStockPage}
                        totalPages={outOfStockTotalPages}
                        onPageChange={setOutOfStockPage}
                    />
                )}
            </div>
        </div>
    );
};

export default InventoryReport;
