import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    getAllConfigurations,
    deleteConfiguration,
    PCConfiguration,
} from "@/api/pc-configuration";
import { formatPrice } from "@/utils/format";
import Pagination from "@/components/common/Pagination";

const PCConfigurationsPage = () => {
    const [configurations, setConfigurations] = useState<PCConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;
    const totalPages = Math.ceil(configurations.length / pageSize) || 1;
    const router = useRouter();

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const data = await getAllConfigurations();
            setConfigurations(data);
        } catch (error) {
            console.error("Error loading configurations:", error);
            toast.error("Không thể tải danh sách cấu hình");
        } finally {
            setLoading(false);
        }
    };

    const handleEditConfiguration = (id: string) => {
        router.push(`/manual-build-pc?configId=${id}`);
    };

    const handleDeleteConfiguration = async (id: string) => {
        try {
            await deleteConfiguration(id);
            toast.success("Đã xóa cấu hình thành công");
            loadConfigurations(); // Reload the list
            setConfirmDelete(null); // Close confirmation
        } catch (error) {
            console.error("Error deleting configuration:", error);
            toast.error("Không thể xóa cấu hình này");
        }
    };

    if (loading) {
        return (
            <div className="py-8 px-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">
                    Đang tải danh sách cấu hình...
                </p>
            </div>
        );
    }

    if (configurations.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Chưa có cấu hình nào
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Bạn chưa lưu cấu hình PC nào. Hãy tạo một cấu hình mới.
                    </p>
                    <button
                        className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={() => router.push("/manual-build-pc")}
                    >
                        Tạo cấu hình mới
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Cấu hình PC đã lưu
                    </h2>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={() => router.push("/manual-build-pc")}
                    >
                        Tạo mới
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tên cấu hình
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Mục đích sử dụng
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Số linh kiện
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tổng giá
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Ngày cập nhật
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {configurations
                            .slice(
                                (currentPage - 1) * pageSize,
                                currentPage * pageSize,
                            )
                            .map((config: any) => (
                                <tr
                                    key={config.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {config.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {config.purpose || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {
                                                Object.keys(
                                                    config.products || {},
                                                ).length
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {formatPrice(config.totalPrice)} đ
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(
                                                config.updatedAt,
                                            ).toLocaleDateString("vi-VN")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {confirmDelete === config.id ? (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteConfiguration(
                                                            config.id,
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Xác nhận
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setConfirmDelete(null)
                                                    }
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end space-x-4">
                                                <button
                                                    onClick={() =>
                                                        handleEditConfiguration(
                                                            config.id,
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setConfirmDelete(
                                                            config.id,
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default PCConfigurationsPage;
