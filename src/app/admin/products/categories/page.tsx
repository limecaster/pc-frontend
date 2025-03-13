"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faPlus,
    faCheck,
    faTimes,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
    fetchProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
} from "@/api/admin-products";
import toast from "react-hot-toast";

interface Category {
    name: string;
    productCount: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchProductCategories();
                console.log("Categories data:", data);

                // Handle different response formats properly
                let categoriesArray: string[] = [];

                if (Array.isArray(data)) {
                    categoriesArray = data;
                } else if (data && typeof data === "object") {
                    // If API returns an object, check for common array properties
                    if (Array.isArray(data.categories)) {
                        categoriesArray = data.categories;
                    } else if (Array.isArray(data.data)) {
                        categoriesArray = data.data;
                    } else if (Array.isArray(data.results)) {
                        categoriesArray = data.results;
                    }
                }

                // Transform data to include product counts
                const categoriesWithCount = categoriesArray.map(
                    (category: string) => ({
                        name: category,
                        productCount: 0, // You might want to fetch this information separately
                    }),
                );

                setCategories(categoriesWithCount);
            } catch (error) {
                console.error("Error loading categories:", error);
                toast.error("Không thể tải danh mục sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            setIsSubmitting(true);
            // Use the actual API call now
            await createProductCategory(newCategory);

            // Add to state after successful API call
            setCategories([
                ...categories,
                { name: newCategory, productCount: 0 },
            ]);
            setNewCategory("");
            toast.success("Thêm danh mục thành công");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Không thể thêm danh mục");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStart = (category: string) => {
        setEditingCategory(category);
        setEditValue(category);
    };

    const handleEditSave = async (oldCategory: string) => {
        if (!editValue.trim() || editValue === oldCategory) {
            setEditingCategory(null);
            return;
        }

        try {
            setIsSubmitting(true);
            // Use the actual API call now
            await updateProductCategory(oldCategory, editValue);

            // Update in state after successful API call
            setCategories(
                categories.map((cat) =>
                    cat.name === oldCategory
                        ? { ...cat, name: editValue }
                        : cat,
                ),
            );
            toast.success("Cập nhật danh mục thành công");
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Không thể cập nhật danh mục");
        } finally {
            setIsSubmitting(false);
            setEditingCategory(null);
        }
    };

    const handleDelete = async (category: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category}"?`)) {
            return;
        }

        try {
            setIsSubmitting(true);
            // Use the actual API call now
            await deleteProductCategory(category);

            // Remove from state after successful API call
            setCategories(categories.filter((cat) => cat.name !== category));
            toast.success("Xóa danh mục thành công");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Không thể xóa danh mục");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Quản lý danh mục sản phẩm
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Thêm, chỉnh sửa hoặc xóa các danh mục sản phẩm trong hệ
                    thống
                </p>
            </div>

            {/* Add new category form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Thêm danh mục mới
                </h2>
                <form
                    onSubmit={handleAddCategory}
                    className="flex items-center"
                >
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Tên danh mục"
                        className="px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 flex-grow"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-r-lg hover:opacity-90 transition-opacity disabled:opacity-70"
                        disabled={!newCategory.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="mr-2"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        )}
                        Thêm
                    </button>
                </form>
            </div>

            {/* Categories list */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Danh mục hiện có
                </h2>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            size="2x"
                            className="text-blue-600"
                        />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có danh mục nào trong hệ thống
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên danh mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số lượng sản phẩm
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr
                                        key={category.name}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingCategory ===
                                            category.name ? (
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) =>
                                                        setEditValue(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 w-full"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {category.productCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingCategory ===
                                            category.name ? (
                                                <div className="flex space-x-2 justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleEditSave(
                                                                category.name,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        disabled={isSubmitting}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faCheck}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setEditingCategory(
                                                                null,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={isSubmitting}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTimes}
                                                        />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-3 justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleEditStart(
                                                                category.name,
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        disabled={isSubmitting}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEdit}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                category.name,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={
                                                            isSubmitting ||
                                                            category.productCount >
                                                                0
                                                        }
                                                        title={
                                                            category.productCount >
                                                            0
                                                                ? "Không thể xóa danh mục có sản phẩm"
                                                                : "Xóa danh mục"
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
