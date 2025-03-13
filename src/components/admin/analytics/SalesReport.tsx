"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown,
    faSpinner,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
    getSalesReport,
    getBestSellingProducts,
    getBestSellingCategories,
} from "@/api/analytics";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    ChartLegend,
);

interface SalesReportProps {
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

interface SalesSummary {
    totalRevenue: number;
    totalProfit: number;
    totalTax: number;
    orderCount: number;
    averageOrderValue: number;
    revenueChange: number;
    profitChange: number;
    orderCountChange: number;
}

// Define interfaces for the state arrays
interface SalesDataPoint {
    date: string;
    revenue: number;
    profit: number;
}

interface BestSellingProduct {
    name: string;
    quantity: number;
    revenue: number;
}

interface CategorySalesData {
    name: string;
    value: number;
}

const SalesReport: React.FC<SalesReportProps> = ({ dateRange }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [salesSummary, setSalesSummary] = useState<SalesSummary>({
        totalRevenue: 0,
        totalProfit: 0,
        totalTax: 0,
        orderCount: 0,
        averageOrderValue: 0,
        revenueChange: 0,
        profitChange: 0,
        orderCountChange: 0,
    });
    // Add proper typing to state arrays
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [bestSellingProducts, setBestSellingProducts] = useState<
        BestSellingProduct[]
    >([]);
    const [bestSellingCategories, setBestSellingCategories] = useState<
        CategorySalesData[]
    >([]);

    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884D8",
        "#82CA9D",
        "#FF6B6B",
    ];

    useEffect(() => {
        const fetchSalesData = async () => {
            setIsLoading(true);
            try {
                // Fetch sales summary and time series data
                const salesReportData = await getSalesReport(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setSalesSummary(salesReportData.summary);
                setSalesData(salesReportData.timeSeries);

                // Fetch best selling products
                const productsData = await getBestSellingProducts(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setBestSellingProducts(productsData);

                // Fetch best selling categories
                const categoriesData = await getBestSellingCategories(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setBestSellingCategories(categoriesData);
            } catch (error) {
                console.error("Failed to fetch sales data:", error);
                toast.error("Không thể tải dữ liệu báo cáo doanh thu");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesData();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const exportData = () => {
        // Implement export functionality
        toast.success("Đang xuất báo cáo doanh thu...");
    };

    // Prepare data for Chart.js bar chart
    const revenueData = {
        labels: salesData.map((item) => item.date),
        datasets: [
            {
                label: "Doanh thu",
                data: salesData.map((item) => item.revenue),
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "#3B82F6",
                borderWidth: 1,
            },
            {
                label: "Lợi nhuận",
                data: salesData.map((item) => item.profit),
                backgroundColor: "rgba(16, 185, 129, 0.6)",
                borderColor: "#10B981",
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for Chart.js pie chart
    const categoriesData = {
        labels: bestSellingCategories.map((cat) => cat.name),
        datasets: [
            {
                data: bestSellingCategories.map((cat) => cat.value),
                backgroundColor: COLORS,
                borderColor: COLORS.map((color) => `${color}DD`),
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    // Chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return formatCurrency(value);
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || "";
                        let value = context.parsed.y || 0;
                        return `${label}: ${formatCurrency(value)}`;
                    },
                },
            },
        },
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
                        return `${label}: ${formatCurrency(
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
            {/* Header and summary cards remain unchanged */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    Báo cáo doanh thu
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng doanh thu
                    </div>
                    <div className="flex items-end mt-2">
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesSummary.totalRevenue)}
                        </div>
                        <div
                            className={`flex items-center ml-2 ${
                                salesSummary.revenueChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    salesSummary.revenueChange >= 0
                                        ? faArrowUp
                                        : faArrowDown
                                }
                                className="mr-1"
                                size="xs"
                            />
                            <span className="text-sm">
                                {Math.abs(salesSummary.revenueChange)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Lợi nhuận
                    </div>
                    <div className="flex items-end mt-2">
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesSummary.totalProfit)}
                        </div>
                        <div
                            className={`flex items-center ml-2 ${
                                salesSummary.profitChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    salesSummary.profitChange >= 0
                                        ? faArrowUp
                                        : faArrowDown
                                }
                                className="mr-1"
                                size="xs"
                            />
                            <span className="text-sm">
                                {Math.abs(salesSummary.profitChange)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Số đơn hàng
                    </div>
                    <div className="flex items-end mt-2">
                        <div className="text-2xl font-bold">
                            {salesSummary.orderCount}
                        </div>
                        <div
                            className={`flex items-center ml-2 ${
                                salesSummary.orderCountChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    salesSummary.orderCountChange >= 0
                                        ? faArrowUp
                                        : faArrowDown
                                }
                                className="mr-1"
                                size="xs"
                            />
                            <span className="text-sm">
                                {Math.abs(salesSummary.orderCountChange)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium">
                        Giá trị đơn hàng trung bình
                    </div>
                    <div className="flex items-end mt-2">
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesSummary.averageOrderValue)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue and Profit chart - Now using Chart.js */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Doanh thu & lợi nhuận
                </h3>
                <div className="h-80">
                    <Bar data={revenueData} options={barOptions} />
                </div>
            </div>

            {/* Best selling products and categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best selling products - Table remains unchanged */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Sản phẩm bán chạy nhất
                    </h3>
                    <div className="overflow-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                                        Sản phẩm
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-500">
                                        Số lượng bán
                                    </th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-500">
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bestSellingProducts.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-gray-200"
                                    >
                                        <td className="py-2 text-sm font-medium">
                                            {product.name}
                                        </td>
                                        <td className="py-2 text-sm text-right">
                                            {product.quantity}
                                        </td>
                                        <td className="py-2 text-sm text-right">
                                            {formatCurrency(product.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Categories pie chart - Now using Chart.js */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Doanh thu theo danh mục
                    </h3>
                    <div className="h-64">
                        <Pie data={categoriesData} options={pieOptions} />
                    </div>
                </div>
            </div>

            {/* Taxes breakdown - Unchanged */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">Chi tiết thuế</h3>
                <div className="flex justify-between">
                    <div>
                        <div className="text-sm text-gray-500">
                            Tổng thuế đã thu
                        </div>
                        <div className="text-xl font-bold mt-1">
                            {formatCurrency(salesSummary.totalTax)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">
                            Tỷ lệ thuế trung bình
                        </div>
                        <div className="text-xl font-bold mt-1">
                            {(
                                (salesSummary.totalTax /
                                    salesSummary.totalRevenue) *
                                100
                            ).toFixed(1)}
                            %
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
