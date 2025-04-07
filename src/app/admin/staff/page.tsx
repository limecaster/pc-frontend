"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    fetchAllStaff,
    deleteStaff,
    deactivateStaff,
    activateStaff,
} from "@/api/admin-staff";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faBan,
    faCheckCircle,
    faPlus,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/common/Pagination";

interface Staff {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: string;
    createdAt: string;
}

export default function StaffPage() {
    const router = useRouter();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const loadStaff = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetchAllStaff(page, 10);

            if (response.success) {
                setStaff(response.staff);
                setPagination({
                    currentPage: response.page,
                    totalPages: response.pages,
                    totalItems: response.total,
                });
            }
        } catch (error) {
            console.error("Error loading staff accounts:", error);
            toast.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    }, []);

    // Uh, this is to make sure the initial load only happens once
    const initialLoad = useRef(false);
    useEffect(() => {
        if (!initialLoad.current) {
            loadStaff(pagination.currentPage);
            initialLoad.current = true;
        }
    }, [loadStaff, pagination.currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadStaff(1);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination((prev) => ({ ...prev, currentPage: page }));
        loadStaff(page);
    };

    const handleDeleteStaff = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            return;
        }

        try {
            const response = await deleteStaff(id);

            if (response.success) {
                toast.success("Xóa nhân viên thành công");
                loadStaff(pagination.currentPage);
            }
        } catch (error) {
            console.error("Error deleting staff:", error);
            toast.error("Không thể xóa nhân viên");
        }
    };

    const toggleStaffStatus = async (id: number, currentStatus: string) => {
        const isActive = currentStatus === "active";
        const actionText = isActive ? "vô hiệu hóa" : "kích hoạt";

        if (
            !window.confirm(
                `Bạn có chắc chắn muốn ${actionText} nhân viên này?`,
            )
        ) {
            return;
        }

        try {
            let response;
            if (isActive) {
                response = await deactivateStaff(id);
            } else {
                response = await activateStaff(id);
            }

            if (response.success) {
                toast.success(
                    `${isActive ? "Vô hiệu hóa" : "Kích hoạt"} nhân viên thành công`,
                );
                loadStaff(pagination.currentPage);
            }
        } catch (error) {
            console.error(
                `Error ${isActive ? "deactivating" : "activating"} staff:`,
                error,
            );
            toast.error(`Không thể ${actionText} nhân viên`);
        }
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý nhân viên
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý tài khoản nhân viên trong hệ thống
                    </p>
                </div>
                <button
                    onClick={() => router.push("/admin/staff/add")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Thêm nhân viên
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {/* Search and filters */}
                <div className="mb-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                {/* Staff table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    ID
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Tên
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Vai trò
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Trạng thái
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-4 text-center"
                                    >
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : staff.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-4 text-center"
                                    >
                                        Không tìm thấy nhân viên nào
                                    </td>
                                </tr>
                            ) : (
                                staff.map((staffMember) => (
                                    <tr key={staffMember.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {staffMember.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {staffMember.firstname}{" "}
                                                {staffMember.lastname}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {staffMember.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {staffMember.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${
                                                    staffMember.status ===
                                                    "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {staffMember.status === "active"
                                                    ? "Hoạt động"
                                                    : "Vô hiệu hóa"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/staff/${staffMember.id}`,
                                                    )
                                                }
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                title="Chỉnh sửa"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                />
                                            </button>

                                            {/* Toggle activation status button */}
                                            <button
                                                onClick={() =>
                                                    toggleStaffStatus(
                                                        staffMember.id,
                                                        staffMember.status,
                                                    )
                                                }
                                                className={`${
                                                    staffMember.status ===
                                                    "active"
                                                        ? "text-yellow-600 hover:text-yellow-900"
                                                        : "text-green-600 hover:text-green-900"
                                                } mr-3`}
                                                title={
                                                    staffMember.status ===
                                                    "active"
                                                        ? "Vô hiệu hóa"
                                                        : "Kích hoạt"
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        staffMember.status ===
                                                        "active"
                                                            ? faBan
                                                            : faCheckCircle
                                                    }
                                                />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDeleteStaff(
                                                        staffMember.id,
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="mt-4">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
