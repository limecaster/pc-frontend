"use client";

import React from "react";
import StaffForm from "@/components/admin/staff/StaffForm";

export default function AddStaffPage() {
    return (
        <div className="p-6 bg-gray-50 text-gray-800">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Thêm nhân viên mới
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Tạo tài khoản nhân viên mới trong hệ thống
                </p>
            </div>

            <StaffForm mode="add" />
        </div>
    );
}
