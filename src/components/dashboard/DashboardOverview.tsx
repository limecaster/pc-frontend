"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    CircleStackIcon,
    ShoppingBagIcon,
    ComputerDesktopIcon,
    HeartIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getAllConfigurations } from "@/api/pc-configuration";
import { formatPrice } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderHistory } from "@/api/orders"; // Adjust import based on your actual API file
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [configurations, setConfigurations] = useState<any[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch configurations
                const configsData = await getAllConfigurations();
                setConfigurations(configsData.slice(0, 3)); // Show only recent 3

                // Fetch orders if the API function exists
                try {
                    const ordersResponse = await getOrderHistory();
                    // Check if orders response is valid and contains an array
                    if (ordersResponse && Array.isArray(ordersResponse)) {
                        setOrderCount(ordersResponse.length || 0);
                        setRecentOrders(ordersResponse.slice(0, 3)); // Show only recent 3
                    } else {
                        // Handle case where response is not an array
                        console.warn(
                            "Orders response is not an array:",
                            ordersResponse,
                        );
                        setOrderCount(0);
                        setRecentOrders([]);
                    }
                } catch (error) {
                    console.log("Orders API not available or error:", error);
                    // Fallback to empty data if API doesn't exist or fails
                    setOrderCount(0);
                    setRecentOrders([]);
                }

                // For wishlist, we could use localStorage count if API isn't available
                const wishlistItems = JSON.parse(
                    localStorage.getItem("wishlist") || "[]",
                );
                setWishlistCount(wishlistItems.length);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-3">Đang tải thông tin...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Tổng quan tài khoản</h1>

            {/* Account Summary Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UserCircleIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium">
                            Xin chào, {user?.username || "Khách hàng"}
                        </h2>
                        <p className="text-gray-500">
                            {user?.email || "Không có email"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Orders */}
                <Link href="/dashboard/orders" className="group">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Đơn hàng
                                </p>
                                <p className="text-2xl font-bold">
                                    {orderCount}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <ShoppingBagIcon className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-primary group-hover:text-blue-700">
                            Xem chi tiết →
                        </p>
                    </div>
                </Link>

                {/* PC Configurations */}
                <Link href="/dashboard/pc-configurations" className="group">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Cấu hình PC
                                </p>
                                <p className="text-2xl font-bold">
                                    {configurations.length}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-primary group-hover:text-blue-700">
                            Xem chi tiết →
                        </p>
                    </div>
                </Link>

                {/* Wishlist */}
                <Link href="/dashboard/wishlist" className="group">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Sản phẩm yêu thích
                                </p>
                                <p className="text-2xl font-bold">
                                    {wishlistCount}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <HeartIcon className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-primary group-hover:text-blue-700">
                            Xem chi tiết →
                        </p>
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">
                            Đơn hàng gần đây
                        </h2>
                        <Link
                            href="/dashboard/orders"
                            className="text-sm text-primary hover:text-blue-700"
                        >
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày đặt
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order.orderNumber}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(
                                                    order.createdAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {formatPrice(order.total)} đ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent PC Configurations */}
            {configurations.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">
                            Cấu hình PC gần đây
                        </h2>
                        <Link
                            href="/dashboard/pc-configurations"
                            className="text-sm text-primary hover:text-blue-700"
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {configurations.map((config) => (
                            <div
                                key={config.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-4">
                                    <h3 className="font-medium text-lg">
                                        {config.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {config.purpose || "Không có mục đích"}
                                    </p>
                                    <div className="flex justify-between mt-4">
                                        <div className="text-sm">
                                            <span className="text-gray-500">
                                                Linh kiện:
                                            </span>{" "}
                                            {
                                                Object.keys(
                                                    config.products || {},
                                                ).length
                                            }
                                        </div>
                                        <div className="text-sm font-medium text-primary">
                                            {formatPrice(config.totalPrice)} đ
                                        </div>
                                    </div>
                                    <Link
                                        href={`/manual-build-pc?configId=${config.id}`}
                                        className="mt-3 block text-center bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Chỉnh sửa
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
