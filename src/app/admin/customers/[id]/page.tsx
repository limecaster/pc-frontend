"use client";

import React, { use, useEffect, useState } from "react";
import {
    fetchCustomerById,
    fetchCustomerOrders,
    updateCustomerStatus,
    Customer,
} from "@/api/admin-customers";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { mapStatusFromBackend } from "@/api/admin-orders";

const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending_verification: "bg-yellow-100 text-yellow-800",
    banned: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    pending_verification: "Chờ xác thực",
    banned: "Bị khóa",
};

export default function AdminCustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const { id } = use(params);
    const customerId = parseInt(id);
    const router = useRouter();

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                setLoading(true);
                const data = await fetchCustomerById(customerId);
                setCustomer(data);

                // Load customer orders
                const orderData = await fetchCustomerOrders(customerId);
                setOrders(orderData);

                setError(null);
            } catch (err) {
                setError(
                    "Không thể tải thông tin khách hàng. Vui lòng thử lại.",
                );
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            loadCustomer();
        }
    }, [customerId]);

    const handleStatusChange = async () => {
        if (!selectedStatus || !customer) return;

        try {
            setUpdating(true);
            await updateCustomerStatus(customer.id, selectedStatus);

            // Refresh customer data
            const updatedCustomer = await fetchCustomerById(customerId);
            setCustomer(updatedCustomer);

            toast.success(
                `Cập nhật trạng thái thành công: ${statusLabels[selectedStatus]}`,
            );
            setSelectedStatus("");
        } catch (err) {
            toast.error("Không thể cập nhật trạng thái khách hàng");
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const getAddress = () => {
        if (!customer) return "Không có thông tin";

        const addressParts = [
            customer.street,
            customer.ward,
            customer.district,
            customer.city,
        ].filter(Boolean);

        return addressParts.length > 0
            ? addressParts.join(", ")
            : "Không có thông tin";
    };

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Chi tiết khách hàng"
                description={
                    customer
                        ? `${customer.firstname} ${customer.lastname}`
                        : "Đang tải..."
                }
                backButton={{
                    label: "Quay lại",
                    href: "/admin/customers",
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                }}
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
            ) : customer ? (
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="info">Thông tin</TabsTrigger>
                        <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Customer Info */}
                            <AdminCard className="md:col-span-2 bg-white shadow-md">
                                <CardHeader>
                                    <CardTitle>Thông tin khách hàng</CardTitle>
                                    <CardDescription>
                                        Chi tiết thông tin tài khoản
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                ID
                                            </p>
                                            <p className="font-medium">
                                                {customer.id}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Tên tài khoản
                                            </p>
                                            <p className="font-medium">
                                                {customer.username}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Họ tên
                                            </p>
                                            <p className="font-medium">
                                                {customer.firstname}{" "}
                                                {customer.lastname}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Email
                                            </p>
                                            <div className="flex items-center">
                                                <p className="font-medium">
                                                    {customer.email}
                                                </p>
                                                {customer.isEmailVerified && (
                                                    <Badge className="ml-2 bg-green-100 text-green-800">
                                                        Đã xác thực
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Số điện thoại
                                            </p>
                                            <p className="font-medium">
                                                {customer.phoneNumber ||
                                                    "Chưa cung cấp"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Trạng thái
                                            </p>
                                            <Badge
                                                className={
                                                    statusColors[
                                                        customer.status
                                                    ]
                                                }
                                            >
                                                {statusLabels[customer.status]}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Ngày đăng ký
                                            </p>
                                            <p className="font-medium">
                                                {format(
                                                    new Date(
                                                        customer.createdAt,
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                )}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                Lần đăng nhập cuối
                                            </p>
                                            <p className="font-medium">
                                                {customer.latestLogin
                                                    ? format(
                                                          new Date(
                                                              customer.latestLogin,
                                                          ),
                                                          "dd/MM/yyyy HH:mm",
                                                      )
                                                    : "Chưa đăng nhập"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Địa chỉ
                                        </p>
                                        <p>{getAddress()}</p>
                                    </div>
                                </CardContent>
                            </AdminCard>

                            {/* Customer Actions */}
                            <AdminCard className="md:col-span-1 bg-white shadow-md">
                                <CardHeader>
                                    <CardTitle>Quản lý tài khoản</CardTitle>
                                    <CardDescription>
                                        Thay đổi trạng thái tài khoản
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Trạng thái tài khoản
                                        </label>
                                        <Select
                                            value={selectedStatus}
                                            onValueChange={(value: string) =>
                                                setSelectedStatus(value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="active">
                                                    Hoạt động
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Không hoạt động
                                                </SelectItem>
                                                <SelectItem value="banned">
                                                    Khóa tài khoản
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleStatusChange}
                                        disabled={!selectedStatus || updating}
                                        className="w-full text-white bg-primary hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                    >
                                        {updating
                                            ? "Đang cập nhật..."
                                            : "Cập nhật trạng thái"}
                                    </Button>
                                </CardContent>
                            </AdminCard>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders">
                        <AdminCard className="bg-white shadow-md">
                            <CardHeader>
                                <CardTitle>Lịch sử đơn hàng</CardTitle>
                                <CardDescription>
                                    Danh sách đơn hàng của khách hàng
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">
                                            Khách hàng chưa có đơn hàng nào
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-3 text-left">
                                                        Mã đơn hàng
                                                    </th>
                                                    <th className="py-3 text-left">
                                                        Ngày đặt
                                                    </th>
                                                    <th className="py-3 text-right">
                                                        Tổng tiền
                                                    </th>
                                                    <th className="py-3 text-center">
                                                        Trạng thái
                                                    </th>
                                                    <th className="py-3 text-right">
                                                        Hành động
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="border-b"
                                                    >
                                                        <td className="py-4">
                                                            {order.orderNumber}
                                                        </td>
                                                        <td className="py-4">
                                                            {format(
                                                                new Date(
                                                                    order.orderDate,
                                                                ),
                                                                "dd/MM/yyyy",
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            {formatCurrency(
                                                                order.total,
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <OrderStatusBadge
                                                                status={mapStatusFromBackend(
                                                                    order.status,
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/admin/orders/${order.id}`,
                                                                    )
                                                                }
                                                            >
                                                                Xem
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </AdminCard>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Không tìm thấy khách hàng</p>
                </div>
            )}
        </div>
    );
}
