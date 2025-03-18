"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
    onSubmit: (loginId: string, password: string) => void;
    onForgotPassword: () => void;
    isSubmitting?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit,
    onForgotPassword,
    isSubmitting = false,
}) => {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{
        loginId?: string;
        password?: string;
    }>({});
    const { isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const newErrors: { loginId?: string; password?: string } = {};
        if (!loginId) newErrors.loginId = "Username hoặc email là bắt buộc";
        if (!password) newErrors.password = "Mật khẩu là bắt buộc";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Call the onSubmit function from props
        onSubmit(loginId, password);
    };

    const handleInputChange = (
        field: "loginId" | "password",
        value: string,
    ) => {
        // Clear the specific error when the user types
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });

        // Update the appropriate state based on field
        if (field === "loginId") {
            setLoginId(value);
        } else {
            setPassword(value);
        }
    };

    const disabled = isLoading || isSubmitting;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-8 py-6 self-stretch w-full text-gray-800"
        >
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600">
                    Username/Email
                </label>
                <input
                    type="text"
                    value={loginId}
                    onChange={(e) =>
                        handleInputChange("loginId", e.target.value)
                    }
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.loginId ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Nhập username hoặc email"
                    disabled={disabled}
                />
                {errors.loginId && (
                    <span className="text-xs text-red-500 mt-1">
                        {errors.loginId}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                    <label className="text-xs font-medium text-neutral-600">
                        Mật khẩu
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs font-medium text-primary cursor-pointer hover:text-primary-dark focus:outline-none"
                        disabled={disabled}
                    >
                        Quên mật khẩu?
                    </button>
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                        handleInputChange("password", e.target.value)
                    }
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.password ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Nhập mật khẩu"
                    disabled={disabled}
                />
                {errors.password && (
                    <span className="text-xs text-red-500 mt-1">
                        {errors.password}
                    </span>
                )}
            </div>
            <button
                type="submit"
                disabled={disabled}
                className={`mt-5 flex gap-2.5 px-5 py-3.5 text-sm font-medium text-white rounded-md justify-center items-center w-full bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                    disabled ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
                <span>{isSubmitting ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}</span>
                {!disabled && (
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/2c2149ae3c405dce61079c18695dad90fa1ed8e56693380a2c000152af016002?placeholderIfAbsent=true"
                        alt="Đăng nhập icon"
                        className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                    />
                )}
            </button>
        </form>
    );
};
