"use client";

import React, { use, useEffect, useState } from "react";
import {
    fetchOrderById,
    updateOrderStatus,
    Order,
    OrderStatus,
    mapStatusFromBackend,
} from "@/api/admin-orders";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    RefreshCw,
} from "lucide-react";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AdminCard from "@/components/admin/common/AdminCard";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const statusLabels: Record<OrderStatus, string> = {
    pending_approval: "Chờ xác nhận",
    approved: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
    payment_success: "Đã thanh toán",
};

const statusOptions = [
    {
        value: "approved",
        label: "Xác nhận đơn hàng",
        allowedFrom: ["pending_approval"],
    },
    { value: "processing", label: "Đang xử lý", allowedFrom: ["approved"] },
    { value: "shipped", label: "Đang giao hàng", allowedFrom: ["processing"] },
    { value: "delivered", label: "Đã giao hàng", allowedFrom: ["shipped"] },
    {
        value: "cancelled",
        label: "Hủy đơn hàng",
        allowedFrom: ["pending_approval", "approved"],
    },
    {
        value: "refunded",
        label: "Hoàn tiền",
        allowedFrom: ["cancelled", "delivered"],
    },
];

export default function AdminOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

    const { id } = use(params);
    const orderId = parseInt(id);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const data = await fetchOrderById(orderId);
                // Map the backend status to frontend status format
                data.status = mapStatusFromBackend(data.status);
                setOrder(data);
                setError(null);
            } catch (err) {
                setError("Failed to load order details. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const handleStatusChange = async () => {
        if (!selectedStatus || !order) return;

        try {
            setUpdating(true);
            await updateOrderStatus(order.id, selectedStatus as OrderStatus);

            // Refresh order data
            const updatedOrder = await fetchOrderById(orderId);
            setOrder(updatedOrder);

            toast.success(
                `Order status updated to ${statusLabels[selectedStatus as OrderStatus]}`,
            );
            setSelectedStatus("");
        } catch (err) {
            toast.error("Failed to update order status");
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const getAvailableStatusOptions = () => {
        if (!order) return [];

        return statusOptions.filter((option) =>
            option.allowedFrom.includes(order.status),
        );
    };

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Chi tiết đơn hàng"
                description={
                    order ? `Đơn hàng #${order.orderNumber}` : "Đang tải..."
                }
                backButton={{
                    label: "Quay lại",
                    href: "/admin/orders",
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                }}
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
            ) : order ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Order Summary */}
                    <AdminCard className="md:col-span-1 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Mã đơn hàng:
                                </span>
                                <span className="font-medium">
                                    {order.orderNumber}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ngày đặt:</span>
                                <span>
                                    {format(
                                        new Date(order.orderDate),
                                        "dd/MM/yyyy HH:mm",
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Trạng thái:
                                </span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Phương thức thanh toán:
                                </span>
                                <span>{order.paymentMethod}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between text-gray-500">
                                    <span>Tổng tiền sản phẩm:</span>
                                    <span>
                                        {formatCurrency(
                                            order.items.reduce(
                                                (acc, item) =>
                                                    acc +
                                                    item.price * item.quantity,
                                                0,
                                            ),
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Giảm giá:</span>
                                    <span>
                                        -{formatCurrency(order.discountAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Phí vận chuyển:</span>
                                    <span>
                                        {formatCurrency(order.shippingFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold mt-2">
                                    <span>Tổng thanh toán:</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </AdminCard>

                    {/* Customer Info */}
                    <AdminCard className="md:col-span-1 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle>Thông tin khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Họ tên:</span>
                                <span className="font-medium">
                                    {order.customerName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span>{order.customerEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Số điện thoại:
                                </span>
                                <span>{order.customerPhone}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <span className="text-gray-500">
                                    Địa chỉ giao hàng:
                                </span>
                                <p className="mt-1">{order.deliveryAddress}</p>
                            </div>
                        </CardContent>
                    </AdminCard>

                    {/* Order Actions */}
                    <AdminCard className="md:col-span-1 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle>Cập nhật đơn hàng</CardTitle>
                            <CardDescription>
                                Thay đổi trạng thái đơn hàng
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Trạng thái mới
                                </label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(value: string) =>
                                        setSelectedStatus(value as OrderStatus)
                                    }
                                    disabled={
                                        getAvailableStatusOptions().length === 0
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái mới" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {getAvailableStatusOptions().map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStatusChange}
                                disabled={!selectedStatus || updating}
                                className="w-full text-white"
                            >
                                {updating
                                    ? "Đang cập nhật..."
                                    : "Cập nhật trạng thái"}
                            </Button>
                        </CardContent>
                    </AdminCard>

                    {/* Order Items */}
                    <AdminCard className="md:col-span-3 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle>Sản phẩm đã đặt</CardTitle>
                            <CardDescription>
                                Danh sách sản phẩm trong đơn hàng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 text-left">
                                                Sản phẩm
                                            </th>
                                            <th className="py-3 text-right">
                                                Giá
                                            </th>
                                            <th className="py-3 text-right">
                                                Số lượng
                                            </th>
                                            <th className="py-3 text-right">
                                                Thành tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b"
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center">
                                                        {item.imageUrl && (
                                                            <div className="w-12 h-12 mr-4 rounded border overflow-hidden">
                                                                <img
                                                                    src={
                                                                        item.imageUrl
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <span>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 text-right">
                                                    {formatCurrency(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </AdminCard>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Order not found</p>
                </div>
            )}
        </div>
    );
}
