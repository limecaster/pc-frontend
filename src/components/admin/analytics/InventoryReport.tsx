"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faExclamationTriangle,
    faBoxOpen,
    faWarehouse,
    faSearch,
    faDownload,
    faTag,
    faBoxes,
} from "@fortawesome/free-solid-svg-icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { getInventoryReport } from "@/api/analytics";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    ChartTooltip,
    ChartLegend,
    Title,
);

const InventoryReport: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [inventoryData, setInventoryData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884D8",
        "#82CA9D",
    ];

    useEffect(() => {
        const fetchInventoryData = async () => {
            try {
                setIsLoading(true);
                const data = await getInventoryReport();
                setInventoryData(data);
            } catch (error) {
                console.error("Failed to fetch inventory data:", error);
                toast.error("Không thể tải dữ liệu báo cáo kho hàng");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventoryData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const exportData = () => {
        toast.success("Đang xuất báo cáo kho hàng...");
    };

    const getFilteredLowStockItems = () => {
        if (!inventoryData?.lowStockItems) return [];
        return inventoryData.lowStockItems.filter(
            (item: any) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterCategory === "all" || item.category === filterCategory),
        );
    };

    const getFilteredOutOfStockItems = () => {
        if (!inventoryData?.outOfStockItems) return [];
        return inventoryData.outOfStockItems.filter(
            (item: any) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterCategory === "all" || item.category === filterCategory),
        );
    };

    // Prepare pie chart data in Chart.js format
    const categoryDistributionData = {
        labels: inventoryData?.categories.map((cat: any) => cat.name) || [],
        datasets: [
            {
                data:
                    inventoryData?.categories.map((cat: any) => cat.count) ||
                    [],
                backgroundColor: COLORS,
                borderColor: COLORS.map((color) => `${color}DD`),
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    // Prepare bar chart data in Chart.js format
    const categoryValueData = {
        labels: inventoryData?.categories.map((cat: any) => cat.name) || [],
        datasets: [
            {
                label: "Giá trị kho",
                data:
                    inventoryData?.categories.map((cat: any) => cat.value) ||
                    [],
                backgroundColor: "#3B82F6",
                borderColor: "#2563EB",
                borderWidth: 1,
            },
        ],
    };

    // Chart options
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
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${percentage}%`;
                    },
                },
            },
            legend: {
                position: "bottom" as const,
                labels: {
                    padding: 20,
                    boxWidth: 15,
                },
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return formatCurrency(context.parsed.y);
                    },
                },
            },
            legend: {
                position: "top" as const,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value: any) {
                        return formatCurrency(value);
                    },
                },
            },
        },
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
                    Báo cáo kho hàng
                </h2>
                <button
                    onClick={exportData}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-blue-600">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Tổng sản phẩm
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {inventoryData?.summary.totalProducts}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-green-600">
                        <FontAwesomeIcon icon={faTag} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Giá trị kho
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {formatCurrency(inventoryData?.summary.totalValue)}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-red-600">
                        <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Hết hàng
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {inventoryData?.summary.outOfStock}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-yellow-600">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="mr-2"
                        />
                        <div className="text-sm text-gray-500 font-medium">
                            Sắp hết hàng
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {inventoryData?.summary.lowStock}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-purple-600">
                        <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Dư thừa
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {inventoryData?.summary.excessStock}
                    </div>
                </div>
            </div>

            {/* Inventory Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution - Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Phân bố danh mục
                    </h3>
                    <div className="h-64">
                        <Pie
                            data={categoryDistributionData}
                            options={pieOptions}
                        />
                    </div>
                </div>

                {/* Value Distribution - Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Giá trị theo danh mục
                    </h3>
                    <div className="h-64">
                        <Bar data={categoryValueData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                        Sản phẩm sắp hết hàng
                    </h3>
                    <div className="flex items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    SKU
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Tồn kho
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Ngưỡng
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredLowStockItems().map((item: any) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-gray-200"
                                >
                                    <td className="py-2 text-sm font-medium">
                                        {item.name}
                                    </td>
                                    <td className="py-2 text-sm">{item.sku}</td>
                                    <td className="py-2 text-sm text-right">
                                        {item.stock}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.threshold}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Sắp hết
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Out of Stock Items */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">Sản phẩm hết hàng</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    SKU
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Lần cuối có hàng
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredOutOfStockItems().map((item: any) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-gray-200"
                                >
                                    <td className="py-2 text-sm font-medium">
                                        {item.name}
                                    </td>
                                    <td className="py-2 text-sm">{item.sku}</td>
                                    <td className="py-2 text-sm text-right">
                                        {item.lastInStock}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Hết hàng
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;
