"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/admin/products/ProductTable";
import { fetchProducts } from "@/api/admin-products"; // Change back to fetchProducts for now
import toast from "react-hot-toast";

// Add a proper interface for the product
interface Product {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    status: string;
    category: string;
    // Add other properties as needed
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null,
    );

    const loadProducts = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                const params: Record<string, string> = {
                    page: page.toString(),
                    limit: "10",
                    sortField: sortField,
                    sortOrder: sortOrder,
                };

                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Use fetchProducts instead - we'll modify this function to call the admin endpoint
                const data = await fetchProducts(params);
                setProducts(data.products || []);
                setPagination({
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalItems || 0,
                });
            } catch (error) {
                console.error("Error loading products:", error);
                toast.error("Không thể tải danh sách sản phẩm");
            } finally {
                setLoading(false);
            }
        },
        [sortField, sortOrder, searchQuery],
    );

    useEffect(() => {
        loadProducts(pagination.currentPage);
    }, [loadProducts, pagination.currentPage]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const handleSort = (field: string) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleDelete = (id: string) => {
        setProducts((prev) => prev.filter((product) => product.id !== id));
        setPagination((prev) => ({
            ...prev,
            totalItems: prev.totalItems - 1,
        }));
    };

    return (
        <div className="p-6 bg-gray-50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Quản lý sản phẩm
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Thêm, chỉnh sửa hoặc xóa các sản phẩm trong hệ thống
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ProductTable
                    products={products}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSearch={handleSearch}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}
