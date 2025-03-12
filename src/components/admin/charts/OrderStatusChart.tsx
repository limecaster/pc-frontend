"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

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
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState<
        { name: string; data: number[] }[]
    >([]);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        // Calculate total
        const total = data.counts.reduce((sum, count) => sum + count, 0);
        setTotalOrders(total);

        // Configure chart options with Flowbite styling
        setChartOptions({
            chart: {
                id: "order-status-chart",
                fontFamily: "Roboto, sans-serif",
                toolbar: {
                    show: false,
                },
                stacked: false,
                animations: {
                    enabled: true,
                    speed: 500,
                    dynamicAnimation: {
                        enabled: true,
                    }
                },
                background: 'transparent',
                // Add proper spacing
                offsetX: 0,
                offsetY: 0,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    barHeight: '60%', // Slightly reduced from 70%
                    dataLabels: {
                        position: 'center',
                    },
                    distributed: true,
                },
            },
            colors: [
                "#F97316", // Orange - Pending
                "#3B82F6", // Blue - Processing
                "#10B981", // Green - Shipped
                "#16BDCA", // Teal - Delivered
                "#EF4444", // Red - Cancelled
                "#8B5CF6", // Purple - Other
            ],
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#FFFFFF'],
                    fontSize: '14px',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 500,
                },
                formatter: function(val: number) {
                    // Only show label if there's enough room
                    if (val > 3) {
                        const percent = Math.round((val / total) * 100);
                        return `${val} (${percent}%)`;
                    }
                    return '';
                },
            },
            xaxis: {
                categories: data.statuses,
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "12px",
                        fontFamily: "Roboto, sans-serif",
                        fontWeight: 400,
                    },
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                // Ensure proper spacing
                tickAmount: 5,
            },
            yaxis: {
                labels: {
                    show: true,
                    align: 'left', // Changed from 'right' to 'left'
                    offsetX: -5, // Added negative offset to move labels away from bars
                    style: {
                        colors: "#6B7280",
                        fontSize: "12px",
                        fontFamily: "Roboto, sans-serif",
                        fontWeight: 500,
                    },
                    formatter: function(val: number) {
                        // Limit maximum characters for y-axis labels
                        const maxLength = 12;
                        const text = String(val);
                        if (text.length > maxLength) {
                            return text.substring(0, maxLength) + '...';
                        }
                        return text;
                    }
                },
                // Added to fix the width issue
                width: 150, // Give more width to y-axis
            },
            grid: {
                show: true,
                borderColor: "#F3F4F6",
                strokeDashArray: 2,
                position: 'back',
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0, // Changed from 16 to 0 to reduce left margin
                }
            },
            tooltip: {
                enabled: true,
                theme: "light",
                style: {
                    fontSize: '14px',
                    fontFamily: 'Roboto, sans-serif',
                },
                y: {
                    formatter: function(value: number) {
                        const percent = Math.round((value / total) * 100);
                        return `${value} đơn hàng (${percent}%)`;
                    }
                }
            },
            legend: {
                show: false,
            },
            // Add proper margin to overall chart
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 10 // Add some margin to left side
            },
            responsive: [
                {
                    breakpoint: 640,
                    options: {
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                borderRadiusApplication: 'top',
                            }
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        xaxis: {
                            labels: {
                                show: false,
                            }
                        }
                    }
                }
            ],
        });

        setChartSeries([
            {
                name: "Đơn hàng",
                data: data.counts,
            },
        ]);
    }, [data]);

    if (isLoading) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-5"></div>
                <div className="h-64 flex flex-col justify-center space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
                            <div className="h-4 bg-gray-200 rounded-md" 
                                style={{width: `${Math.floor(Math.random() * 60) + 20}%`}}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="text-sm font-medium text-gray-500">
                    Tổng: {totalOrders} đơn hàng
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                {typeof window !== "undefined" && (
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height="100%"
                    />
                )}
            </div>
        </div>
    );
};

export default OrderStatusChart;
