"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { generateSlug } from "@/utils/slugify";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CheckoutSuccessComponentProps {
    orderId?: string;
    orderDate?: string;
    orderItems?: OrderItem[];
    shippingAddress?: {
        fullName: string;
        address: string;
        city: string;
        phone: string;
    };
    paymentMethod?: string;
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    total?: number;
}

const CheckoutSuccessComponentPage: React.FC<CheckoutSuccessComponentProps> = ({
    orderId = "ORD-2023-11001",
    orderDate = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }),
    orderItems = [
        {
            id: "1",
            name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
            price: 17990000,
            quantity: 1,
            image: "/products/rtx4070.jpg",
        },
        {
            id: "2",
            name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
            price: 2190000,
            quantity: 2,
            image: "/products/keyboard.jpg",
        },
    ],
    shippingAddress = {
        fullName: "Nguyễn Văn A",
        address: "123 Đường ABC, Phường XYZ",
        city: "Quận 1, TP. Hồ Chí Minh",
        phone: "0987654321",
    },
    paymentMethod = "VietQR",
    subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    ),
    shippingFee = 0,
    discount = 0,
    total = subtotal + shippingFee - discount,
}) => {
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
                {/* Success Message */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircledIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-600 mb-4 text-center">
                        Cảm ơn bạn đã mua sắm tại B Store. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
                    </p>
                    <div className="bg-gray-200 px-4 py-2 rounded-md text-sm text-gray-900">
                        <span className="font-medium">Mã đơn hàng:</span> {orderId}
                    </div>
                </div>

                {/* Order Details Container */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column - Order Summary */}
                    <div className="w-full lg:w-2/3">
                        {/* Order Information */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin đơn hàng
                            </h2>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Ngày đặt hàng:</span>{" "}
                                    {orderDate}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Trạng thái:</span>{" "}
                                    <span className="text-green-600 font-medium">Đã thanh toán</span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Phương thức thanh toán:</span>{" "}
                                    {paymentMethod}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin giao hàng
                            </h2>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Người nhận:</span>{" "}
                                    {shippingAddress.fullName}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Địa chỉ:</span>{" "}
                                    {shippingAddress.address}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Thành phố:</span>{" "}
                                    {shippingAddress.city}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Số điện thoại:</span>{" "}
                                    {shippingAddress.phone}
                                </p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Các bước tiếp theo
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>
                                    Chúng tôi sẽ kiểm tra và xác nhận đơn hàng của bạn.
                                </li>
                                <li>
                                    Bạn sẽ nhận được email xác nhận đơn hàng với các chi tiết.
                                </li>
                                <li>
                                    Đơn hàng sẽ được đóng gói và gửi đi trong vòng 1-2 ngày làm việc.
                                </li>
                                <li>
                                    Bạn sẽ nhận được thông báo khi đơn hàng được gửi đi.
                                </li>
                            </ol>
                        </div>

                        {/* Continue Shopping Button */}
                        <div className="flex justify-center mt-8">
                            <Link
                                href="/products"
                                className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md font-medium transition-colors"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* Right column - Order items and total */}
                    <div className="w-full lg:w-1/3">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Sản phẩm đã mua
                            </h2>
                            <div className="space-y-4">
                                {orderItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="w-16 h-16 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <Link
                                                href={`/product/${item.id}-${generateSlug(item.name)}`}
                                                className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>
                                            <span className="mt-1 text-sm text-gray-500">
                                                {item.quantity} x 
                                            </span>
                                            <span className="mt-1 ml-1 text-sm font-medium text-primary">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính:</span>
                                    <span className="font-medium text-primary">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">
                                        {shippingFee === 0
                                            ? "Miễn phí"
                                            : formatCurrency(shippingFee)}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="text-green-600">
                                            -{formatCurrency(discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                                    <span className="font-medium text-gray-900">Tổng cộng:</span>
                                    <span className="font-bold text-primary">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Need Help */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Bạn cần giúp đỡ?
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi.
                            </p>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span>{" "}
                                    <a href="mailto:support@bstore.com" className="text-primary hover:underline">
                                        support@bstore.com
                                    </a>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Hotline:</span>{" "}
                                    <a href="tel:1900123456" className="text-primary hover:underline">
                                        1900 123 456
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessComponentPage;
