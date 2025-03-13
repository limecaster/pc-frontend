"use client";

import React from "react";
import ProductForm from "@/components/admin/products/ProductForm";

export default function AddProductPage() {
    return (
        <div className="p-6 bg-gray-50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Điền thông tin để tạo sản phẩm mới
                </p>
            </div>

            <ProductForm mode="add" />
        </div>
    );
}
