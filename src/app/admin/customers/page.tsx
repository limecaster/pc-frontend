"use client";

import React, { useEffect, useState } from "react";
import { fetchAllCustomers, Customer } from "@/api/admin-customers";
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

const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
    { value: "pending_verification", label: "Chờ xác thực" },
    { value: "banned", label: "Bị khóa" },
];

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Pagination and filtering state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setIsSearching(true);
            const result = await fetchAllCustomers({
                page,
                limit,
                status,
                search,
            });

            setCustomers(result.customers);
            setTotalPages(result.pages);
            setTotalCustomers(result.total);
            setError(null);
        } catch (err) {
            setError("Không thể tải dữ liệu khách hàng. Vui lòng thử lại.");
            console.error(err);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [page, limit, status, search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1); // Reset to first page on new search
    };

    const handleClearFilters = () => {
        setStatus("");
        setSearch("");
        setSearchInput("");
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus === "all" ? "" : newStatus);
        setPage(1); // Reset to first page on status change
    };

    return (
        <div className="p-6">
            <AdminPageHeader
                title="Quản lý khách hàng"
                description="Xem và quản lý tất cả khách hàng"
            />

            {/* Filters */}
            <AdminCard className="mb-6 bg-white shadow-md">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col gap-1"
                            >
                                <label className="text-sm font-medium mb-1">
                                    Tìm kiếm
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Tìm theo tên, email, số điện thoại..."
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
                        <div className="md:text-right">
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                Xóa bộ lọc
                            </Button>
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
                ) : customers.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Không tìm thấy khách hàng nào
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tên khách hàng</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Số điện thoại</TableHead>
                                        <TableHead>Ngày đăng ký</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">
                                            Thao tác
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">
                                                {customer.id}
                                            </TableCell>
                                            <TableCell>
                                                {customer.firstname}{" "}
                                                {customer.lastname}
                                            </TableCell>
                                            <TableCell>
                                                {customer.email}
                                            </TableCell>
                                            <TableCell>
                                                {customer.phoneNumber || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(
                                                        customer.createdAt,
                                                    ),
                                                    "dd/MM/yyyy",
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusColors[
                                                            customer.status
                                                        ]
                                                    }
                                                >
                                                    {
                                                        statusLabels[
                                                            customer.status
                                                        ]
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/admin/customers/${customer.id}`}
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
                                Hiển thị {customers.length} / {totalCustomers}{" "}
                                khách hàng
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
