"use client";

import React, { useEffect } from "react";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";
import HotSalesManager from "@/components/admin/products/HotSalesManager";

export default function HotSalesManagementPage() {
    useEffect(() => {
        document.title = "Admin - Hot Sales Management";
    }, []);

    return (
        <div className="p-6">
            <AdminBreadcrumb
                items={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Products", href: "/admin/products" },
                    { label: "Hot Sales", href: "/admin/products/hot-sales" },
                ]}
            />

            <div className="mt-6">
                <HotSalesManager />
            </div>
        </div>
    );
}
