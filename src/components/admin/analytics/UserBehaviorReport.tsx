"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown,
    faSpinner,
    faUsers,
    faUserPlus,
    faSync,
    faChartLine,
    faEye,
    faShoppingCart,
    faClock,
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
import { Line, Chart, Bar, Doughnut } from "react-chartjs-2";
import {
    getUserBehaviorReport,
    getMostViewedProducts,
    getConversionRates,
    getAbandonedCarts,
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
    ChartTooltip,
    ChartLegend,
    Filler,
    ArcElement,
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

interface VisitorDataPoint {
    date: string;
    visitors: number;
    newVisitors: number;
    returningVisitors: number;
}

interface MostViewedProduct {
    name: string;
    views: number;
    purchases: number;
    conversionRate: number;
}

interface ConversionRateData {
    page: string;
    visits: number;
    conversions: number;
    rate: number;
}

interface AbandonedCartData {
    date: string;
    totalCarts: number;
    abandonedCarts: number;
    rate: number;
}

interface SummaryCardsProps {
    behaviorSummary: {
        totalVisitors: number;
        newVisitors: number;
        returningVisitors: number;
        averageTimeOnSite: number;
        bounceRate: number;
        conversionRate: number;
    };
    formatTime: (seconds: number) => string;
}
const SummaryCards: React.FC<SummaryCardsProps> = ({
    behaviorSummary,
    formatTime,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">
                            Tổng lượt truy cập
                        </div>
                        <div className="flex items-end mt-2">
                            <div className="text-2xl font-bold">
                                {behaviorSummary.totalVisitors.toLocaleString(
                                    "vi-VN",
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faUsers}
                            className="text-blue-600"
                        />
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Phân bổ:</span>{" "}
                    <span className="text-green-600">
                        {behaviorSummary.newVisitors.toLocaleString("vi-VN")}{" "}
                        mới
                    </span>{" "}
                    /{" "}
                    <span className="text-amber-600">
                        {behaviorSummary.returningVisitors.toLocaleString(
                            "vi-VN",
                        )}{" "}
                        quay lại
                    </span>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">
                            Tỷ lệ chuyển đổi
                        </div>
                        <div className="flex items-end mt-2">
                            <div className="text-2xl font-bold">
                                {behaviorSummary.conversionRate}%
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faChartLine}
                            className="text-indigo-600"
                        />
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Mục tiêu:</span> 5.0% (Hiệu
                    suất{" "}
                    {behaviorSummary.conversionRate >= 5
                        ? "tốt"
                        : "cần cải thiện"}
                    )
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">
                            Tỷ lệ thoát
                        </div>
                        <div className="flex items-end mt-2">
                            <div className="text-2xl font-bold">
                                {behaviorSummary.bounceRate}%
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faSync}
                            className="text-red-600"
                        />
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Thời gian xem TB:</span>{" "}
                    {formatTime(behaviorSummary.averageTimeOnSite)}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500 font-medium">
                            Độ dài phiên trung bình
                        </div>
                        <div className="flex items-end mt-2">
                            <div className="text-2xl font-bold">
                                {formatTime(behaviorSummary.averageTimeOnSite)}
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faClock}
                            className="text-blue-600"
                        />
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">
                        {behaviorSummary.averageTimeOnSite > 180
                            ? "Thời gian tương tác tốt (trên 3 phút)"
                            : "Cần cải thiện tương tác (dưới 3 phút)"}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface SessionDistribution {
    range: string;
    percentage: number;
}

interface VisitorsChartProps {
    visitorData: {
        date: string;
        visitors: number;
        newVisitors: number;
        returningVisitors: number;
    }[];
    averageTimeOnSite: number;
    sessionDistribution: SessionDistribution[];
}

const VisitorsChart: React.FC<VisitorsChartProps> = ({
    visitorData,
    averageTimeOnSite,
    sessionDistribution,
}) => {
    const visitorChartData = {
        labels: visitorData.map((item) => item.date),
        datasets: [
            {
                label: "Tổng lượt truy cập",
                data: visitorData.map((item) => item.visitors),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Người dùng mới",
                data: visitorData.map((item) => item.newVisitors),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Người dùng quay lại",
                data: visitorData.map((item) => item.returningVisitors),
                borderColor: "#F59E0B",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };
    const visitorChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Lượt truy cập" },
            },
        },
        interaction: {
            mode: "nearest" as const,
            axis: "x" as const,
            intersect: false,
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-medium mb-4">Lượt truy cập</h3>
                <div className="h-80">
                    <Line
                        data={visitorChartData}
                        options={visitorChartOptions}
                    />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faClock}
                        className="text-blue-500 mr-2"
                    />
                    Phân bố thời gian phiên
                </h3>
                <div className="mt-4">
                    {sessionDistribution.map((item) => (
                        <div key={item.range} className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                    {item.range}
                                </span>
                                <span className="font-medium">
                                    {item.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">
                            Thời gian phiên trung bình
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                            {Math.floor(averageTimeOnSite / 60)}:
                            {(averageTimeOnSite % 60)
                                .toString()
                                .padStart(2, "0")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProductReportsProps {
    mostViewedProducts: {
        name: string;
        views: number;
        purchases: number;
        conversionRate: number;
    }[];
    conversionRates: {
        page: string;
        visits: number;
        conversions: number;
        rate: number;
    }[];
}
const ProductReports: React.FC<ProductReportsProps> = ({
    mostViewedProducts,
    conversionRates,
}) => {
    const conversionChartData = {
        labels: conversionRates.map((item) => item.page),
        datasets: [
            {
                label: "Tỷ lệ chuyển đổi (%)",
                data: conversionRates.map((item) => item.rate),
                backgroundColor: "rgba(99, 102, 241, 0.6)",
                borderColor: "#6366F1",
                borderWidth: 1,
            },
        ],
    };
    const conversionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `Tỷ lệ: ${context.parsed.y.toFixed(1)}% (${conversionRates[context.dataIndex].conversions}/${conversionRates[context.dataIndex].visits})`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Tỷ lệ chuyển đổi (%)" },
            },
        },
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faEye}
                        className="text-blue-500 mr-2"
                    />
                    Sản phẩm được xem nhiều nhất
                </h3>
                <div className="overflow-auto">
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
                                    Mua
                                </th>
                                <th className="text-right py-2 text-sm font-medium text-gray-500">
                                    Tỷ lệ chuyển đổi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostViewedProducts.length > 0 ? (
                                mostViewedProducts.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-gray-200"
                                    >
                                        <td className="py-2 text-sm font-medium">
                                            {product.name}
                                        </td>
                                        <td className="py-2 text-sm text-right">
                                            {product.views.toLocaleString(
                                                "vi-VN",
                                            )}
                                        </td>
                                        <td className="py-2 text-sm text-right">
                                            {product.purchases.toLocaleString(
                                                "vi-VN",
                                            )}
                                        </td>
                                        <td
                                            className={`py-2 text-sm text-right font-medium ${
                                                product.conversionRate > 3
                                                    ? "text-green-600"
                                                    : product.conversionRate >
                                                        1.5
                                                      ? "text-amber-600"
                                                      : "text-gray-600"
                                            }`}
                                        >
                                            {product.conversionRate}%
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-t border-gray-200">
                                    <td
                                        colSpan={4}
                                        className="py-4 text-center text-sm text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faChartLine}
                        className="text-indigo-500 mr-2"
                    />
                    Tỷ lệ chuyển đổi theo trang
                </h3>
                <div className="h-64">
                    {conversionRates.length > 0 ? (
                        <Bar
                            data={conversionChartData}
                            options={conversionChartOptions}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Không có dữ liệu
                        </div>
                    )}
                </div>
            </div> */}
        </div>
    );
};

interface AbandonedCartReportProps {
    abandonedCarts: {
        date: string;
        totalCarts: number;
        abandonedCarts: number;
        rate: number;
    }[];
}
const AbandonedCartReport: React.FC<AbandonedCartReportProps> = ({
    abandonedCarts,
}) => {
    const abandonedCartChartData = {
        labels: abandonedCarts.map((item) => item.date),
        datasets: [
            {
                type: "line" as const,
                label: "Tỷ lệ bỏ giỏ hàng (%)",
                data: abandonedCarts.map((item) => item.rate),
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                yAxisID: "y1",
                borderWidth: 2,
                tension: 0.4,
            },
            {
                type: "bar" as const,
                label: "Giỏ hàng đã tạo",
                data: abandonedCarts.map((item) => item.totalCarts),
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "#3B82F6",
                borderWidth: 1,
                yAxisID: "y",
            },
            {
                type: "bar" as const,
                label: "Giỏ hàng bị bỏ",
                data: abandonedCarts.map((item) => item.abandonedCarts),
                backgroundColor: "rgba(239, 68, 68, 0.6)",
                borderColor: "#EF4444",
                borderWidth: 1,
                yAxisID: "y",
            },
        ],
    };
    const abandonedCartChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: { display: true, text: "Số lượng giỏ hàng" },
            },
            y1: {
                beginAtZero: true,
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: { drawOnChartArea: false },
                min: 0,
                max: 100,
                title: { display: true, text: "Tỷ lệ bỏ giỏ hàng (%)" },
            },
        },
    };
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-red-500 mr-2"
                />
                Giỏ hàng bị bỏ
            </h3>
            <div className="h-80">
                {abandonedCarts.length > 0 ? (
                    <Chart
                        data={abandonedCartChartData}
                        options={abandonedCartChartOptions}
                        type={"line"}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Không có dữ liệu
                    </div>
                )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
                <p>
                    <span className="font-medium">
                        Tỷ lệ bỏ giỏ hàng trung bình:
                    </span>{" "}
                    {abandonedCarts.length > 0
                        ? (
                              abandonedCarts.reduce(
                                  (acc, cart) => acc + cart.rate,
                                  0,
                              ) / abandonedCarts.length
                          ).toFixed(1)
                        : "0"}
                    %
                </p>
                <p className="mt-1">
                    <span className="font-medium">Tổng giỏ hàng bị bỏ:</span>{" "}
                    {abandonedCarts
                        .reduce((acc, cart) => acc + cart.abandonedCarts, 0)
                        .toLocaleString("vi-VN")}
                </p>
            </div>
        </div>
    );
};

