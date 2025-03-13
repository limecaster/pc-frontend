"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faDownload,
    faEye,
    faShoppingCart,
    faUserClock,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Filler,
} from "chart.js";
import { Line, Chart } from "react-chartjs-2";
// Import Chart instead of Bar for mixed chart types
import {
    getUserBehaviorReport,
    getMostViewedProducts,
    getAbandonedCarts,
    getConversionRates,
} from "@/api/analytics";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Filler,
    ChartTooltip,
    ChartLegend,
);

interface UserBehaviorReportProps {
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

interface BehaviorSummary {
    totalVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    averageTimeOnSite: number;
    bounceRate: number;
    conversionRate: number;
}

// Define interfaces for the state arrays
interface VisitorDataPoint {
    date: string;
    visitors: number;
    newVisitors: number;
    returningVisitors: number;
}

interface ViewedProduct {
    name: string;
    views: number;
    purchases: number;
    conversionRate: number;
}

interface AbandonedCartData {
    date: string;
    totalCarts: number;
    abandonedCarts: number;
    rate: number;
}

interface ConversionRateData {
    page: string;
    visits: number;
    conversions: number;
    rate: number;
}

const UserBehaviorReport: React.FC<UserBehaviorReportProps> = ({
    dateRange,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<BehaviorSummary>({
        totalVisitors: 0,
        newVisitors: 0,
        returningVisitors: 0,
        averageTimeOnSite: 0,
        bounceRate: 0,
        conversionRate: 0,
    });
    // Add proper typing to state arrays
    const [visitorData, setVisitorData] = useState<VisitorDataPoint[]>([]);
    const [mostViewedProducts, setMostViewedProducts] = useState<
        ViewedProduct[]
    >([]);
    const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartData[]>(
        [],
    );
    const [conversionData, setConversionData] = useState<ConversionRateData[]>(
        [],
    );

    useEffect(() => {
        const fetchUserBehaviorData = async () => {
            setIsLoading(true);
            try {
                // Fetch user behavior summary and time series
                const behaviorData = await getUserBehaviorReport(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setSummary(behaviorData.summary);
                setVisitorData(behaviorData.visitorData);

                // Fetch most viewed products
                const productsData = await getMostViewedProducts(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setMostViewedProducts(productsData);

                // Fetch abandoned carts
                const cartsData = await getAbandonedCarts(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setAbandonedCarts(cartsData);

                // Fetch conversion rates
                const conversionRatesData = await getConversionRates(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setConversionData(conversionRatesData);
            } catch (error) {
                console.error("Failed to fetch user behavior data:", error);
                toast.error("Không thể tải dữ liệu hành vi người dùng");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserBehaviorData();
    }, [dateRange]);

    const exportData = () => {
        toast.success("Đang xuất báo cáo hành vi người dùng...");
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Prepare chart data
    const visitorChartData = {
        labels: visitorData.map((item: any) => item.date),
        datasets: [
            {
                label: "Tổng lượt truy cập",
                data: visitorData.map((item: any) => item.visitors),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: "#3B82F6",
                pointRadius: 3,
            },
            {
                label: "Người dùng mới",
                data: visitorData.map((item: any) => item.newVisitors),
                borderColor: "#10B981",
                backgroundColor: "transparent",
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: "#10B981",
                pointRadius: 3,
            },
            {
                label: "Người dùng quay lại",
                data: visitorData.map((item: any) => item.returningVisitors),
                borderColor: "#F59E0B",
                backgroundColor: "transparent",
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: "#F59E0B",
                pointRadius: 3,
            },
        ],
    };

    // Update abandoned cart data for a mixed chart
    const abandonedCartData = {
        labels: abandonedCarts.map((item: any) => item.date),
        datasets: [
            {
                type: "bar" as const,
                label: "Tổng giỏ hàng",
                data: abandonedCarts.map((item: any) => item.totalCarts),
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "#3B82F6",
                order: 2,
            },
            {
                type: "bar" as const,
                label: "Giỏ hàng bị bỏ",
                data: abandonedCarts.map((item: any) => item.abandonedCarts),
                backgroundColor: "rgba(239, 68, 68, 0.6)",
                borderColor: "#EF4444",
                order: 3,
            },
            {
                type: "line" as const,
                label: "Tỷ lệ bỏ (%)",
                data: abandonedCarts.map((item: any) => item.rate),
                borderColor: "#F59E0B",
                backgroundColor: "transparent",
                borderWidth: 2,
                pointBackgroundColor: "#F59E0B",
                tension: 0.4,
                yAxisID: "y1",
                order: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
    };

    const abandonedCartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || "";
                        let value = context.parsed.y || context.parsed || 0;

                        if (context.dataset.label === "Tỷ lệ bỏ (%)") {
                            return `${label}: ${value}%`;
                        }
                        return `${label}: ${value}`;
                    },
                },
            },
        },
        scales: {
            y: {
                position: "left" as const,
                title: {
                    display: true,
                    text: "Số lượng giỏ hàng",
                },
            },
            y1: {
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Tỷ lệ (%)",
                },
                ticks: {
                    callback: function (value: any) {
                        return value + "%";
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
                    Báo cáo hành vi người dùng
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-blue-600">
                        <FontAwesomeIcon icon={faUserClock} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Lượt truy cập
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold">
                            {summary.totalVisitors.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {summary.newVisitors.toLocaleString()} mới /{" "}
                            {summary.returningVisitors.toLocaleString()} quay
                            lại
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-yellow-500">
                        <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Tỷ lệ chuyển đổi
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold">
                            {summary.conversionRate}%
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Tỷ lệ chuyển đổi từ khách đến mua
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-green-500">
                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Thời gian trên trang
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold">
                            {formatTime(summary.averageTimeOnSite)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Thời gian trung bình mỗi phiên
                        </div>
                    </div>
                </div>
            </div>

            {/* Visitors chart */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Lượng truy cập theo ngày
                </h3>
                <div className="h-80">
                    <Line data={visitorChartData} options={chartOptions} />
                </div>
            </div>

            {/* Most viewed products */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Sản phẩm được xem nhiều nhất
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Lượt xem
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Lượt mua
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Tỷ lệ chuyển đổi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostViewedProducts.map((product: any, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-gray-200"
                                >
                                    <td className="py-2 text-sm font-medium">
                                        {product.name}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {product.views.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {product.purchases.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {product.conversionRate}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Abandoned carts chart - replace Bar with Chart */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">Giỏ hàng bị bỏ rơi</h3>
                <div className="h-80">
                    <Chart
                        type="bar"
                        data={abandonedCartData}
                        options={abandonedCartOptions}
                    />
                </div>
            </div>

            {/* Conversion rates by page */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Tỷ lệ chuyển đổi theo trang
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Trang
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Lượt xem
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Chuyển đổi
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Tỷ lệ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {conversionData.map((item: any, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-gray-200"
                                >
                                    <td className="py-2 text-sm font-medium">
                                        {item.page}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.visits.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.conversions.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.rate}%
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

export default UserBehaviorReport;
