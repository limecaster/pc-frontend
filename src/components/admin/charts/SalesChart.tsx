"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

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
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState<
        { name: string; data: number[] }[]
    >([]);

    useEffect(() => {
        // Configure chart options with Flowbite styling
        setChartOptions({
            chart: {
                id: "sales-chart",
                fontFamily: "Inter, sans-serif",
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                    },
                    export: {
                        csv: {
                            filename: "sales-data",
                            columnDelimiter: ',',
                            headerCategory: 'Date',
                            headerValue: 'Value',
                        },
                        svg: {
                            filename: 'sales-chart',
                        },
                        png: {
                            filename: 'sales-chart',
                        }
                    },
                    autoSelected: 'zoom'
                },
                zoom: {
                    enabled: true,
                    type: 'x',
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                },
                background: 'transparent',
            },
            colors: ["#1A56DB"],
            xaxis: {
                categories: data.dates,
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "12px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                    },
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "12px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                    },
                    formatter: (value: number) => 
                        new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0 
                        }).format(value),
                },
            },
            stroke: {
                curve: "smooth",
                width: 3,
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "vertical",
                    shadeIntensity: 0.5,
                    opacityFrom: 0.6,
                    opacityTo: 0.1,
                    stops: [0, 100],
                },
            },
            dataLabels: {
                enabled: false,
            },
            grid: {
                show: true,
                borderColor: "#F3F4F6",
                strokeDashArray: 1,
                padding: {
                    left: 0,
                    right: 0,
                },
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: "light",
                style: {
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                },
                y: {
                    formatter: (value: number) => 
                        new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0 
                        }).format(value),
                },
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'right',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                markers: {
                    width: 12,
                    height: 12,
                    radius: 12,
                }
            },
            responsive: [
                {
                    breakpoint: 640,
                    options: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
            ],
        });

        setChartSeries([
            {
                name: "Doanh thu",
                data: data.sales,
            },
        ]);
    }, [data]);

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
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="text-sm text-gray-500">
                    {data.dates.length > 0 && (
                        <span>
                            {data.dates[0]} - {data.dates[data.dates.length - 1]}
                        </span>
                    )}
                </div>
            </div>
            <div className="chart-container" style={{ height: "320px" }}>
                {typeof window !== "undefined" && (
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="area"
                        height="100%"
                    />
                )}
            </div>
        </div>
    );
};

export default SalesChart;
