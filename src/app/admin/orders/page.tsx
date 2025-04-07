"use client";

import React, { useEffect, useState } from "react";
import {
    fetchAllOrders,
    Order,
    OrderStatus,
    mapStatusFromBackend,
} from "@/api/admin-orders";
import { format } from "date-fns";
import Link from "next/link";
import { BsEye, BsSearch } from "react-icons/bs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminCard from "@/components/admin/common/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const statusColors: Record<OrderStatus, string> = {
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
    payment_success: "bg-green-100 text-green-800",
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
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending_approval", label: "Chờ xác nhận" },
    { value: "approved", label: "Đã xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipped", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao hàng" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "refunded", label: "Đã hoàn tiền" },
    { value: "payment_success", label: "Đã thanh toán" },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Pagination and filtering state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });

    const loadOrders = async () => {
        try {
            setLoading(true);
            setIsSearching(true);
            const result = await fetchAllOrders({
                page,
                limit,
                status,
                search,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });

            setOrders(result.orders);
            setTotalPages(result.pages);
            setTotalOrders(result.total);
            setError(null);
        } catch (err) {
            setError("Failed to load orders. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page, limit, status, search, dateRange]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1); // Reset to first page on new search
    };

    const handleClearFilters = () => {
        setStatus("");
        setSearch("");
        setSearchInput("");
        setDateRange({ startDate: "", endDate: "" });
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus === "all" ? "" : newStatus);
        setPage(1); // Reset to first page on status change
    };

    const handleDateChange = (
        field: "startDate" | "endDate",
        value: string,
    ) => {
        setDateRange((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPage(1); // Reset to first page on date change
    };

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Quản lý đơn hàng"
                description="Xem và quản lý tất cả đơn hàng"
            />

            {/* Filters */}
            <AdminCard className="mb-6 bg-white shadow-md">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="col-span-1 md:col-span-2">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col md:flex-row md:items-center gap-1"
                            >
                                <label className="text-sm font-medium"></label>
                                <div className="flex gap-2 w-full">
                                    <Input
                                        placeholder="Tìm theo mã đơn hàng, tên KH, email, SĐT..."
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                        className="w-full"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                        ) : (
                                            <BsSearch className="h-4 w-4 text-white" />
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div>
                            <Select
                                value={status || "all"}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Từ ngày
                            </label>
                            <Input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) =>
                                    handleDateChange(
                                        "startDate",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Đến ngày
                            </label>
                            <Input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) =>
                                    handleDateChange("endDate", e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>
            </AdminCard>

            <AdminCard className="bg-white shadow-md">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Không tìm thấy đơn hàng nào
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">
                                            Thao tác
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(order.orderDate),
                                                    "dd/MM/yyyy HH:mm",
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {order.customerName}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                            <TableCell>
                                                <OrderStatusBadge
                                                    status={mapStatusFromBackend(
                                                        order.status,
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    <BsEye className="mr-1" />{" "}
                                                    Xem
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-gray-500">
                                Hiển thị {orders.length} / {totalOrders} đơn
                                hàng
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={limit.toString()}
                                    onValueChange={(value) => {
                                        setLimit(Number(value));
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(page - 1)
                                        }
                                        disabled={page === 1}
                                    >
                                        Trước
                                    </Button>
                                    <span className="mx-2">
                                        {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(page + 1)
                                        }
                                        disabled={page === totalPages}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </AdminCard>
        </div>
    );
}
