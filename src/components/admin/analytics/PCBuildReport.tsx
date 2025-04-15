"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faDesktop,
    faTools,
    faRobot,
    faFile,
    faShoppingCart,
    faExchangeAlt,
    faCommentDots,
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
    ArcElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import { getPCBuildReport } from "@/api/analytics";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    ChartLegend,
    Filler,
    ArcElement,
);

interface PCBuildReportProps {
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

interface WordCloudData {
    text: string;
    value: number;
}

interface PCBuildSummary {
    totalAutoBuildRequests: number;
    totalManualBuildSessions: number;
    autoBuildConversionRate: number;
    manualBuildConversionRate: number;
    averageAutoBuildPrice: number;
    averageManualBuildPrice: number;
    mostCommonAutoBuildInputs: { input: string; count: number }[];
    mostPopularComponents: { component: string; name: string; count: number }[];
}

interface PCBuildTimeSeriesData {
    date: string;
    autoBuildRequests: number;
    manualBuildRequests: number;
    autoBuildSaves: number;
    manualBuildSaves: number;
    autoBuildToCart: number;
    manualBuildToCart: number;
}

interface PCBuildAnalyticsResponse {
    summary: {
        totalPCBuildEvents: number;
        autoBuildRequests: number;
        autoBuildAddToCart: number;
        autoBuildCustomize: number;
        manualBuildAddToCart: number;
        manualBuildComponentSelect: number;
        manualBuildSaveConfig: number;
        pcBuildViews: number;
        autoBuildConversionRate: number;
        customizationRate: number;
        manualBuildConversionRate: number;
        averageAutoBuildPrice?: number;
        averageManualBuildPrice?: number;
    };
    timeSeriesData: any[];
    popularComponents: any[];
    buildConfigurations: any[];
    wordCloud: {
        words: WordCloudData[];
        purposeAnalysis: WordCloudData[];
    };
}

const PCBuildStatsCards: React.FC<{ summary: PCBuildSummary }> = ({
    summary,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Yêu cầu tự động xây dựng
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {summary.totalAutoBuildRequests.toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <FontAwesomeIcon
                            icon={faRobot}
                            className="text-blue-500 text-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            PC xây dựng thủ công
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {summary.totalManualBuildSessions.toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                        <FontAwesomeIcon
                            icon={faTools}
                            className="text-green-500 text-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Tỷ lệ chuyển đổi tự động
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {summary.autoBuildConversionRate.toFixed(2)}%
                        </h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                        <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="text-purple-500 text-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Tỷ lệ chuyển đổi thủ công
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {summary.manualBuildConversionRate.toFixed(2)}%
                        </h3>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                        <FontAwesomeIcon
                            icon={faShoppingCart}
                            className="text-orange-500 text-xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// PC Build Usage Trends Chart
const UsageTrendsChart: React.FC<{
    timeSeriesData: PCBuildTimeSeriesData[];
}> = ({ timeSeriesData }) => {
    const chartData = {
        labels: timeSeriesData.map((item) => item.date),
        datasets: [
            {
                label: "Yêu cầu tự động",
                data: timeSeriesData.map((item) => item.autoBuildRequests),
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: "Yêu cầu thủ công",
                data: timeSeriesData.map((item) => item.manualBuildRequests),
                borderColor: "rgba(16, 185, 129, 1)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Xu hướng sử dụng tính năng xây dựng PC",
                font: {
                    size: 16,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Số lượng yêu cầu",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Ngày",
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Line data={chartData} options={options} />
        </div>
    );
};

// Conversion Rate Chart
const ConversionRateChart: React.FC<{
    timeSeriesData: PCBuildTimeSeriesData[];
}> = ({ timeSeriesData }) => {
    const conversionData = timeSeriesData.map((item) => {
        const autoConversion =
            item.autoBuildRequests > 0
                ? (item.autoBuildToCart / item.autoBuildRequests) * 100
                : 0;

        const manualConversion =
            item.manualBuildRequests > 0
                ? (item.manualBuildToCart / item.manualBuildRequests) * 100
                : 0;

        return {
            date: item.date,
            autoConversion,
            manualConversion,
        };
    });

    const chartData = {
        labels: conversionData.map((item) => item.date),
        datasets: [
            {
                label: "Tỷ lệ chuyển đổi tự động",
                data: conversionData.map((item) => item.autoConversion),
                backgroundColor: "rgba(124, 58, 237, 0.8)",
                borderRadius: 6,
            },
            {
                label: "Tỷ lệ chuyển đổi thủ công",
                data: conversionData.map((item) => item.manualConversion),
                backgroundColor: "rgba(245, 158, 11, 0.8)",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Tỷ lệ chuyển đổi xây dựng PC",
                font: {
                    size: 16,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Tỷ lệ chuyển đổi (%)",
                },
                max: 100,
            },
            x: {
                title: {
                    display: true,
                    text: "Ngày",
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Bar data={chartData} options={options} />
        </div>
    );
};

const TopBuildInputsComponent: React.FC<{
    topInputs: { input: string; count: number }[];
    topComponents: { component: string; name: string; count: number }[];
}> = ({ topInputs, topComponents }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <FontAwesomeIcon
                        icon={faRobot}
                        className="mr-2 text-blue-500"
                    />
                    Top yêu cầu xây dựng tự động
                </h3>
                <div className="overflow-y-auto max-h-80">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Yêu cầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số lượng
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topInputs.map((item, index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                    }
                                >
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                                        {item.input}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <FontAwesomeIcon
                        icon={faDesktop}
                        className="mr-2 text-green-500"
                    />
                    Linh kiện phổ biến nhất
                </h3>
                <div className="overflow-y-auto max-h-80">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số lượng
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topComponents.map((item, index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                    }
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.component}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.count}
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

// Word Cloud Component
const UserInputWordCloud: React.FC<{
    wordCloudData: WordCloudData[];
    purposeAnalysisData: WordCloudData[];
}> = ({ wordCloudData, purposeAnalysisData }) => {
    // For visualization when react-d3-cloud is not available,
    // display a tabular view of top words
    const topWords = wordCloudData.slice(0, 20);
    const purposeAnalysis = purposeAnalysisData.slice(0, 10);

    // Calculate the maximum value for scaling
    const maxValue =
        wordCloudData.length > 0
            ? Math.max(...wordCloudData.map((word) => word.value))
            : 1;

    const maxPurposeValue =
        purposeAnalysisData.length > 0
            ? Math.max(...purposeAnalysisData.map((word) => word.value))
            : 1;

    // Custom simple word cloud with CSS
    const renderSimpleWordCloud = (words: WordCloudData[], maxVal: number) => {
        return (
            <div className="flex flex-wrap justify-center gap-2 p-4">
                {words.slice(0, 30).map((word, index) => {
                    // Scale font size between 12px and 32px based on value
                    const fontSize = 12 + (word.value / maxVal) * 20;
                    // Alternate colors
                    const colors = [
                        "#1d4ed8", // blue-700
                        "#2563eb", // blue-600
                        "#3b82f6", // blue-500
                        "#60a5fa", // blue-400
                        "#93c5fd", // blue-300
                    ];
                    const color = colors[index % colors.length];

                    return (
                        <div
                            key={index}
                            className="inline-block p-1"
                            style={{
                                fontSize: `${fontSize}px`,
                                color,
                                fontWeight:
                                    word.value > maxVal / 2 ? "bold" : "normal",
                            }}
                        >
                            {word.text}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPurposeWordCloud = (words: WordCloudData[], maxVal: number) => {
        return (
            <div className="flex flex-wrap justify-center gap-2 p-4">
                {words.slice(0, 20).map((word, index) => {
                    // Scale font size between 12px and 30px based on value
                    const fontSize = 12 + (word.value / maxVal) * 18;
                    // Alternate colors
                    const colors = [
                        "#6d28d9", // purple-700
                        "#7c3aed", // purple-600
                        "#8b5cf6", // purple-500
                        "#a78bfa", // purple-400
                        "#c4b5fd", // purple-300
                    ];
                    const color = colors[index % colors.length];

                    return (
                        <div
                            key={index}
                            className="inline-block p-1"
                            style={{
                                fontSize: `${fontSize}px`,
                                color,
                                fontWeight:
                                    word.value > maxVal / 2 ? "bold" : "normal",
                            }}
                        >
                            {word.text}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faCommentDots}
                        className="mr-2 text-blue-500"
                    />
                    Phân tích yêu cầu từ người dùng
                </h3>

                {wordCloudData.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-2 min-h-[300px] flex items-center justify-center">
                        {renderSimpleWordCloud(wordCloudData, maxValue)}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        Không có đủ dữ liệu để hiển thị biểu đồ từ khóa
                    </p>
                )}

                <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">
                        Chi tiết từ khóa phổ biến nhất
                    </h4>
                    <div className="overflow-auto max-h-[200px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Từ khóa
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Số lần xuất hiện
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topWords.map((word, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {word.text}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {word.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faRobot}
                        className="mr-2 text-purple-500"
                    />
                    Phân tích mục đích xây dựng PC
                </h3>

                {purposeAnalysisData.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-2 min-h-[300px] flex items-center justify-center">
                        {renderPurposeWordCloud(
                            purposeAnalysisData,
                            maxPurposeValue,
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        Không có đủ dữ liệu để hiển thị biểu đồ từ khóa
                    </p>
                )}

                <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">
                        Mục đích và Ngân sách phổ biến
                    </h4>
                    <div className="overflow-auto max-h-[200px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Mục đích / Ngân sách
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Số lượng
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {purposeAnalysis.map((purpose, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {purpose.text}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {purpose.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PCBuildReport: React.FC<PCBuildReportProps> = ({ dateRange }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PCBuildSummary>({
        totalAutoBuildRequests: 0,
        totalManualBuildSessions: 0,
        autoBuildConversionRate: 0,
        manualBuildConversionRate: 0,
        averageAutoBuildPrice: 0,
        averageManualBuildPrice: 0,
        mostCommonAutoBuildInputs: [],
        mostPopularComponents: [],
    });
    const [timeSeriesData, setTimeSeriesData] = useState<
        PCBuildTimeSeriesData[]
    >([]);
    const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
    const [purposeAnalysisData, setPurposeAnalysisData] = useState<
        WordCloudData[]
    >([]);

    useEffect(() => {
        const fetchPCBuildAnalytics = async () => {
            setLoading(true);
            try {
                const data: PCBuildAnalyticsResponse = await getPCBuildReport(
                    dateRange.startDate,
                    dateRange.endDate,
                );

                const mappedSummary: PCBuildSummary = {
                    totalAutoBuildRequests: data.summary.autoBuildRequests || 0,
                    totalManualBuildSessions:
                        data.summary.manualBuildComponentSelect ||
                        data.summary.manualBuildAddToCart ||
                        0,
                    autoBuildConversionRate:
                        data.summary.autoBuildConversionRate || 0,
                    manualBuildConversionRate:
                        data.summary.manualBuildConversionRate || 0,
                    averageAutoBuildPrice:
                        data.summary.averageAutoBuildPrice || 0,
                    averageManualBuildPrice:
                        data.summary.averageManualBuildPrice || 0,
                    mostCommonAutoBuildInputs:
                        data.buildConfigurations?.map(
                            (config: { userInput: string; count: number }) => ({
                                input: `${config.userInput}`,
                                count: config.count || 0,
                            }),
                        ) || [],
                    mostPopularComponents:
                        data.popularComponents?.map(
                            (component: {
                                type: string;
                                name: string;
                                count: number;
                            }) => ({
                                component:
                                    component.type || "Unknown component",
                                name: component.name || "Unknown name",
                                count: component.count || 0,
                            }),
                        ) || [],
                };

                // Get time series data
                const mappedTimeSeriesData =
                    data.timeSeriesData?.map((item: any) => ({
                        date: new Date(item.date)
                            .toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                            })
                            .split("/")
                            .join("/"),
                        autoBuildRequests: item.autoBuildRequests || 0,
                        manualBuildRequests: item.manualBuildAddToCart || 0,
                        autoBuildSaves: item.autoBuildCustomize || 0,
                        manualBuildSaves: 0, // Not available in current data
                        autoBuildToCart: item.autoBuildAddToCart || 0,
                        manualBuildToCart: item.manualBuildAddToCart || 0,
                    })) || [];

                // Get word cloud data
                const wordCloudWords = data.wordCloud?.words || [];
                const purposeAnalysis = data.wordCloud?.purposeAnalysis || [];

                setSummary(mappedSummary);
                setTimeSeriesData(mappedTimeSeriesData);
                setWordCloudData(wordCloudWords);
                setPurposeAnalysisData(purposeAnalysis);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching PC build analytics:", error);
                toast.error(
                    "Không thể tải dữ liệu phân tích PC. Đang hiển thị dữ liệu mẫu.",
                );
                // Generate mock data if API fetch fails
                generateMockData();
                setLoading(false);
            }
        };

        const generateMockData = () => {
            const endDate = dateRange.endDate;

            // Generate mock summary data
            const mockSummary: PCBuildSummary = {
                totalAutoBuildRequests: 487,
                totalManualBuildSessions: 152,
                autoBuildConversionRate: 18.3,
                manualBuildConversionRate: 24.1,
                averageAutoBuildPrice: 22500000,
                averageManualBuildPrice: 25800000,
                mostCommonAutoBuildInputs: [
                    { input: "Gaming", count: 215 },
                    { input: "Đồ họa", count: 87 },
                    { input: "Làm việc văn phòng", count: 65 },
                    { input: "Streaming", count: 58 },
                    { input: "Học tập", count: 42 },
                ],
                mostPopularComponents: [
                    { component: "CPU", name: "AMD Ryzen 7 5800X", count: 145 },
                    { component: "GPU", name: "NVIDIA RTX 3070", count: 126 },
                    { component: "RAM", name: "32GB DDR4 3200MHz", count: 112 },
                    {
                        component: "SSD",
                        name: "Samsung 970 EVO 1TB",
                        count: 98,
                    },
                    {
                        component: "Motherboard",
                        name: "ASUS ROG B550-F",
                        count: 84,
                    },
                ],
            };

            // Generate mock time series data
            const mockTimeSeriesData: PCBuildTimeSeriesData[] = [];

            for (let i = 9; i >= 0; i--) {
                const date = new Date();
                date.setDate(endDate.getDate() - i);
                const dateString = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;

                const autoBuildRequests = Math.floor(Math.random() * 50) + 50;
                const manualBuildRequests = Math.floor(Math.random() * 30) + 20;
                const manualBuildComponentSelects =
                    Math.floor(Math.random() * 40) + 35; // Higher than views since users can select multiple components
                const autoBuildSaves = Math.floor(
                    autoBuildRequests * (Math.random() * 0.2 + 0.1),
                );
                const manualBuildSaves = Math.floor(
                    manualBuildComponentSelects * (Math.random() * 0.15 + 0.1),
                );
                const autoBuildToCart = Math.floor(
                    autoBuildRequests * (Math.random() * 0.15 + 0.05),
                );
                const manualBuildToCart = Math.floor(
                    manualBuildComponentSelects * (Math.random() * 0.2 + 0.1),
                );

                mockTimeSeriesData.push({
                    date: dateString,
                    autoBuildRequests,
                    manualBuildRequests,
                    autoBuildSaves,
                    manualBuildSaves,
                    autoBuildToCart,
                    manualBuildToCart,
                });
            }

            // Generate mock word cloud data
            const mockWordCloudData: WordCloudData[] = [
                { text: "gaming", value: 42 },
                { text: "chơi", value: 38 },
                { text: "game", value: 35 },
                { text: "văn phòng", value: 22 },
                { text: "đồ họa", value: 19 },
                { text: "thiết kế", value: 18 },
                { text: "làm việc", value: 15 },
                { text: "stream", value: 14 },
                { text: "học tập", value: 12 },
                { text: "pc", value: 28 },
                { text: "máy tính", value: 25 },
                { text: "cấu hình", value: 20 },
                { text: "mạnh", value: 18 },
                { text: "nhanh", value: 16 },
                { text: "gtx", value: 12 },
                { text: "nvidia", value: 11 },
                { text: "amd", value: 10 },
                { text: "intel", value: 10 },
                { text: "render", value: 9 },
                { text: "mượt", value: 8 },
            ];

            // Generate mock purpose analysis data
            const mockPurposeAnalysis: WordCloudData[] = [
                { text: "gaming", value: 42 },
                { text: "chơi", value: 38 },
                { text: "game", value: 35 },
                { text: "văn phòng", value: 22 },
                { text: "đồ họa", value: 19 },
                { text: "thiết kế", value: 18 },
                { text: "làm việc", value: 15 },
                { text: "stream", value: 14 },
                { text: "học tập", value: 12 },
                { text: "25 triệu", value: 28 },
                { text: "20 triệu", value: 22 },
                { text: "30 triệu", value: 19 },
                { text: "15 triệu", value: 14 },
                { text: "40 triệu", value: 8 },
            ];

            setSummary(mockSummary);
            setTimeSeriesData(mockTimeSeriesData);
            setWordCloudData(mockWordCloudData);
            setPurposeAnalysisData(mockPurposeAnalysis);
        };

        fetchPCBuildAnalytics();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-blue-500 text-4xl"
                />
            </div>
        );
    }

    return (
        <div className="pc-build-report">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Phân tích tính năng xây dựng PC
            </h2>

            {/* Summary Cards */}
            <PCBuildStatsCards summary={summary} />

            {/* Word Cloud Analysis */}
            <UserInputWordCloud
                wordCloudData={wordCloudData}
                purposeAnalysisData={purposeAnalysisData}
            />

            {/* Usage Trends Chart */}
            <UsageTrendsChart timeSeriesData={timeSeriesData} />

            {/* Conversion Rate Chart */}
            <ConversionRateChart timeSeriesData={timeSeriesData} />

            {/* Top Inputs & Components */}
            <TopBuildInputsComponent
                topInputs={summary.mostCommonAutoBuildInputs}
                topComponents={summary.mostPopularComponents}
            />

            {/* Average Price Comparison */}
            {/* <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <FontAwesomeIcon
                        icon={faShoppingCart}
                        className="mr-2 text-blue-500"
                    />
                    Giá trung bình của cấu hình PC
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <h4 className="text-md font-medium text-gray-700">
                            Xây dựng tự động
                        </h4>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {summary.averageAutoBuildPrice.toLocaleString()}đ
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <h4 className="text-md font-medium text-gray-700">
                            Xây dựng thủ công
                        </h4>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {summary.averageManualBuildPrice.toLocaleString()}đ
                        </p>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default PCBuildReport;