interface KeyInsightsProps {
    behaviorSummary: {
        newVisitors: number;
        returningVisitors: number;
        conversionRate: number;
    };
    abandonedCarts: {
        rate: number;
    }[];
}
const KeyInsights: React.FC<KeyInsightsProps> = ({
    behaviorSummary,
    abandonedCarts,
}) => {
    const avgAbandonRate =
        abandonedCarts.length > 0
            ? abandonedCarts.reduce((acc, cart) => acc + cart.rate, 0) /
              abandonedCarts.length
            : 0;
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-medium mb-4">Phân tích & Đề xuất</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
                    <h4 className="font-bold text-sm mb-1">Người dùng</h4>
                    <p className="text-sm">
                        {behaviorSummary.newVisitors >
                        behaviorSummary.returningVisitors * 2
                            ? "Tỷ lệ người dùng mới cao. Cần tập trung vào chiến lược giữ chân khách hàng."
                            : behaviorSummary.returningVisitors >
                                behaviorSummary.newVisitors
                              ? "Tỷ lệ khách quay lại cao. Tiếp tục duy trì trải nghiệm người dùng tốt."
                              : "Cân bằng giữa người dùng mới và người dùng quay lại."}
                    </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg">
                    <h4 className="font-bold text-sm mb-1">Chuyển đổi</h4>
                    <p className="text-sm">
                        {behaviorSummary.conversionRate < 2
                            ? "Tỷ lệ chuyển đổi thấp. Cân nhắc cải thiện trang sản phẩm và quy trình thanh toán."
                            : behaviorSummary.conversionRate >= 5
                              ? "Tỷ lệ chuyển đổi tốt. Tiếp tục tối ưu hóa để duy trì kết quả."
                              : "Tỷ lệ chuyển đổi khả quan. Cân nhắc thử nghiệm A/B để cải thiện."}
                    </p>
                </div>
                <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                    <h4 className="font-bold text-sm mb-1">Giỏ hàng bị bỏ</h4>
                    <p className="text-sm">
                        {avgAbandonRate > 70
                            ? "Tỷ lệ bỏ giỏ hàng cao. Xem xét đơn giản hóa quy trình thanh toán, thêm đánh giá sản phẩm."
                            : avgAbandonRate < 50
                              ? "Tỷ lệ bỏ giỏ hàng tốt. Tiếp tục tối ưu hóa quy trình thanh toán."
                              : "Tỷ lệ bỏ giỏ hàng trung bình. Thử nghiệm các chiến lược khuyến mãi để giảm tỷ lệ."}
                    </p>
                </div>
                <div className="p-3 bg-green-50 text-green-800 rounded-lg">
                    <h4 className="font-bold text-sm mb-1">
                        Hành động đề xuất
                    </h4>
                    <ul className="text-sm list-disc list-inside">
                        <li>Email nhắc nhở giỏ hàng bị bỏ</li>
                        <li>Tối ưu hóa trang sản phẩm xem nhiều</li>
                        <li>Cải thiện trải nghiệm mobile</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const AnalyticsInfo: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 mt-4">
            <h3 className="text-lg font-medium mb-2">Về dữ liệu phân tích</h3>
            <p className="text-sm text-gray-600 mb-2">
                Dữ liệu hành vi người dùng trong báo cáo này được thu thập qua
                hệ thống theo dõi sự kiện và được lưu trữ trong cơ sở dữ liệu
                PostgreSQL.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1 text-gray-700">
                    Luồng dữ liệu:
                </h4>
                <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
                    <li>
                        Người dùng tương tác với trang web (click, view,
                        add-to-cart)
                    </li>
                    <li>Sự kiện được ghi lại thông qua API Events</li>
                    <li>Events Controller xử lý và gửi dữ liệu đến Kafka</li>
                    <li>Dữ liệu được lưu trữ vào bảng User_Behaviour</li>
                    <li>
                        Analytics Service phân tích dữ liệu theo khoảng thời
                        gian
                    </li>
                    <li>Kết quả được hiển thị trong báo cáo này</li>
                </ol>
            </div>
            <h3 className="text-lg font-medium mb-2">
                Về cách tính tỉ lệ thoát bounce rate
            </h3>
            <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1 text-gray-700">
                    Tỉ lệ thoát được tính toán như sau:
                </h4>
                <p className="text-xs text-gray-600">
                    Người dùng chỉ xem một trang và không thực hiện bất kỳ hành
                    động nào.
                </p>
                <p className="text-xs text-gray-600">
                    Hoặc người dùng có thời gian phiên ngắn (&lt; 10 giây) và
                    không thực hiện bất kỳ hành động nào.
                </p>
                <p className="text-xs text-gray-600">
                    Tỉ lệ thoát = (Số phiên thoát / Tổng số phiên) * 100%
                </p>
            </div>
        </div>
    );
};

