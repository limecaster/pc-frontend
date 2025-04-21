"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faEye,
    faSort,
    faSortUp,
    faSortDown,
    faSearch,
    faCaretRight,
    faCaretLeft,
} from "@fortawesome/free-solid-svg-icons";
import { deleteProduct } from "@/api/admin-products";
import toast from "react-hot-toast";

interface ProductTableProps {
    products: any[];
    loading: boolean;
    onDelete: (id: string) => void;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
    onPageChange: (page: number) => void;
    onSort: (field: string) => void;
    sortField: string;
    sortOrder: "asc" | "desc";
    onSearch: (query: string) => void;
    searchQuery: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    loading,
    onDelete,
    pagination,
    onPageChange,
    onSort,
    sortField,
    sortOrder,
    onSearch,
    searchQuery,
}) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const confirmDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const handleDelete = async () => {
        if (deleteConfirmId) {
            try {
                await deleteProduct(deleteConfirmId);
                onDelete(deleteConfirmId);
                toast.success("Sản phẩm đã được xóa thành công");
            } catch (error) {
                toast.error("Không thể xóa sản phẩm");
                console.error("Error deleting product:", error);
            }
            setDeleteConfirmId(null);
        }
    };

    const cancelDelete = () => setDeleteConfirmId(null);

    const getSortIcon = (field: string) => {
        if (sortField !== field) return <FontAwesomeIcon icon={faSort} />;
        return sortOrder === "asc" ? (
            <FontAwesomeIcon icon={faSortUp} />
        ) : (
            <FontAwesomeIcon icon={faSortDown} />
        );
    };

    const handleSortClick = (field: string) => {
        onSort(field);
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            {/* Search Bar */}
            <div className="mb-4 flex">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute right-3 top-3 text-gray-400"
                    />
                </div>
                <Link
                    href="/admin/products/add"
                    className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Products Table */}
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("id")}
                            >
                                ID {getSortIcon("id")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("name")}
                            >
                                Tên sản phẩm {getSortIcon("name")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("category")}
                            >
                                Danh mục {getSortIcon("category")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("price")}
                            >
                                Giá {getSortIcon("price")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("stock")}
                            >
                                Tồn kho {getSortIcon("stock")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            <button
                                className="flex items-center"
                                onClick={() => handleSortClick("status")}
                            >
                                Trạng thái {getSortIcon("status")}
                            </button>
                        </th>
                        <th className="py-3 px-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider border-b">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                    {product.id.substring(0, 8)}...
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        {product.thumbnail && (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded mr-3"
                                            />
                                        )}
                                        <span className="font-medium">
                                            {product.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    {product.category}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    {Number(product.price).toLocaleString()}₫
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    {product.stockQuantity}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {product.status === "active"
                                            ? "Đang bán"
                                            : "Ngừng bán"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="text-yellow-600 hover:text-yellow-900"
                                            title="Chỉnh sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                        {/* <button
                                            onClick={() =>
                                                confirmDelete(product.id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                            title="Xóa sản phẩm"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button> */}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="py-4 text-center text-gray-500"
                            >
                                Không tìm thấy sản phẩm nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                    Hiển thị{" "}
                    {pagination.currentPage > 0
                        ? (pagination.currentPage - 1) * 10 + 1
                        : 0}{" "}
                    đến{" "}
                    {Math.min(
                        pagination.currentPage * 10,
                        pagination.totalItems,
                    )}{" "}
                    trong tổng số {pagination.totalItems} sản phẩm
                </div>
                <div className="flex space-x-1">
                    <button
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className={`px-3 py-1 rounded-md ${pagination.currentPage <= 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                    >
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </button>

                    {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1,
                    )
                        .filter(
                            (page) =>
                                page === 1 ||
                                page === pagination.totalPages ||
                                (page >= pagination.currentPage - 1 &&
                                    page <= pagination.currentPage + 1),
                        )
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="px-3 py-1">...</span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`px-3 py-1 rounded-md ${pagination.currentPage === page
                                        ? "bg-primary text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}

                    <button
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={
                            pagination.currentPage >= pagination.totalPages
                        }
                        className={`px-3 py-1 rounded-md ${pagination.currentPage >= pagination.totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                    >
                        <FontAwesomeIcon icon={faCaretRight} />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">
                            Xác nhận xóa sản phẩm
                        </h3>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm này? Hành động
                            này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;
