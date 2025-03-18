"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StaffForm from "@/components/admin/staff/StaffForm";
import { fetchStaffById } from "@/api/admin-staff";
import toast from "react-hot-toast";

export default function EditStaffPage() {
    const params = useParams();
    const staffId = Number(params?.id);
    const [loading, setLoading] = useState(true);
    const [staffExists, setStaffExists] = useState(false);

    useEffect(() => {
        if (!staffId) return;

        const checkStaff = async () => {
            try {
                await fetchStaffById(staffId);
                setStaffExists(true);
            } catch (error) {
                console.error("Error loading staff:", error);
                toast.error("Không tìm thấy nhân viên hoặc có lỗi xảy ra");
                setStaffExists(false);
            } finally {
                setLoading(false);
            }
        };

        checkStaff();
    }, [staffId]);

    if (loading) {
        return (
            <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                    <div className="text-center text-gray-500">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (!staffExists) {
        return (
            <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                    <div className="text-center text-red-500">
                        Không tìm thấy thông tin nhân viên hoặc bạn không có
                        quyền truy cập.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 text-gray-800">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa thông tin nhân viên
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Cập nhật thông tin tài khoản nhân viên
                </p>
            </div>

            <StaffForm mode="edit" staffId={staffId} />
        </div>
    );
}
