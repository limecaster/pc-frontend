"use client";

import { useEffect, useState, useMemo } from "react";
import ChartWrapper from "./ChartWrapper";

interface SalesChartProps {
    title?: string;
    data?: {
        dates: string[];
        sales: number[];
    };
    isLoading?: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({
    title = "Sales Overview",
    data = { dates: [], sales: [] },
    isLoading = false,
}) => {
    // Use useMemo to create stable references
    const safeTitle = useMemo(() => title ? String(title) : "Sales Overview", [title]);
    const safeDates = useMemo(() => data?.dates ? [...data.dates] : [], [data?.dates]);
    const safeSales = useMemo(() => data?.sales ? [...data.sales] : [], [data?.sales]);

    // Format currency for tooltips
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0 
        }).format(value);
    };
    
    // Prepare Chart.js data and options
    const chartData = {
        labels: safeDates,
        datasets: [
            {
                label: 'Doanh thu',
                data: safeSales,
                backgroundColor: 'rgba(26, 86, 219, 0.1)',
                borderColor: 'rgba(26, 86, 219, 1)',
                pointBackgroundColor: 'rgba(26, 86, 219, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(26, 86, 219, 1)',
                borderWidth: 2,
                tension: 0.3, // Smoother curve
                fill: true,
            },
        ],
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        family: 'Roboto, sans-serif',
                        size: 12,
                    },
                    color: '#6B7280',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#111827',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                titleFont: {
                    family: 'Roboto, sans-serif',
                    size: 14,
                },
                bodyFont: {
                    family: 'Roboto, sans-serif',
                    size: 12,
                },
                callbacks: {
                    label: function(context: any) {
                        return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#F3F4F6',
                    drawBorder: false,
                    tickLength: 0,
                },
                ticks: {
                    font: {
                        family: 'Roboto, sans-serif',
                        size: 12,
                    },
                    color: '#6B7280',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F3F4F6',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: 'Roboto, sans-serif',
                        size: 12,
                    },
                    color: '#6B7280',
                    callback: function(value: any) {
                        return formatCurrency(value);
                    }
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    if (isLoading) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <div className="flex justify-between mb-5">
                    <div>
                        <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse w-full">
                        <div className="grid grid-cols-12 gap-2 mb-2">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-40 bg-gray-200 rounded-md" 
                                    style={{height: `${Math.floor(Math.random() * 100) + 20}px`}}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-3 w-10 bg-gray-200 rounded-md"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{safeTitle}</h3>
                <div className="text-sm text-gray-500">
                    {safeDates.length > 0 && (
                        <span>
                            {safeDates[0]} - {safeDates[safeDates.length - 1]}
                        </span>
                    )}
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                <ChartWrapper
                    type="line"
                    data={chartData}
                    options={chartOptions}
                />
            </div>
        </div>
    );
};

export default SalesChart;
