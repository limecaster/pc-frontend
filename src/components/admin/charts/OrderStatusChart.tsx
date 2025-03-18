"use client";

import { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";

// Define supported status labels as a type
type OrderStatusLabel =
    | "Chờ duyệt"
    | "Đã duyệt"
    | "Đang xử lý"
    | "Đang giao hàng"
    | "Đã giao hàng"
    | "Hoàn thành"
    | "Đã hủy"
    | "Thanh toán thành công"
    | "Thanh toán thất bại"
    | string; // Allow other string values too

interface OrderStatusChartProps {
    title?: string;
    data?: {
        statuses: string[];
        counts: number[];
    };
    isLoading?: boolean;
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
    title = "Order Status",
    data = { statuses: [], counts: [] },
    isLoading = false,
}) => {
    // Use useMemo for stable references to avoid re-renders
    const safeTitle = useMemo(
        () => (title ? String(title) : "Order Status"),
        [title],
    );
    const safeStatuses = useMemo(
        () => (data?.statuses ? [...data.statuses] : []),
        [data?.statuses],
    );
    const safeCounts = useMemo(
        () => (data?.counts ? [...data.counts] : []),
        [data?.counts],
    );
    const totalOrders = useMemo(
        () => safeCounts.reduce((sum, count) => sum + count, 0),
        [safeCounts],
    );

    // Define a mapping of status labels to colors using Record type
    const statusColorMap = useMemo<Record<OrderStatusLabel, string>>(
        () => ({
            "Chờ duyệt": "rgba(249, 115, 22, 0.8)", // Orange - Pending
            "Đã duyệt": "rgba(59, 130, 246, 0.8)", // Blue - Approved
            "Đang xử lý": "rgba(14, 165, 233, 0.8)", // Sky Blue - Processing
            "Đang giao hàng": "rgba(234, 179, 8, 0.8)", // Yellow - Shipping
            "Đã giao hàng": "rgba(34, 197, 94, 0.8)", // Green - Delivered
            "Hoàn thành": "rgba(13, 148, 136, 0.8)", // Teal - Completed
            "Đã hủy": "rgba(225, 29, 72, 0.8)", // Red - Cancelled
            "Thanh toán thành công": "rgba(16, 185, 129, 0.8)", // Emerald - Payment Success
            "Thanh toán thất bại": "rgba(239, 68, 68, 0.8)", // Red - Payment Failure
            // Default color for any other status
            default: "rgba(147, 51, 234, 0.8)", // Purple - Other
        }),
        [],
    );

    // Map status labels to their corresponding colors with type safety
    const backgroundColors = useMemo(() => {
        return safeStatuses.map(
            (status) =>
                // Use the default color if the status is not in the map
                statusColorMap[status as OrderStatusLabel] ||
                statusColorMap["default"],
        );
    }, [safeStatuses, statusColorMap]);

    // Create border colors by adjusting opacity
    const borderColors = useMemo(() => {
        return backgroundColors.map((color) => color.replace("0.8", "1"));
    }, [backgroundColors]);

    const chartData = {
        labels: safeStatuses,
        datasets: [
            {
                label: "Đơn hàng",
                data: safeCounts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6,
            },
        ],
    };

    const chartOptions = {
        indexAxis: "y" as const, // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#111827",
                bodyColor: "#4B5563",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw || 0;
                        const percentage = totalOrders
                            ? Math.round((value / totalOrders) * 100)
                            : 0;
                        return `${value} đơn hàng (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                color: "#FFFFFF",
                font: {
                    family: "Roboto, sans-serif",
                    size: 14,
                    weight: 500,
                },
                formatter: function (value: number) {
                    // Only show label if there's enough room
                    if (value > 3) {
                        const percent = Math.round((value / totalOrders) * 100);
                        return `${value} (${percent}%)`;
                    }
                    return "";
                },
                display: function (context: any) {
                    return context.dataset.data[context.dataIndex] > 3; // Only show if value > 3
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: "#F3F4F6",
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: "Roboto, sans-serif",
                        size: 12,
                    },
                    color: "#6B7280",
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "Roboto, sans-serif",
                        size: 12,
                    },
                    color: "#6B7280",
                },
            },
        },
    };

    if (isLoading) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-5"></div>
                <div className="h-64 flex flex-col justify-center space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
                            <div
                                className="h-4 bg-gray-200 rounded-md"
                                style={{
                                    width: `${
                                        Math.floor(Math.random() * 60) + 20
                                    }%`,
                                }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {safeTitle}
                </h3>
                <div className="text-sm font-medium text-gray-500">
                    Tổng: {totalOrders} đơn hàng
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                <ChartWrapper
                    type="bar"
                    data={chartData}
                    options={chartOptions}
                />
            </div>
        </div>
    );
};

export default OrderStatusChart;
