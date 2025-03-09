"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    PersonIcon,
    HomeIcon,
    ClockIcon,
    RocketIcon,
    CheckCircledIcon,
    ChevronRightIcon,
} from "@radix-ui/react-icons";
import { Tooltip } from "@/components/ui/tooltip";
// import { generateSlug } from "@/utils/slugify";

const DashboardOverview: React.FC = () => {
    // Mock user data - in a real app this would come from an API or state
    const user = {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        orders: {
            pending: 1,
            shipping: 2,
            completed: 5,
        },
        addresses: [
            {
                id: "1",
                fullName: "Nguyễn Văn A",
                address: "123 Đường ABC, Phường XYZ",
                city: "Quận 1, TP. Hồ Chí Minh",
                isDefault: true,
            },
        ],
    };

    // Mock recent orders
    const recentOrders = [
        {
            id: "1",
            orderNumber: "ORD-2023-11001",
            date: "15/11/2023",
            status: "delivered",
            total: 17990000,
            items: [
                {
                    id: "1",
                    name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
                    image: "/products/rtx4070.jpg",
                },
            ],
        },
        {
            id: "2",
            orderNumber: "ORD-2023-10002",
            date: "22/10/2023",
            status: "shipped",
            total: 4380000,
            items: [
                {
                    id: "2",
                    name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
                    image: "/products/keyboard.jpg",
                },
            ],
        },
    ];

    // Mock recently viewed products
    const recentlyViewedProducts = [
        {
            id: "1",
            name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
            price: 17990000,
            image: "/products/rtx4070.jpg",
            viewedAt: "Hôm nay, 10:30",
        },
        {
            id: "2",
            name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
            price: 2190000,
            image: "/products/keyboard.jpg",
            viewedAt: "Hôm qua, 14:15",
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "Chờ xác nhận",
                    className: "bg-yellow-100 text-yellow-800",
                    icon: <ClockIcon className="w-4 h-4" />,
                };
            case "shipped":
                return {
                    label: "Đang giao hàng",
                    className: "bg-indigo-100 text-indigo-800",
                    icon: <RocketIcon className="w-4 h-4" />,
                };
            case "delivered":
                return {
                    label: "Đã giao hàng",
                    className: "bg-green-100 text-green-800",
                    icon: <CheckCircledIcon className="w-4 h-4" />,
                };
            case "cancelled":
                return {
                    label: "Đã hủy",
                    className: "bg-red-100 text-red-800",
                    icon: <ClockIcon className="w-4 h-4" />,
                };
            default:
                return {
                    label: "Không xác định",
                    className: "bg-gray-100 text-gray-800",
                    icon: <ClockIcon className="w-4 h-4" />,
                };
        }
    };

    return (
        <div className="text-gray-800">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Tổng quan tài khoản
            </h1>

            {/* User Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Account Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center mb-4">
                        <PersonIcon className="w-5 h-5 text-primary mr-2" />
                        <h2 className="text-lg font-medium">
                            Thông tin tài khoản
                        </h2>
                    </div>
                    <div className="text-gray-600 mb-4">
                        <p className="mb-1">
                            <span className="font-medium">Họ tên:</span>{" "}
                            {user.name}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span>{" "}
                            {user.email}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/account"
                        className="text-primary hover:underline text-sm font-medium flex items-center justify-end"
                    >
                        Xem chi tiết
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                {/* Address Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center mb-4">
                        <HomeIcon className="w-5 h-5 text-primary mr-2" />
                        <h2 className="text-lg font-medium">
                            Địa chỉ giao hàng
                        </h2>
                    </div>
                    {user.addresses.length > 0 ? (
                        <div className="text-gray-600 mb-4">
                            <p className="font-medium">
                                {user.addresses[0].fullName}
                            </p>
                            <p className="text-sm mb-1">
                                {user.addresses[0].address}
                            </p>
                            <p className="text-sm">{user.addresses[0].city}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 mb-4 text-sm">
                            Bạn chưa có địa chỉ giao hàng nào
                        </p>
                    )}
                    <Link
                        href="/dashboard/account?tab=addresses"
                        className="text-primary hover:underline text-sm font-medium flex items-center justify-end"
                    >
                        {user.addresses.length > 1
                            ? "Xem tất cả địa chỉ"
                            : "Thêm địa chỉ"}
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                {/* Order Statistics Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center mb-4">
                        <ClockIcon className="w-5 h-5 text-primary mr-2" />
                        <h2 className="text-lg font-medium">
                            Đơn hàng của bạn
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-yellow-50 p-2 rounded text-center">
                            <p className="font-semibold text-xl text-yellow-700">
                                {user.orders.pending}
                            </p>
                            <p className="text-xs text-gray-600">
                                Chờ xác nhận
                            </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                            <p className="font-semibold text-xl text-blue-700">
                                {user.orders.shipping}
                            </p>
                            <p className="text-xs text-gray-600">Đang giao</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                            <p className="font-semibold text-xl text-green-700">
                                {user.orders.completed}
                            </p>
                            <p className="text-xs text-gray-600">Hoàn thành</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/orders"
                        className="text-primary hover:underline text-sm font-medium flex items-center justify-end"
                    >
                        Xem tất cả đơn hàng
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Đơn hàng gần đây</h2>
                    <Link
                        href="/dashboard/orders"
                        className="text-primary hover:underline text-sm font-medium flex items-center"
                    >
                        Xem tất cả
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {recentOrders.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {recentOrders.map((order) => {
                                const { label, className, icon } =
                                    getStatusLabel(order.status);
                                return (
                                    <div key={order.id} className="p-4">
                                        <div className="flex flex-col sm:flex-row justify-between mb-3">
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    {order.orderNumber}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-3">
                                                    {order.date}
                                                </span>
                                            </div>
                                            <div className="mt-2 sm:mt-0">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
                                                >
                                                    {icon}
                                                    <span className="ml-1">
                                                        {label}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        {/* Item Preview */}
                                        <div className="flex items-center mb-2">
                                            <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden">
                                                <Image
                                                    src={order.items[0].image}
                                                    alt={order.items[0].name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <Tooltip
                                                    content={
                                                        order.items[0].name
                                                    }
                                                >
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {order.items[0].name}
                                                    </p>
                                                </Tooltip>
                                                {order.items.length > 1 && (
                                                    <p className="text-xs text-gray-500">
                                                        +{" "}
                                                        {order.items.length - 1}{" "}
                                                        sản phẩm khác
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-3 text-right">
                                                <p className="text-sm font-semibold text-primary">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-right">
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Bạn chưa có đơn hàng nào
                        </div>
                    )}
                </div>
            </div>

            {/* Recently Viewed Products Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">
                        Sản phẩm đã xem gần đây
                    </h2>
                    <Link
                        href="/dashboard/viewed-products"
                        className="text-primary hover:underline text-sm font-medium flex items-center"
                    >
                        Xem tất cả
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {recentlyViewedProducts.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {recentlyViewedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="p-4 flex items-center"
                                >
                                    <div className="w-12 h-12 border border-gray-200 rounded overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <Tooltip content={product.name}>
                                            <Link
                                                href={`/product/${product.id}`}
                                                className="text-sm font-medium text-gray-900 hover:text-primary truncate block"
                                            >
                                                {product.name}
                                            </Link>
                                        </Tooltip>
                                        <p className="text-xs text-gray-500">
                                            {product.viewedAt}
                                        </p>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-primary">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Bạn chưa xem sản phẩm nào gần đây
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
