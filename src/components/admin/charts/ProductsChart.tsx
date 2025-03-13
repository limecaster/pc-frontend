"use client";

import { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";

interface ProductsChartProps {
    title?: string;
    data?: {
        categories: string[];
        counts: number[];
        totalCount?: number;  // Add optional totalCount field
    };
    isLoading?: boolean;
}

const ProductsChart: React.FC<ProductsChartProps> = ({
    title = "Product Distribution",
    data = { categories: [], counts: [], totalCount: 0 },
    isLoading = false,
}) => {
    // Use useMemo to create stable references
    const safeTitle = useMemo(
        () => (title ? String(title) : "Product Distribution"),
        [title],
    );
    const safeCategories = useMemo(
        () => (data?.categories ? [...data.categories] : []),
        [data?.categories],
    );
    const safeCounts = useMemo(
        () => (data?.counts ? [...data.counts] : []),
        [data?.counts],
    );
    
    // Use provided totalCount if available, otherwise sum the counts
    const totalProducts = useMemo(
        () => data?.totalCount || safeCounts.reduce((sum, count) => sum + count, 0),
        [data?.totalCount, safeCounts],
    );

    // Define colors for chart
    const backgroundColors = [
        "rgba(26, 86, 219, 0.8)", // Blue
        "rgba(253, 186, 140, 0.8)", // Orange
        "rgba(22, 189, 202, 0.8)", // Teal
        "rgba(192, 132, 252, 0.8)", // Purple
        "rgba(244, 63, 94, 0.8)", // Red
        "rgba(16, 185, 129, 0.8)", // Green
        "rgba(249, 115, 22, 0.8)", // Dark orange
        "rgba(139, 92, 246, 0.8)", // Indigo
        "rgba(6, 182, 212, 0.8)", // Cyan
        "rgba(99, 102, 241, 0.8)", // Indigo
        "rgba(236, 72, 153, 0.8)", // Pink
        "rgba(245, 158, 11, 0.8)", // Amber
    ];

    const chartData = {
        labels: safeCategories,
        datasets: [
            {
                data: safeCounts,
                backgroundColor: backgroundColors.slice(
                    0,
                    safeCategories.length,
                ),
                borderColor: backgroundColors.map((color) =>
                    color.replace("0.8", "1"),
                ),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    font: {
                        family: "Roboto, sans-serif",
                        size: 12,
                    },
                    color: "#4B5563",
                    boxWidth: 12,
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#111827",
                bodyColor: "#4B5563",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                padding: 10,
                usePointStyle: true,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const percentage = totalProducts
                            ? Math.round((value / totalProducts) * 100)
                            : 0;
                        return `${label}: ${value} sản phẩm (${percentage}%)`;
                    },
                },
            },
        },
        cutout: "70%",
    };

    if (isLoading) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-5"></div>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse w-48 h-48 rounded-full bg-gray-200"></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white text-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {safeTitle}
                </h3>
                <div className="text-sm font-medium text-gray-500">
                    Tổng: {totalProducts.toLocaleString()} sản phẩm
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                <ChartWrapper
                    type="doughnut"
                    data={chartData}
                    options={chartOptions}
                />
            </div>
        </div>
    );
};

export default ProductsChart;
