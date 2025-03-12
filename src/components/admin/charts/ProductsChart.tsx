"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface ProductsChartProps {
    title?: string;
    data?: {
        categories: string[];
        counts: number[];
    };
    isLoading?: boolean;
}

const ProductsChart: React.FC<ProductsChartProps> = ({
    title = "Product Distribution",
    data = { categories: [], counts: [] },
    isLoading = false,
}) => {
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState<number[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        // Calculate total from counts
        const total = data.counts.reduce((sum, count) => sum + count, 0);
        setTotalProducts(total);

        // Configure chart options with Flowbite styling
        setChartOptions({
            chart: {
                id: "products-chart",
                fontFamily: "Inter, sans-serif",
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                    },
                },
                animations: {
                    enabled: true,
                    speed: 500,
                    animateGradually: {
                        enabled: true,
                        delay: 150,
                    },
                },
                background: 'transparent',
            },
            labels: data.categories,
            colors: [
                "#1A56DB", // Blue
                "#FDBA8C", // Orange
                "#16BDCA", // Teal
                "#C084FC", // Purple
                "#F43F5E", // Red
                "#10B981", // Green
                "#F97316", // Dark orange
                "#8B5CF6", // Indigo
                "#06B6D4", // Cyan
                "#6366F1", // Indigo
                "#EC4899", // Pink
                "#F59E0B", // Amber
            ],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '22px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                color: '#374151',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 400,
                                color: '#6B7280',
                                offsetY: 2,
                            },
                            total: {
                                show: true,
                                label: 'Tổng',
                                fontSize: '16px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                color: '#111827',
                                formatter: function () {
                                    return total.toString();
                                }
                            }
                        }
                    }
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.9,
                    }
                },
                active: {
                    filter: {
                        type: 'darken',
                        value: 0.5,
                    }
                }
            },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                formatter: function(seriesName: string, opts: any) {
                    return seriesName + ': ' + opts.w.globals.series[opts.seriesIndex];
                },
                labels: {
                    colors: "#4B5563",
                },
                markers: {
                    width: 12,
                    height: 12,
                    radius: 6,
                }
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['#FFFFFF']
            },
            tooltip: {
                enabled: true,
                theme: "light",
                style: {
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                },
                y: {
                    formatter: function(value: number) {
                        return value + ' sản phẩm';
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 640,
                    options: {
                        chart: {
                            height: 300,
                        },
                        legend: {
                            position: "bottom",
                            offsetY: 0,
                        },
                    },
                },
            ],
        });

        setChartSeries(data.counts);
    }, [data]);

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
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="text-sm font-medium text-gray-500">
                    Tổng: {totalProducts} sản phẩm
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                {typeof window !== "undefined" && (
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="donut"
                        height="100%"
                    />
                )}
            </div>
        </div>
    );
};

export default ProductsChart;
