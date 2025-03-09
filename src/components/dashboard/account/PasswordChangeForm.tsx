"use client";

import React, { useState } from "react";
import { changePassword } from "@/api/account";
import { toast } from "react-hot-toast";

const PasswordChangeForm: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(
                formData.newPassword,
            )
        ) {
            newErrors.newPassword =
                "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            await changePassword(formData);

            toast.success("Đổi mật khẩu thành công!");

            // Reset form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Error changing password:", error);

            if (error instanceof Error) {
                // Show specific error message if available
                if (error.message.includes("incorrect")) {
                    setErrors((prev) => ({
                        ...prev,
                        currentPassword: "Mật khẩu hiện tại không đúng",
                    }));
                } else {
                    toast.error(
                        error.message ||
                            "Không thể đổi mật khẩu. Vui lòng thử lại!",
                    );
                }
            } else {
                toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
                Đổi mật khẩu
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.currentPassword
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.currentPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.newPassword
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PasswordChangeForm;
