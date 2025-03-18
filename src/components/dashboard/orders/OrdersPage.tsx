"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// import { generateSlug } from "@/utils/slugify";
import { Tooltip } from "@/components/ui/tooltip";
import { getUserOrderHistory } from "@/api/checkout";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cancelOrder, initiateOrderPayment } from "@/api/order";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    imageUrl?: string;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status:
        | "pending"
        | "processing"
        | "shipped"
        | "shipping"
        | "delivering"
        | "delivered"
        | "cancelled"
        | "completed"
        | "pending_approval"
        | "approved"
        | "payment_success"
        | "payment_failure";
    total: number;
    items: OrderItem[];
}

const OrdersPage: React.FC = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(
        null,
    );

    // Fetch order history
    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await getUserOrderHistory();

            if (response.success && response.orders) {
                // Transform the API response to match our Order interface
                const formattedOrders: Order[] = response.orders.map(
                    (order: any) => ({
                        id: order.id.toString(),
                        orderNumber: order.orderNumber || `ORD-${order.id}`,
                        date: new Date(order.orderDate).toLocaleDateString(
                            "vi-VN",
                        ),
                        status: order.status,
                        total: order.total,
                        items: order.items.map((item: any) => ({
                            id: item.product.id,
                            name: item.product.name,
                            price: item.subPrice / item.quantity,
                            quantity: item.quantity,
                            image:
                                item.product.imageUrl ||
                                "/images/image-placeholder.webp",
                            imageUrl:
                                item.product.imageUrl ||
                                "/images/image-placeholder.webp",
                        })),
                    }),
                );

                setOrders(formattedOrders);
            } else {
                setError("Could not retrieve order history");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Failed to load order history. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    // Handle order cancellation
    const handleCancelOrder = async (orderId: string) => {
        try {
            setProcessingOrderId(orderId);
            const response = await cancelOrder(orderId);

            if (response.success) {
                toast.success("Đơn hàng đã được hủy thành công");
                // Refresh order list
                fetchOrderHistory();
            } else {
                toast.error(response.message || "Không thể hủy đơn hàng");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi hủy đơn hàng");
            console.error("Error cancelling order:", error);
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handle payment initiation
    const handlePayOrder = async (orderId: string) => {
        try {
            setProcessingOrderId(orderId);
            const response = await initiateOrderPayment(orderId);

            if (response.success && response.redirectUrl) {
                // Redirect to payment page
                router.push(response.redirectUrl);
            } else {
                toast.error(
                    response.message || "Không thể thực hiện thanh toán",
                );
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xử lý thanh toán");
            console.error("Error initiating payment:", error);
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Map order status to display status
    const getStatusLabel = (status: Order["status"]) => {
        switch (status) {
            case "pending_approval":
                return {
                    label: "Chờ xác nhận",
                    className: "bg-yellow-100 text-yellow-800",
                };
            case "approved":
                return {
                    label: "Đã duyệt - Chờ thanh toán",
                    className: "bg-blue-100 text-blue-800",
                };
            case "payment_success":
                return {
                    label: "Đã thanh toán",
                    className: "bg-green-100 text-green-800",
                };
            case "payment_failure":
                return {
                    label: "Thanh toán thất bại",
                    className: "bg-red-100 text-red-800",
                };
            case "processing":
                return {
                    label: "Đang xử lý",
                    className: "bg-blue-100 text-blue-800",
                };
            case "delivering":
            case "shipping":
                return {
                    label: "Đang giao hàng",
                    className: "bg-indigo-100 text-indigo-800",
                };
            case "delivered":
            case "shipped":
            case "completed":
                return {
                    label: "Đã giao hàng",
                    className: "bg-green-100 text-green-800",
                };
            case "cancelled":
                return {
                    label: "Đã hủy",
                    className: "bg-red-100 text-red-800",
                };
            default:
                return {
                    label: "Không xác định",
                    className: "bg-gray-100 text-gray-800",
                };
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-white rounded-md"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Đơn hàng của tôi
            </h1>

            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const { label, className } = getStatusLabel(
                            order.status,
                        );

                        return (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                                    <div>
                                        <span className="font-medium">
                                            {order.orderNumber}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-4">
                                            Ngày đặt: {order.date}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
                                        >
                                            {label}
                                        </span>
                                        {[
                                            "shipping",
                                            "processing",
                                            "payment_success",
                                        ].includes(order.status) && (
                                            <Link
                                                href={`/track-order/${order.orderNumber}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Theo dõi đơn hàng
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded overflow-hidden">
                                                    <Image
                                                        src={
                                                            item.image ||
                                                            item.imageUrl ||
                                                            "/products/placeholder.jpg"
                                                        }
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <Tooltip
                                                        content={item.name}
                                                    >
                                                        <Link
                                                            href={`/product/${
                                                                item.id
                                                            }`}
                                                            className="text-sm font-medium text-gray-900 hover:text-primary truncate block"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </Tooltip>
                                                    <span className="text-sm text-gray-500">
                                                        {item.quantity} x{" "}
                                                        {formatCurrency(
                                                            item.price,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">
                                            {order.items.length} sản phẩm
                                        </span>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                Tổng tiền:
                                            </div>
                                            <div className="text-lg font-semibold text-primary">
                                                {formatCurrency(order.total)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <Link
                                            href={`/dashboard/orders/${order.id}`}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                        >
                                            Chi tiết
                                        </Link>

                                        {/* Payment button - only for approved orders */}
                                        {order.status === "approved" && (
                                            <button
                                                onClick={() =>
                                                    handlePayOrder(order.id)
                                                }
                                                disabled={
                                                    processingOrderId ===
                                                    order.id
                                                }
                                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                                            >
                                                {processingOrderId === order.id
                                                    ? "Đang xử lý..."
                                                    : "Thanh toán"}
                                            </button>
                                        )}

                                        {/* Review button - only for delivered/completed orders */}
                                        {(order.status === "delivered" ||
                                            order.status === "completed") && (
                                            <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-50">
                                                Đánh giá sản phẩm
                                            </button>
                                        )}

                                        {/* Cancel button - only for pending_approval or approved orders */}
                                        {(order.status === "pending_approval" ||
                                            order.status === "approved") && (
                                            <button
                                                onClick={() =>
                                                    handleCancelOrder(order.id)
                                                }
                                                disabled={
                                                    processingOrderId ===
                                                    order.id
                                                }
                                                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {processingOrderId === order.id
                                                    ? "Đang xử lý..."
                                                    : "Hủy đơn hàng"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">
                        Bạn chưa có đơn hàng nào
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
