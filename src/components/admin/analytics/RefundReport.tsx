"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faDownload,
    faExchangeAlt,
    faPercentage,
    faMoneyBill,
    faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import { getRefundReport } from "@/api/analytics";
import toast from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    ChartLegend,
);

interface RefundReportProps {
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

const RefundReport: React.FC<RefundReportProps> = ({ dateRange }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [refundData, setRefundData] = useState<any>(null);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    useEffect(() => {
        const fetchRefundData = async () => {
            setIsLoading(true);
            try {
                const data = await getRefundReport(
                    dateRange.startDate,
                    dateRange.endDate,
                );
                setRefundData(data);
            } catch (error) {
                console.error("Failed to fetch refund data:", error);
                toast.error(
                    "Không thể tải dữ liệu báo cáo hoàn tiền và hủy đơn",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchRefundData();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const exportData = () => {
        toast.success("Đang xuất báo cáo hoàn tiền và hủy đơn...");
    };

    // Prepare chart data for refund trends
    const refundTrendsData = {
        labels: refundData?.timeSeries.map((item: any) => item.date) || [],
        datasets: [
            {
                label: "Số lượng hoàn tiền",
                data:
                    refundData?.timeSeries.map((item: any) => item.refunds) ||
                    [],
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                yAxisID: "y",
                tension: 0.3,
            },
            {
                label: "Giá trị hoàn tiền",
                data:
                    refundData?.timeSeries.map((item: any) => item.amount) ||
                    [],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                yAxisID: "y1",
                tension: 0.3,
            },
        ],
    };

    // Prepare pie chart data for refund reasons
    const refundReasonsData = {
        labels: refundData?.reasons.map((item: any) => item.reason) || [],
        datasets: [
            {
                data:
                    refundData?.reasons.map((item: any) => item.percentage) ||
                    [],
                backgroundColor: COLORS,
                borderColor: COLORS.map((color) => `${color}DD`),
                borderWidth: 1,
            },
        ],
    };

    // Prepare bar chart data for cancellation reasons
    const cancellationReasonsData = {
        labels: refundData?.cancelReasons.map((item: any) => item.reason) || [],
        datasets: [
            {
                label: "Phần trăm",
                data:
                    refundData?.cancelReasons.map(
                        (item: any) => item.percentage,
                    ) || [],
                backgroundColor: "#8884d8",
                borderColor: "#6c63b6",
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Ngày",
                },
            },
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Số lượng",
                },
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Giá trị (VND)",
                },
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
                        if (context.dataset.yAxisID === "y1") {
                            return `${label}: ${formatCurrency(
                                context.parsed.y,
                            )}`;
                        }
                        return `${label}: ${context.parsed.y}`;
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
                        return `${label}: ${value}%`;
                    },
                },
            },
            legend: {
                position: "bottom" as const,
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y" as const,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.dataset.label || "";
                        const value = context.parsed.x || 0;
                        return `${label}: ${value}%`;
                    },
                },
            },
            legend: {
                position: "top" as const,
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
            {/* Header and summary cards - unchanged */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    Báo cáo hoàn tiền và hủy đơn
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
                    <div className="flex items-center text-red-600">
                        <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="mr-2"
                        />
                        <div className="text-sm text-gray-500 font-medium">
                            Tổng đơn hoàn tiền
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {refundData?.summary.totalRefunds}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-orange-600">
                        <FontAwesomeIcon icon={faPercentage} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Tỷ lệ hoàn tiền
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {refundData?.summary.refundRate}%
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-blue-600">
                        <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Tổng tiền hoàn
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {formatCurrency(refundData?.summary.totalRefundAmount)}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center text-green-600">
                        <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                        <div className="text-sm text-gray-500 font-medium">
                            Tỷ lệ đơn/hoàn
                        </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {refundData?.summary.refundToOrderRatio * 100}%
                    </div>
                </div>
            </div>

            {/* Refund Trends Chart */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Xu hướng hoàn tiền theo thời gian
                </h3>
                <div className="h-80">
                    <Line data={refundTrendsData} options={lineOptions} />
                </div>
            </div>

            {/* Refund Reasons and Cancellation Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Refund Reasons - Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">
                        Lý do hoàn tiền
                    </h3>
                    <div className="h-80">
                        <Pie data={refundReasonsData} options={pieOptions} />
                    </div>
                </div>

                {/* Cancellation Reasons - Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-medium mb-4">Lý do hủy đơn</h3>
                    <div className="h-80">
                        <Bar
                            data={cancellationReasonsData}
                            options={barOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Top Refunded Products - table is unchanged */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4">
                    Sản phẩm hoàn tiền nhiều nhất
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2 text-sm font-medium text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Số lượng hoàn
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Lý do phổ biến
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Tỷ lệ hoàn tiền
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    name: "Laptop Gaming Acer Nitro 5",
                                    refunds: 5,
                                    reason: "Sản phẩm lỗi",
                                    rate: "8.3%",
                                },
                                {
                                    name: "Màn hình Dell 27 inch",
                                    refunds: 3,
                                    reason: "Không đúng mô tả",
                                    rate: "6.7%",
                                },
                                {
                                    name: "RAM Kingston HyperX 16GB",
                                    refunds: 2,
                                    reason: "Phát hiện lỗi sau mua",
                                    rate: "5.9%",
                                },
                                {
                                    name: "Tai nghe SteelSeries Arctis 7",
                                    refunds: 2,
                                    reason: "Thay đổi quyết định",
                                    rate: "4.2%",
                                },
                                {
                                    name: "Chuột Logitech G Pro X",
                                    refunds: 1,
                                    reason: "Sản phẩm lỗi",
                                    rate: "2.1%",
                                },
                            ].map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-gray-200"
                                >
                                    <td className="py-2 text-sm font-medium">
                                        {item.name}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.refunds}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.reason}
                                    </td>
                                    <td className="py-2 text-sm text-right">
                                        {item.rate}
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

export default RefundReport;
