"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircledIcon } from "@radix-ui/react-icons";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    imageUrl?: string;
}

enum OrderStatus {
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    PAYMENT_SUCCESS = "payment_success",
    PAYMENT_FAILURE = "payment_failure",
    PROCESSING = "processing",
    SHIPPING = "shipping",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
}

interface CheckoutSuccessComponentProps {
    orderData?: any;
    loading?: boolean;
    error?: string | null;
    paymentStatus?: string;
    paymentCode?: string;
}

const CheckoutSuccessComponentPage: React.FC<CheckoutSuccessComponentProps> = ({
    orderData,
    loading,
    error,
    paymentStatus,
    paymentCode,
}) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="w-full bg-gray-100 py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-gray-600">
                            Đang tải thông tin đơn hàng...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !orderData) {
        return (
            <div className="w-full bg-gray-100 py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-red-500 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Có lỗi xảy ra
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error || "Không tìm thấy thông tin đơn hàng"}
                        </p>
                        <Link
                            href="/"
                            className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md font-medium"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Destructure data from orderData
    const {
        id: orderId,
        orderNumber,
        orderDate,
        items: orderItems,
        shippingAddress,
        paymentMethod = "PayOS",
        subtotal = orderData.total,
        shippingFee = 0,
        discount = 0,
        total = orderData.total,
        status = orderData.paymentStatus || orderData.status,
    } = orderData;

    // Determine if payment was successful based on PayOS status
    const isPaymentSuccess =
        status === OrderStatus.PAYMENT_SUCCESS ||
        (paymentStatus === "PAID" && paymentCode === "00");

    // Create formatted shipping address from order data
    const formattedShippingAddress = {
        fullName:
            orderData.shippingAddress?.fullName ||
            orderData.customerName ||
            "Không có thông tin",
        address:
            orderData.shippingAddress?.address ||
            orderData.deliveryAddress?.split(",")[0] ||
            "Không có thông tin",
        city:
            orderData.shippingAddress?.city ||
            orderData.deliveryAddress?.split(",").slice(1).join(", ") ||
            "",
        phone:
            orderData.shippingAddress?.phone ||
            orderData.customerPhone ||
            "Không có thông tin",
    };

    // Format order date
    const formattedOrderDate = new Date(orderDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="w-full bg-gray-100 py-8 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Success Message */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircledIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {isPaymentSuccess
                            ? "Thanh toán thành công!"
                            : "Đặt hàng thành công!"}
                    </h1>
                    <p className="text-gray-600 mb-4 text-center">
                        {isPaymentSuccess
                            ? "Cảm ơn bạn đã mua sắm tại B Store. Đơn hàng của bạn đã được thanh toán và đang được xử lý."
                            : "Cảm ơn bạn đã mua sắm tại B Store. Đơn hàng của bạn đang chờ xác nhận từ nhân viên. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng."}
                    </p>
                    <div className="bg-gray-200 px-4 py-2 rounded-md text-sm text-gray-900">
                        <span className="font-medium">Mã đơn hàng:</span>{" "}
                        {orderNumber || orderId}
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
                                    <span className="font-medium">
                                        Ngày đặt hàng:
                                    </span>{" "}
                                    {formattedOrderDate}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Trạng thái:
                                    </span>{" "}
                                    <span
                                        className={`font-medium ${
                                            status ===
                                                OrderStatus.PAYMENT_SUCCESS ||
                                            isPaymentSuccess
                                                ? "text-green-600"
                                                : status ===
                                                    OrderStatus.PENDING_APPROVAL
                                                  ? "text-yellow-600"
                                                  : status ===
                                                      OrderStatus.APPROVED
                                                    ? "text-blue-600"
                                                    : status ===
                                                        OrderStatus.PAYMENT_FAILURE
                                                      ? "text-red-600"
                                                      : status ===
                                                          OrderStatus.PROCESSING
                                                        ? "text-orange-600"
                                                        : status ===
                                                            OrderStatus.SHIPPING
                                                          ? "text-indigo-600"
                                                          : status ===
                                                              OrderStatus.DELIVERED
                                                            ? "text-purple-600"
                                                            : status ===
                                                                OrderStatus.CANCELLED
                                                              ? "text-gray-600"
                                                              : status ===
                                                                  OrderStatus.COMPLETED
                                                                ? "text-green-600"
                                                                : "text-gray-600"
                                        }`}
                                    >
                                        {status ===
                                            OrderStatus.PAYMENT_SUCCESS ||
                                        isPaymentSuccess
                                            ? "Đã thanh toán"
                                            : status ===
                                                OrderStatus.PENDING_APPROVAL
                                              ? "Chờ phê duyệt"
                                              : status === OrderStatus.APPROVED
                                                ? "Đã phê duyệt"
                                                : status ===
                                                    OrderStatus.PAYMENT_FAILURE
                                                  ? "Thanh toán thất bại"
                                                  : status ===
                                                      OrderStatus.PROCESSING
                                                    ? "Đang xử lý"
                                                    : status ===
                                                        OrderStatus.SHIPPING
                                                      ? "Đang giao hàng"
                                                      : status ===
                                                          OrderStatus.DELIVERED
                                                        ? "Đã giao hàng"
                                                        : status ===
                                                            OrderStatus.CANCELLED
                                                          ? "Đã hủy"
                                                          : status ===
                                                              OrderStatus.COMPLETED
                                                            ? "Hoàn thành"
                                                            : "Không xác định"}
                                    </span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Phương thức thanh toán:
                                    </span>{" "}
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
                                    <span className="font-medium">
                                        Người nhận:
                                    </span>{" "}
                                    {formattedShippingAddress.fullName}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Địa chỉ:
                                    </span>{" "}
                                    {formattedShippingAddress.address}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Thành phố:
                                    </span>{" "}
                                    {formattedShippingAddress.city}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Số điện thoại:
                                    </span>{" "}
                                    {formattedShippingAddress.phone}
                                </p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Các bước tiếp theo
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                {!isPaymentSuccess && (
                                    <li>
                                        Nhân viên sẽ xác nhận thông tin đơn hàng
                                        của bạn trong vòng 24 giờ.
                                    </li>
                                )}
                                {isPaymentSuccess ? (
                                    <li>
                                        Đơn hàng của bạn đã được thanh toán và
                                        đang được chuẩn bị.
                                    </li>
                                ) : (
                                    <li>
                                        Sau khi đơn hàng được xác nhận, bạn sẽ
                                        nhận được email thông báo và cập nhật
                                        trạng thái đơn hàng.
                                    </li>
                                )}
                                <li>
                                    {isPaymentSuccess
                                        ? "Đơn hàng sẽ được xử lý và gửi đi trong thời gian sớm nhất."
                                        : "Bạn có thể thanh toán khi nhận hàng theo phương thức đã chọn."}
                                </li>
                                <li>
                                    Thời gian giao hàng dự kiến: 3-5 ngày làm
                                    việc.
                                </li>
                            </ol>
                            <div className="mt-4 bg-blue-50 p-4 rounded-md">
                                <p className="text-blue-700 font-medium">
                                    Bạn có thể theo dõi trạng thái đơn hàng
                                    trong phần "Đơn hàng" của tài khoản.
                                </p>
                                <div className="mt-2">
                                    <Link
                                        href="/dashboard/orders"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Xem đơn hàng →
                                    </Link>
                                </div>
                            </div>
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
                                {orderItems?.map((item: OrderItem) => (
                                    <div
                                        key={item.id}
                                        className="flex border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="w-16 h-16 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={
                                                    item.image ||
                                                    item.imageUrl ||
                                                    "/images/image-placeholder.png"
                                                }
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <Link
                                                href={`/product/${item.id}`}
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
                                    <span className="text-gray-600">
                                        Tạm tính:
                                    </span>
                                    <span className="font-medium text-primary">
                                        {formatCurrency(subtotal || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Phí vận chuyển:
                                    </span>
                                    <span className="font-medium text-green-600">
                                        {shippingFee === 0
                                            ? "Miễn phí"
                                            : formatCurrency(shippingFee || 0)}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Giảm giá:
                                        </span>
                                        <span className="text-green-600">
                                            -{formatCurrency(discount || 0)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                                    <span className="font-medium text-gray-900">
                                        Tổng cộng:
                                    </span>
                                    <span className="font-bold text-primary">
                                        {formatCurrency(total || 0)}
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
                                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui
                                lòng liên hệ với chúng tôi.
                            </p>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span>{" "}
                                    <a
                                        href="mailto:support@bstore.com"
                                        className="text-primary hover:underline"
                                    >
                                        support@bstore.com
                                    </a>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">
                                        Hotline:
                                    </span>{" "}
                                    <a
                                        href="tel:1900123456"
                                        className="text-primary hover:underline"
                                    >
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
