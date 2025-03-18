"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

interface OrderActivity {
    id: string;
    status: string;
    message: string;
    timestamp: string;
    isCompleted: boolean;
}

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    phone: string;
}

interface OrderStatusPageProps {
    id: string | number;
    orderNumber: string;
    orderDate: string;
    status: string;
    estimatedDeliveryDate: string;
    activities: OrderActivity[];
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    total: number;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
    id,
    orderNumber,
    orderDate,
    status,
    estimatedDeliveryDate,
    activities,
    items = [], // Add default empty array
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingFee,
    total,
}) => {
    // Map the order status to human-readable Vietnamese
    const getStatusText = (statusCode: string) => {
        const statusMap: Record<
            string,
            { text: string; color: string; bgColor: string }
        > = {
            pending_approval: {
                text: "Chờ xác nhận",
                color: "text-yellow-800",
                bgColor: "bg-yellow-100",
            },
            approved: {
                text: "Đã xác nhận",
                color: "text-blue-800",
                bgColor: "bg-blue-100",
            },
            processing: {
                text: "Đang xử lý",
                color: "text-blue-800",
                bgColor: "bg-blue-100",
            },
            shipped: {
                text: "Đang giao hàng",
                color: "text-purple-800",
                bgColor: "bg-purple-100",
            },
            delivered: {
                text: "Đã giao hàng",
                color: "text-green-800",
                bgColor: "bg-green-100",
            },
            completed: {
                text: "Hoàn thành",
                color: "text-green-800",
                bgColor: "bg-green-100",
            },
            cancelled: {
                text: "Đã hủy",
                color: "text-red-800",
                bgColor: "bg-red-100",
            },
            refunded: {
                text: "Đã hoàn tiền",
                color: "text-orange-800",
                bgColor: "bg-orange-100",
            },
        };

        return (
            statusMap[statusCode] || {
                text: "Không xác định",
                color: "text-gray-800",
                bgColor: "bg-gray-100",
            }
        );
    };

    const statusInfo = getStatusText(status);

    function formatOrderDate(orderDate: string): React.ReactNode {
        const date = new Date(orderDate);
        const formattedDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString("vi-VN")}`;
        return formattedDate;
    }

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8">
                    <Link
                        href="/track-order"
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Quay lại
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-300">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Đơn hàng #{orderNumber}
                    </h1>
                    <div className="flex items-center mb-2">
                        <p className="text-gray-600 mr-4">
                            Đặt ngày: {formatOrderDate(orderDate)}
                        </p>
                        <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                            {statusInfo.text}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-300">
                            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                Trạng thái đơn hàng
                            </h2>
                            <div className="space-y-6">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="flex">
                                        <div className="mr-4 relative">
                                            <div
                                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                    activity.isCompleted
                                                        ? "bg-green-500"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                {activity.isCompleted ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-white"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>
                                            {index < activities.length - 1 && (
                                                <div
                                                    className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 ${
                                                        activity.isCompleted &&
                                                        activities[index + 1]
                                                            .isCompleted
                                                            ? "bg-green-500"
                                                            : "bg-gray-200"
                                                    }`}
                                                ></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className={`font-medium ${
                                                    activity.isCompleted
                                                        ? "text-gray-900"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {activity.status}
                                            </h3>
                                            <p
                                                className={`text-sm ${
                                                    activity.isCompleted
                                                        ? "text-gray-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {activity.message}
                                            </p>
                                            {activity.timestamp && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {activity.timestamp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {status === "shipped" && (
                                <div className="mt-6 pt-4 border-t border-gray-300 bg-blue-50 p-3 rounded">
                                    <p className="text-gray-700">
                                        Dự kiến giao hàng:{" "}
                                        <span className="font-medium text-blue-800">
                                            {estimatedDeliveryDate}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Order Items - Only render if items exist and have values */}
                        {items && items.length > 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                                <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                    Sản phẩm đã mua
                                </h2>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex flex-col sm:flex-row items-start pb-4 hover:bg-gray-50 p-2 rounded ${
                                                index !== items.length - 1
                                                    ? "border-b border-gray-300"
                                                    : ""
                                            }`}
                                        >
                                            <div className="sm:w-20 h-20 relative mb-2 sm:mb-0">
                                                <Image
                                                    src={
                                                        item.image ||
                                                        "/images/product-placeholder.jpg"
                                                    }
                                                    alt={item.name}
                                                    layout="fill"
                                                    objectFit="contain"
                                                    className="rounded-md"
                                                />
                                            </div>
                                            <div className="flex-1 sm:pl-4">
                                                <h3 className="font-medium">
                                                    {item.name}
                                                </h3>
                                                <div className="flex justify-between mt-1">
                                                    <p className="text-gray-600">
                                                        SL: {item.quantity}
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                                <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                    Sản phẩm đã mua
                                </h2>
                                <p className="text-gray-500 py-4 text-center">
                                    Thông tin sản phẩm không khả dụng hoặc cần
                                    xác thực thêm.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-300">
                            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                Thông tin giao hàng
                            </h2>
                            <div className="space-y-2">
                                <p className="font-medium">
                                    {shippingAddress.fullName}
                                </p>
                                <p>{shippingAddress.address}</p>
                                <p>{shippingAddress.city}</p>
                                <p>{shippingAddress.phone}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-300">
                            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                Phương thức thanh toán
                            </h2>
                            <p>{paymentMethod}</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                Tóm tắt đơn hàng
                            </h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span>
                                        {shippingFee > 0
                                            ? formatCurrency(shippingFee)
                                            : "Miễn phí"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-300 pt-2 mt-2 bg-gray-50 p-3 rounded">
                                    <div className="flex justify-between font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-blue-700">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusPage;
