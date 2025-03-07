"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { generateSlug } from "@/utils/slugify";
import { Tooltip } from "../ui/tooltip";

// Define status types
type OrderStatus =
    | "placed"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered";

// Define activity types
interface OrderActivity {
    id: string;
    status: string;
    message: string;
    timestamp: string;
    isCompleted: boolean;
}

// Define order item type
interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

// Props for the component
interface OrderStatusPageProps {
    orderId: string;
    orderDate: string;
    status: OrderStatus;
    activities: OrderActivity[];
    items: OrderItem[];
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        phone: string;
    };
    paymentMethod: string;
    total: number;
    estimatedDeliveryDate?: string;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
    orderId,
    orderDate,
    status,
    activities,
    items,
    shippingAddress,
    paymentMethod,
    total,
    estimatedDeliveryDate,
}) => {
    // Status map for stepper
    const statusSteps = [
        { key: "placed", label: "Đặt hàng" },
        { key: "confirmed", label: "Xác nhận" },
        { key: "processing", label: "Đóng gói" },
        { key: "shipped", label: "Vận chuyển" },
        { key: "delivered", label: "Đã giao" },
    ];

    // Get current step index
    const currentStepIndex = statusSteps.findIndex(
        (step) => step.key === status,
    );

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="w-full bg-gray-100 py-8 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Back link */}
                <Link
                    href="/track-order"
                    className="inline-flex items-center text-primary hover:underline mb-6"
                >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Quay lại trang tra cứu
                </Link>

                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Thông tin đơn hàng #{orderId}
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column - Order status and timeline */}
                    <div className="w-full lg:w-2/3">
                        {/* Status stepper */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Trạng thái đơn hàng
                            </h2>

                            <div className="relative">
                                {/* Stepper */}
                                <div className="flex items-center justify-between mb-8">
                                    {statusSteps.map((step, idx) => (
                                        <div
                                            key={step.key}
                                            className="flex flex-col items-center relative z-10"
                                        >
                                            <div
                                                className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${
                            idx <= currentStepIndex
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-400"
                        }
                      `}
                                            >
                                                {idx < currentStepIndex ? (
                                                    <CheckCircledIcon className="h-5 w-5" />
                                                ) : (
                                                    <span>{idx + 1}</span>
                                                )}
                                            </div>
                                            <span
                                                className={`
                        mt-2 text-xs text-center
                        ${
                            idx <= currentStepIndex
                                ? "font-semibold text-primary"
                                : "text-gray-500"
                        }
                      `}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Connecting lines */}
                                    <div
                                        className="absolute top-4 h-0.5 bg-gray-200 w-full -z-0"
                                        style={{
                                            transform: "translateY(-50%)",
                                        }}
                                    />

                                    <div
                                        className="absolute top-4 h-0.5 bg-primary w-0 -z-0 transition-all duration-500"
                                        style={{
                                            transform: "translateY(-50%)",
                                            width: `${
                                                (currentStepIndex /
                                                    (statusSteps.length - 1)) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>

                                {/* Expected delivery info */}
                                {estimatedDeliveryDate && (
                                    <div className="text-center text-sm">
                                        <span className="text-gray-600">
                                            Thời gian dự kiến giao hàng:
                                        </span>{" "}
                                        <span className="font-semibold text-gray-900">
                                            {estimatedDeliveryDate}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity timeline */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Lịch sử đơn hàng
                            </h2>

                            <div className="space-y-6">
                                {activities.map((activity, idx) => (
                                    <div
                                        key={activity.id}
                                        className="relative pl-8 pb-6"
                                    >
                                        {/* Vertical line */}
                                        {idx < activities.length - 1 && (
                                            <div className="absolute left-3.5 top-3 bottom-0 w-0.5 bg-gray-200" />
                                        )}

                                        {/* Status icon */}
                                        <div
                                            className={`
                      absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center
                      ${
                          activity.isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                      }
                    `}
                                        >
                                            {activity.isCompleted ? (
                                                <CheckCircledIcon className="h-5 w-5" />
                                            ) : (
                                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap justify-between items-start">
                                                <h3 className="text-base font-semibold text-gray-800">
                                                    {activity.status}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {activity.timestamp}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1">
                                                {activity.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping information */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin giao hàng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Địa chỉ giao hàng
                                    </h3>
                                    <div className="text-gray-600">
                                        <p className="font-medium">
                                            {shippingAddress.fullName}
                                        </p>
                                        <p>{shippingAddress.address}</p>
                                        <p>{shippingAddress.city}</p>
                                        <p>
                                            Điện thoại: {shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Thông tin thanh toán
                                    </h3>
                                    <div className="text-gray-600">
                                        <p>
                                            <span className="font-medium">
                                                Phương thức:
                                            </span>{" "}
                                            {paymentMethod}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Trạng thái:
                                            </span>{" "}
                                            Đã thanh toán
                                        </p>
                                        <p className="font-medium text-primary mt-2">
                                            {formatCurrency(total)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Order summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin đơn hàng
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ngày đặt hàng:</span>
                                    <span>{orderDate}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Mã đơn hàng:</span>
                                    <span className="font-medium">
                                        {orderId}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Tổng tiền:</span>
                                    <span className="font-semibold text-primary">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h3 className="font-medium text-gray-900 mb-4">
                                    Sản phẩm
                                </h3>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex space-x-3"
                                        >
                                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Tooltip content={item.name}>
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        <Link 
                                                            href={`/product/${item.id}-${generateSlug(item.name)}`}
                                                            className="hover:text-primary transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                </Tooltip>
                                                <span className="text-sm text-gray-500">
                                                    {item.quantity} x{" "}
                                                </span>
                                                <span className="text-sm font-medium text-primary">
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <Link
                                    href="/contact"
                                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cần giúp đỡ?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusPage;
