"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faExclamationTriangle,
    faSpinner,
    faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { getInventoryReport } from "@/api/analytics";
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
            setIsLoading(true);
            try {
                const inventoryData = await getInventoryReport();
                setInventorySummary(inventoryData.summary);
                setCategories(inventoryData.categories);
                setLowStockItems(inventoryData.lowStockItems);
                setOutOfStockItems(inventoryData.outOfStockItems);
            } catch (error) {
                console.error("Failed to fetch inventory data:", error);
                toast.error("Không thể tải dữ liệu báo cáo tồn kho");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventoryData();
    }, []);

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
                backgroundColor: COLORS,
                borderColor: COLORS.map((color) => `${color}DD`),
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
                                {lowStockItems.length > 0 ? (
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
                            {outOfStockItems.length > 0 ? (
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
            </div>
        </div>
    );
};

export default InventoryReport;
