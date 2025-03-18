"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "flowbite-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMoneyBill,
    faShoppingCart,
    faUsers,
    faBox,
    faDownload,
    faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
    fetchDashboardSummary,
    fetchSalesData,
    fetchProductCategories,
    fetchOrderStatuses,
    fetchRecentOrders,
} from "@/api/dashboard";
import SalesChart from "@/components/admin/charts/SalesChart";
import ProductsChart from "@/components/admin/charts/ProductsChart";
import OrderStatusChart from "@/components/admin/charts/OrderStatusChart";
import StatCard from "@/components/admin/StatCard";
import ErrorBoundary from "@/components/admin/ErrorBoundary";

// Define interfaces for our data types
interface DashboardSummary {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    salesChange: string;
    ordersChange: string;
    customersChange: string;
    productsChange: string;
}

interface SalesData {
    dates: string[];
    sales: number[];
}

interface CategoryData {
    categories: string[];
    counts: number[];
}

interface OrderStatusData {
    statuses: string[];
    counts: number[];
}

interface Order {
    id: number;
    orderNumber?: string;
    customerName: string;
    total: number;
    status: string;
    date?: Date;
}

// Define order status types
type OrderStatus =
    | "pending_approval"
    | "approved"
    | "processing"
    | "shipping"
    | "delivered"
    | "completed"
    | "cancelled"
    | "payment_success"
    | "payment_failure";