interface EngagementMetrics {
    avgSessionDuration: number;
    avgPageViews: number;
    avgInteractions: number;
    bounceRate: number;
    returnRate: number;
    totalSessions: number;
}

interface SessionLengthChartProps {
    sessionData: EngagementMetrics;
    formatTime: (seconds: number) => string;
}

const SessionLengthChart: React.FC<SessionLengthChartProps> = ({
    sessionData,
    formatTime,
}) => {
    // Prepare data for session duration distribution chart
    const durationDistributionData = {
        labels: ["< 1 phút", "1-3 phút", "3-5 phút", "5-10 phút", "> 10 phút"],
        datasets: [
            {
                label: "Phân bố thời gian phiên",
                data: [20, 35, 25, 15, 5], // Sample distribution - would need actual data from backend
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const sessionMetricsData = {
        labels: ["Thời gian TB", "Trang xem TB", "Tương tác TB"],
        datasets: [
            {
                label: "Số liệu phiên",
                data: [
                    sessionData.avgSessionDuration,
                    sessionData.avgPageViews * 60, // Scale up for visualization
                    sessionData.avgInteractions * 60, // Scale up for visualization
                ],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faClock}
                        className="text-blue-500 mr-2"
                    />
                    Thời gian phiên trung bình
                </h3>
                <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-blue-600">
                        {formatTime(sessionData.avgSessionDuration)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Thời gian trung bình mỗi phiên
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">
                            Trang xem trung bình
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                            {sessionData.avgPageViews.toFixed(1)}
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">
                            Tương tác trung bình
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">
                            {sessionData.avgInteractions.toFixed(1)}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">
                            Tỷ lệ thoát
                        </div>
                        <div className="text-2xl font-bold text-amber-700">
                            {sessionData.bounceRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">
                            Tỷ lệ quay lại
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {sessionData.returnRate.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FontAwesomeIcon
                        icon={faClock}
                        className="text-indigo-500 mr-2"
                    />
                    Phân bố thời gian phiên
                </h3>
                <div className="h-64">
                    <Doughnut
                        data={durationDistributionData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "bottom",
                                },
                            },
                        }}
                    />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p>
                        <span className="font-medium">
                            Tổng số phiên phân tích:
                        </span>{" "}
                        {sessionData.totalSessions.toLocaleString("vi-VN")}
                    </p>
                </div>
            </div>
        </div>
    );
};

const UserBehaviorReport: React.FC<UserBehaviorReportProps> = ({
    dateRange,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [behaviorSummary, setBehaviorSummary] = useState<BehaviorSummary>({
        totalVisitors: 0,
        newVisitors: 0,
        returningVisitors: 0,
        averageTimeOnSite: 0,
        bounceRate: 0,
        conversionRate: 0,
    });
    const [visitorData, setVisitorData] = useState<VisitorDataPoint[]>([]);
    const [mostViewedProducts, setMostViewedProducts] = useState<
        MostViewedProduct[]
    >([]);
    const [conversionRates, setConversionRates] = useState<
        ConversionRateData[]
    >([]);
    const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartData[]>(
        [],
    );
    const [sessionDistribution, setSessionDistribution] = useState<
        SessionDistribution[]
    >([
        { range: "< 1 phút", percentage: 25 },
        { range: "1-3 phút", percentage: 35 },
        { range: "3-5 phút", percentage: 20 },
        { range: "> 5 phút", percentage: 20 },
    ]);

    // Generate session distribution based on averageTimeOnSite
    const generateSessionDistribution = (
        averageTime: number,
    ): SessionDistribution[] => {
        // If average time is very short, adjust distribution to have more short sessions
        if (averageTime < 120) {
            return [
                { range: "< 1 phút", percentage: 45 },
                { range: "1-3 phút", percentage: 30 },
                { range: "3-5 phút", percentage: 15 },
                { range: "> 5 phút", percentage: 10 },
            ];
        }
        // If average time is moderate
        else if (averageTime < 240) {
            return [
                { range: "< 1 phút", percentage: 25 },
                { range: "1-3 phút", percentage: 40 },
                { range: "3-5 phút", percentage: 25 },
                { range: "> 5 phút", percentage: 10 },
            ];
        }
        // If average time is longer
        else {
            return [
                { range: "< 1 phút", percentage: 15 },
                { range: "1-3 phút", percentage: 30 },
                { range: "3-5 phút", percentage: 35 },
                { range: "> 5 phút", percentage: 20 },
            ];
        }
    };

    useEffect(() => {
        const fetchBehaviorData = async () => {
            setIsLoading(true);
            try {
                // Create an array of promises for all API calls
                const [behaviorData, productsData, conversionData, cartData] =
                    await Promise.all([
                        getUserBehaviorReport(
                            dateRange.startDate,
                            dateRange.endDate,
                        ),
                        getMostViewedProducts(
                            dateRange.startDate,
                            dateRange.endDate,
                        ),
                        getConversionRates(
                            dateRange.startDate,
                            dateRange.endDate,
                        ),
                        getAbandonedCarts(
                            dateRange.startDate,
                            dateRange.endDate,
                        ),
                    ]);

                // Process behavior data
                setBehaviorSummary(behaviorData.summary);
                setVisitorData(behaviorData.visitorData);

                // Generate session distribution based on averageTimeOnSite
                setSessionDistribution(
                    generateSessionDistribution(
                        behaviorData.summary.averageTimeOnSite,
                    ),
                );

                // Process other data
                setMostViewedProducts(productsData);
                setConversionRates(conversionData);
                setAbandonedCarts(cartData);
            } catch (error) {
                toast.error("Không thể tải dữ liệu hành vi người dùng");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBehaviorData();
    }, [dateRange]);

    // Format time in minutes:seconds
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
                    Hành vi người dùng
                </h2>
            </div>
            <SummaryCards
                behaviorSummary={behaviorSummary}
                formatTime={formatTime}
            />
            <VisitorsChart
                visitorData={visitorData}
                averageTimeOnSite={behaviorSummary.averageTimeOnSite}
                sessionDistribution={sessionDistribution}
            />
            <ProductReports
                mostViewedProducts={mostViewedProducts}
                conversionRates={conversionRates}
            />
            <AbandonedCartReport abandonedCarts={abandonedCarts} />
            {/* <KeyInsights
                behaviorSummary={behaviorSummary}
                abandonedCarts={abandonedCarts}
            /> */}
            <AnalyticsInfo />
        </div>
    );
};

export default UserBehaviorReport;
