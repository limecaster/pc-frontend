"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/products/ProductForm";
import { fetchProductById } from "@/api/admin-products";
import toast from "react-hot-toast";

export default function EditProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const data = await fetchProductById(id as string);
                setProduct(data);
            } catch (error) {
                console.error("Error loading product:", error);
                setError("Không thể tải thông tin sản phẩm");
                toast.error("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa sản phẩm
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Cập nhật thông tin sản phẩm
                </p>
            </div>

            {product && <ProductForm mode="edit" product={product} />}
        </div>
    );
}
