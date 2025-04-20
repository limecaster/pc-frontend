"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

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
    originalPrice: number;
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
    activities = [],
    items = [],
    shippingAddress = {
        fullName: "Không có thông tin",
        address: "Không có thông tin",
        city: "Không có thông tin",
        phone: "Không có thông tin",
    },
    paymentMethod = "Không có thông tin",
    subtotal = 0,
    shippingFee = 0,
    total = 0,
}) => {
    function formatOrderDate(orderDate: string): React.ReactNode {
        const date = new Date(orderDate);
        const formattedDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString("vi-VN")}`;
        return formattedDate;
    }

    const itemsToDisplay = items || [];
    const activitiesToDisplay = activities || [];

    // Define the 5 fixed steps for order tracking
    const fixedSteps = [
        {
            id: "1",
            title: "Đặt hàng",
            defaultMessage: "Đơn hàng đã được tạo thành công",
        },
        {
            id: "2",
            title: "Xác nhận",
            defaultMessage: "Đơn hàng đang chờ xác nhận",
        },
        { id: "3", title: "Thanh toán", defaultMessage: "Đang chờ thanh toán" },
        {
            id: "4",
            title: "Xử lý",
            defaultMessage: "Đơn hàng sẽ được chuẩn bị sau khi thanh toán",
        },
        {
            id: "5",
            title: "Vận chuyển",
            defaultMessage: "Đơn hàng sẽ được giao sau khi xử lý",
        },
    ];

    const mappedActivities = fixedSteps.map((step) => {
        const matchingActivity = activitiesToDisplay.find(
            (activity) => activity.status === step.title,
        );

        if (matchingActivity) {
            return matchingActivity;
        } else {
            return {
                id: step.id,
                status: step.title,
                message: step.defaultMessage,
                timestamp: null,
                isCompleted: false,
            };
        }
    });

    const isOrderCancelled = status === "cancelled";

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
                        <OrderStatusBadge status={status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-300">
                            <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-300">
                                Trạng thái đơn hàng
                            </h2>
                            <div className="space-y-8">
                                {mappedActivities.map((activity, index) => (
                                    <div key={activity.id} className="flex">
                                        <div className="mr-4 relative">
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center ${isOrderCancelled
                                                    ? "bg-gray-300"
                                                    : activity.isCompleted
                                                        ? "bg-green-500"
                                                        : "bg-gray-200"
                                                    }`}
                                            >
                                                {activity.isCompleted &&
                                                    !isOrderCancelled ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-white"
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
                                                    <span
                                                        className={`
                                                        ${isOrderCancelled ? "text-gray-500" : "text-gray-600"} 
                                                        font-medium
                                                    `}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>
                                            {index <
                                                mappedActivities.length - 1 && (
                                                    <div
                                                        className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-16 ${isOrderCancelled
                                                            ? "bg-gray-300"
                                                            : activity.isCompleted &&
                                                                mappedActivities[
                                                                    index + 1
                                                                ].isCompleted
                                                                ? "bg-green-500"
                                                                : "bg-gray-200"
                                                            }`}
                                                    ></div>
                                                )}
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className={`text-lg font-medium ${isOrderCancelled
                                                    ? "text-gray-400"
                                                    : activity.isCompleted
                                                        ? "text-gray-900"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {activity.status}
                                            </h3>
                                            <p
                                                className={`mt-1 ${isOrderCancelled
                                                    ? "text-gray-400"
                                                    : activity.isCompleted
                                                        ? "text-gray-700"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {isOrderCancelled &&
                                                    activity.id === "1"
                                                    ? "Đơn hàng đã bị hủy"
                                                    : activity.message}
                                            </p>
                                            {activity.timestamp && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {activity.timestamp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isOrderCancelled && (
                                <div className="mt-8 pt-4 border-t border-gray-300 bg-red-50 p-4 rounded">
                                    <p className="text-gray-700 flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-red-500 mr-2"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="font-medium text-red-700">
                                            Đơn hàng này đã bị hủy
                                        </span>
                                    </p>
                                </div>
                            )}

                            {status === "shipping" &&
                                estimatedDeliveryDate &&
                                !isOrderCancelled && (
                                    <div className="mt-8 pt-4 border-t border-gray-300 bg-blue-50 p-4 rounded">
                                        <p className="text-gray-700">
                                            <span className="font-medium">
                                                Dự kiến giao hàng:
                                            </span>{" "}
                                            <span className="text-blue-800 font-medium">
                                                {estimatedDeliveryDate}
                                            </span>
                                        </p>
                                    </div>
                                )}
                        </div>

                        {itemsToDisplay && itemsToDisplay.length > 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                                <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">
                                    Sản phẩm đã mua
                                </h2>
                                <div className="space-y-4">
                                    {itemsToDisplay.map((item, index) => (
                                        <Link
                                            href={`/product/${item.id}`}
                                            key={item.id}
                                        >
                                            <div
                                                key={item.id}
                                                className={`flex flex-col sm:flex-row items-start pb-4 hover:bg-gray-50 p-2 rounded ${index !==
                                                    itemsToDisplay.length - 1
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
                                                        fill
                                                        className="rounded-md object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 sm:pl-4">
                                                    <h3 className="font-medium text-lg">
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex justify-between mt-1 text-sm">
                                                        <div className="flex items-center">
                                                            {item.originalPrice && (
                                                                <span className="text-gray-500 line-through mr-2">
                                                                    {formatCurrency(
                                                                        item.originalPrice,
                                                                    )}
                                                                </span>
                                                            )}
                                                            <p className="font-medium">
                                                                {formatCurrency(
                                                                    item.price,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <p className="text-gray-600">
                                                            Số lượng: {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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
                                    <span className="text-primary font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giảm giá</span>
                                    <span className="text-green-500 font-medium">- {formatCurrency(subtotal - total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-500 font-medium">
                                        {shippingFee > 0
                                            ? formatCurrency(shippingFee)
                                            : "Miễn phí"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-300 pt-2 mt-2 bg-gray-50 p-3 rounded">
                                    <div className="flex justify-between font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary font-semibold">
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