export default function AdminDashboard() {
    const router = useRouter();

    const [salesPeriod, setSalesPeriod] = useState<string>("week");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState<DashboardSummary>({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        salesChange: "0%",
        ordersChange: "0%",
        customersChange: "0%",
        productsChange: "0%",
    });
    const [salesData, setSalesData] = useState<SalesData>({
        dates: [],
        sales: [],
    });
    const [productCategories, setProductCategories] = useState<CategoryData>({
        categories: [],
        counts: [],
    });
    const [orderStatuses, setOrderStatuses] = useState<OrderStatusData>({
        statuses: [],
        counts: [],
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Load data in sequence rather than parallel to avoid overwhelming the server
                const summaryData = await fetchDashboardSummary();
                setSummary({
                    totalSales: summaryData.totalSales || 0,
                    totalOrders: summaryData.totalOrders || 0,
                    totalCustomers: summaryData.totalCustomers || 0,
                    totalProducts: summaryData.totalProducts || 0,
                    salesChange: summaryData.salesChange || "0%",
                    ordersChange: summaryData.ordersChange || "0%",
                    customersChange: summaryData.customersChange || "0%",
                    productsChange: summaryData.productsChange || "0%",
                });

                const salesDataResult = await fetchSalesData(salesPeriod);
                setSalesData({
                    dates: salesDataResult.dates || [],
                    sales: salesDataResult.sales || [],
                });

                const productData = await fetchProductCategories();
                setProductCategories({
                    categories: productData.categories || [],
                    counts: productData.counts || [],
                });

                const orderData = await fetchOrderStatuses();
                setOrderStatuses({
                    statuses: orderData.statuses || [],
                    counts: orderData.counts || [],
                });

                const recentOrdersData = await fetchRecentOrders(5);
                setRecentOrders(recentOrdersData.orders || []);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                setError("Failed to load dashboard data. Please try again.");

                if (
                    error instanceof Error &&
                    error.message?.includes("Authentication required")
                ) {
                    router.push("/authenticate");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [salesPeriod, router]);

    const handleChangeSalesPeriod = async (period: string) => {
        const cleanPeriod = String(period);
        setSalesPeriod(cleanPeriod);

        try {
            setIsLoading(true);
            const data = await fetchSalesData(cleanPeriod);
            setSalesData({
                dates: [...(data.dates || [])],
                sales: [...(data.sales || [])],
            });
        } catch (error) {
            console.error(`Error fetching ${cleanPeriod} sales data:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSafeChartData = () => {
        const placeholderData = {
            dates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            sales: [4500, 5200, 4800, 5800, 6000, 5600, 7000],
        };

        if (
            !isLoading &&
            salesData.dates.length > 0 &&
            salesData.sales.length > 0
        ) {
            return {
                dates: [...salesData.dates],
                sales: [...salesData.sales],
            };
        }

        return placeholderData;
    };

    const getSafeCategoriesData = () => {
        const placeholderData = {
            categories: [
                "Laptops",
                "Desktops",
                "Components",
                "Accessories",
                "Monitors",
            ],
            counts: [35, 25, 20, 15, 5],
        };

        if (
            !isLoading &&
            productCategories.categories.length > 0 &&
            productCategories.counts.length > 0
        ) {
            return {
                categories: [...productCategories.categories],
                counts: [...productCategories.counts],
            };
        }

        return placeholderData;
    };

    const getSafeOrderStatusesData = () => {
        const placeholderData = {
            statuses: [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
            counts: [12, 8, 15, 30, 5],
        };

        if (
            !isLoading &&
            orderStatuses.statuses.length > 0 &&
            orderStatuses.counts.length > 0
        ) {
            return {
                statuses: [...orderStatuses.statuses],
                counts: [...orderStatuses.counts],
            };
        }

        return placeholderData;
    };

    const getStatusBadgeClass = (status: string): string => {
        const statusClasses: Record<string, string> = {
            pending_approval: "bg-orange-100 text-orange-800",
            approved: "bg-blue-100 text-blue-800",
            processing: "bg-blue-100 text-blue-800",
            shipping: "bg-yellow-100 text-yellow-800",
            delivered: "bg-green-100 text-green-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            payment_success: "bg-green-100 text-green-800",
            payment_failure: "bg-red-100 text-red-800",
        };

        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    const formatStatusLabel = (status: string): string => {
        const statusLabels: Record<string, string> = {
            pending_approval: "Chờ duyệt",
            approved: "Đã duyệt",
            processing: "Đang xử lý",
            shipping: "Đang giao hàng",
            delivered: "Đã giao hàng",
            completed: "Hoàn thành",
            cancelled: "Đã hủy",
            payment_success: "Thanh toán thành công",
            payment_failure: "Thanh toán thất bại",
        };

        return statusLabels[status] || status;
    };

    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                    <h2 className="text-lg font-semibold text-red-800">
                        Error
                    </h2>
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Reload page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng quan về hiệu suất cửa hàng
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                    <Dropdown
                        label={`Thời gian: ${
                            salesPeriod === "week"
                                ? "Tuần này"
                                : salesPeriod === "month"
                                  ? "Tháng này"
                                  : "Năm này"
                        }`}
                        color="light"
                        size="sm"
                    >
                        <Dropdown.Item
                            onClick={() => handleChangeSalesPeriod("week")}
                        >
                            Tuần này
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => handleChangeSalesPeriod("month")}
                        >
                            Tháng này
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => handleChangeSalesPeriod("year")}
                        >
                            Năm này
                        </Dropdown.Item>
                    </Dropdown>
                    <button className="px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300">
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Tổng doanh thu"
                    value={`${summary.totalSales.toLocaleString()}₫`}
                    change={summary.salesChange}
                    changeType={
                        summary.salesChange.includes("+")
                            ? "positive"
                            : summary.salesChange.includes("-")
                              ? "negative"
                              : "neutral"
                    }
                    isLoading={isLoading}
                    icon={
                        <FontAwesomeIcon
                            icon={faMoneyBill}
                            className="w-5 h-5"
                        />
                    }
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={summary.totalOrders.toLocaleString()}
                    change={summary.ordersChange}
                    changeType={
                        summary.ordersChange.includes("+")
                            ? "positive"
                            : summary.ordersChange.includes("-")
                              ? "negative"
                              : "neutral"
                    }
                    isLoading={isLoading}
                    icon={
                        <FontAwesomeIcon
                            icon={faShoppingCart}
                            className="w-5 h-5"
                        />
                    }
                />
                <StatCard
                    title="Tổng khách hàng"
                    value={summary.totalCustomers.toLocaleString()}
                    change={summary.customersChange}
                    changeType={
                        summary.customersChange.includes("+")
                            ? "positive"
                            : summary.customersChange.includes("-")
                              ? "negative"
                              : "neutral"
                    }
                    isLoading={isLoading}
                    icon={
                        <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                    }
                />
                <StatCard
                    title="Tổng sản phẩm"
                    value={summary.totalProducts.toLocaleString()}
                    changeType={
                        summary.productsChange.includes("+")
                            ? "positive"
                            : summary.productsChange.includes("-")
                              ? "negative"
                              : "neutral"
                    }
                    isLoading={isLoading}
                    icon={<FontAwesomeIcon icon={faBox} className="w-5 h-5" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ErrorBoundary>
                    <Suspense
                        fallback={
                            <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        }
                    >
                        <SalesChart
                            title={`Biểu đồ doanh thu (${
                                salesPeriod === "week"
                                    ? "Tuần này"
                                    : salesPeriod === "month"
                                      ? "Tháng này"
                                      : "Năm này"
                            })`}
                            data={getSafeChartData()}
                            isLoading={isLoading}
                        />
                    </Suspense>
                </ErrorBoundary>

                <ErrorBoundary>
                    <Suspense
                        fallback={
                            <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        }
                    >
                        <ProductsChart
                            title="Phân bổ danh mục sản phẩm"
                            data={getSafeCategoriesData()}
                            isLoading={isLoading}
                        />
                    </Suspense>
                </ErrorBoundary>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary>
                    <Suspense
                        fallback={
                            <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        }
                    >
                        <OrderStatusChart
                            title="Trạng thái đơn hàng"
                            data={getSafeOrderStatusesData()}
                            isLoading={isLoading}
                        />
                    </Suspense>
                </ErrorBoundary>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Đơn hàng gần đây
                    </h3>
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-2"
                                >
                                    <div className="h-2.5 bg-slate-200 rounded w-12"></div>
                                    <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                                    <div className="h-2.5 bg-slate-200 rounded w-20"></div>
                                    <div className="h-2.5 bg-slate-200 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    #
                                                    {order.orderNumber ||
                                                        order.id}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {order.customerName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {order.total.toLocaleString()}
                                                    ₫
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}
                                                    >
                                                        {formatStatusLabel(
                                                            order.status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <a
                                                        href={`/admin/orders/${order.id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                            className="mr-1"
                                                        />
                                                        Xem
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-3 text-sm text-gray-500 text-center"
                                            >
                                                Không có đơn hàng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="mt-4 text-center">
                                <a
                                    href="/admin/orders"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Xem tất cả đơn hàng
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
