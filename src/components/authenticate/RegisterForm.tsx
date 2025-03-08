"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "./LoginButton";

interface RegisterFormProps {
    onSubmit: (fullName: string, email: string, password: string, username?: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); 
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [remainingTime, setRemainingTime] = useState(0);
    const { isLoading, register, verifyEmail, resendOtp } = useAuth();

    // Timer for OTP resend countdown
    useEffect(() => {
        if (remainingTime <= 0) return;
        
        const timer = setTimeout(() => {
            setRemainingTime(prev => prev - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [remainingTime]);

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (showOtpField) {
            // OTP verification stage
            if (!otpCode) {
                setErrors({ otpCode: "Mã xác thực là bắt buộc" });
                return;
            }
            
            try {
                await verifyEmail(email, otpCode);
                // Call onSubmit to complete the registration and navigate
                onSubmit(`${firstname} ${lastname}`, email, password, username);
            } catch (err) {
                // Error handling by auth context
                // Specific error for OTP
                const errorMessage = err instanceof Error ? err.message : 'Mã OTP không hợp lệ';
                setErrors(prev => ({ ...prev, otpCode: errorMessage }));
            }
            return;
        }
        
        // Initial registration stage
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
        
        // Submit registration data
        try {
            const result = await register(email, password, username, firstname, lastname);
            if (result) {
                setShowOtpField(true);
                setRemainingTime(120); // 2 minutes countdown
            }
        } catch (err) {
            // Map backend errors to specific fields when possible
            const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại';
            
            if (errorMessage.toLowerCase().includes('email')) {
                setErrors(prev => ({ ...prev, email: errorMessage }));
            } else if (errorMessage.toLowerCase().includes('username')) {
                setErrors(prev => ({ ...prev, username: errorMessage }));
            } else {
                // General error handled by auth context
            }
        }
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
            case 'otpCode':
                setOtpCode(value);
                break;
            default:
                break;
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtp(email, 'verification');
            setRemainingTime(120); // Reset timer to 2 minutes
        } catch (err) {
            // Error is handled by auth context
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-6 self-stretch text-gray-800">
            {showOtpField ? (
                <>
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Xác thực email</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Chúng tôi đã gửi một mã xác thực gồm 6 chữ số đến email {email}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-600">
                            Mã OTP
                        </label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => handleInputChange('otpCode', e.target.value)}
                            className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                                errors.otpCode ? "border-red-500" : "border-[#E4E7E9]"
                            }`}
                            placeholder="Nhập mã OTP 6 chữ số"
                            maxLength={6}
                            disabled={isLoading}
                        />
                        {errors.otpCode && (
                            <span className="text-xs text-red-500 mt-1">{errors.otpCode}</span>
                        )}
                    </div>
                    
                    <div className="flex justify-center mt-2">
                        {remainingTime > 0 ? (
                            <p className="text-sm text-gray-500">
                                Gửi lại mã sau {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-sm text-primary hover:text-primary-dark"
                                disabled={isLoading}
                            >
                                Gửi lại mã OTP
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className="text-xs text-red-500 mt-1">{errors.confirmPassword}</span>
                        )}
                    </div>
                </>
            )}

            <LoginButton 
                type="submit"
                className="mt-5" 
                disabled={isLoading}
            >
                <span>
                    {isLoading ? "ĐANG XỬ LÝ..." : (showOtpField ? "XÁC THỰC" : "ĐĂNG KÝ")}
                </span>
                {!isLoading && (
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/2c2149ae3c405dce61079c18695dad90fa1ed8e56693380a2c000152af016002?placeholderIfAbsent=true"
                        alt="Đăng ký icon"
                        className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                    />
                )}
            </LoginButton>
        </form>
    );
};
