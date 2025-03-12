"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterFormProps {
    onSubmit: (fullName: string, email: string, password: string, username?: string) => void;
    isSubmitting?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
    onSubmit,
    isSubmitting = false 
}) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); 
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { isLoading } = useAuth();

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Initial registration validation
        const newErrors: Record<string, string> = {};
        
        if (!email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!validateEmail(email)) {
            newErrors.email = "Email không hợp lệ";
        }
        
        if (!username) {
            newErrors.username = "Username là bắt buộc";
        } else if (username.length < 3) {
            newErrors.username = "Username phải có ít nhất 3 ký tự";
        }
        
        if (!firstname) {
            newErrors.firstname = "Họ là bắt buộc";
        }
        
        if (!lastname) {
            newErrors.lastname = "Tên là bắt buộc";
        }
        
        if (!password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = "Nhập lại mật khẩu là bắt buộc";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Submit registration data to parent component
        onSubmit(`${firstname} ${lastname}`, email, password, username);
    };

    const handleInputChange = (field: string, value: string) => {
        setErrors(prev => {
            const updated = {...prev};
            delete updated[field];
            return updated;
        });

        switch (field) {
            case 'email':
                setEmail(value);
                break;
            case 'username':
                setUsername(value);
                break;
            case 'firstname':
                setFirstname(value);
                break;
            case 'lastname':
                setLastname(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
            default:
                break;
        }
    };

    const disabled = isLoading || isSubmitting;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6 self-stretch text-gray-800">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.email ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Nhập địa chỉ email"
                    disabled={disabled}
                />
                {errors.email && (
                    <span className="text-xs text-red-500 mt-1">{errors.email}</span>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.username ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Chọn username"
                    disabled={disabled}
                />
                {errors.username && (
                    <span className="text-xs text-red-500 mt-1">{errors.username}</span>
                )}
            </div>

            <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-medium text-neutral-600">
                        Họ
                    </label>
                    <input
                        type="text"
                        value={firstname}
                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                        className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                            errors.firstname ? "border-red-500" : "border-[#E4E7E9]"
                        }`}
                        placeholder="Họ"
                        disabled={disabled}
                    />
                    {errors.firstname && (
                        <span className="text-xs text-red-500 mt-1">{errors.firstname}</span>
                    )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-medium text-neutral-600">
                        Tên
                    </label>
                    <input
                        type="text"
                        value={lastname}
                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                        className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                            errors.lastname ? "border-red-500" : "border-[#E4E7E9]"
                        }`}
                        placeholder="Tên"
                        disabled={disabled}
                    />
                    {errors.lastname && (
                        <span className="text-xs text-red-500 mt-1">{errors.lastname}</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600">
                    Mật khẩu
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.password ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Nhập mật khẩu"
                    disabled={disabled}
                />
                {errors.password && (
                    <span className="text-xs text-red-500 mt-1">{errors.password}</span>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600">
                    Xác nhận mật khẩu
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                        errors.confirmPassword ? "border-red-500" : "border-[#E4E7E9]"
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    disabled={disabled}
                />
                {errors.confirmPassword && (
                    <span className="text-xs text-red-500 mt-1">{errors.confirmPassword}</span>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-5 py-3.5 px-6 bg-primary text-white rounded-md font-medium w-full flex justify-center items-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-primary-dark"}`}
            >
                <span>{isSubmitting ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}</span>
                {!isSubmitting && (
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/2c2149ae3c405dce61079c18695dad90fa1ed8e56693380a2c000152af016002?placeholderIfAbsent=true"
                        alt="Đăng ký icon"
                        className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                    />
                )}
            </button>
        </form>
    );
};
