"use client";

import React from "react";
import OrderManagement from "@/components/staff/OrderManagement";

export default function StaffOrdersPage() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Quản lý đơn hàng
            </h1>
            <OrderManagement />
        </div>
    );
}
