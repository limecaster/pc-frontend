"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "./LoginButton";

interface ForgotPasswordFormProps {
    onSubmit: (email: string, otpCode?: string, newPassword?: string) => void;
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

type FormStage = "email" | "otp" | "newPassword";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onSubmit,
    onNavigateToLogin,
    onNavigateToRegister,
}) => {
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [stage, setStage] = useState<FormStage>("email");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [remainingTime, setRemainingTime] = useState(0);
    const {
        isLoading,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        resendOtp,
    } = useAuth();

    // Timer for OTP resend countdown
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setTimeout(() => {
            setRemainingTime((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [remainingTime]);

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        try {
            if (stage === "email") {
                // Validate email
                if (!email) {
                    setErrors({ email: "Email là bắt buộc" });
                    return;
                }

                if (!validateEmail(email)) {
                    setErrors({ email: "Email không hợp lệ" });
                    return;
                }

                // Send reset code/OTP
                await forgotPassword(email);
                setStage("otp");
                setRemainingTime(120); // 2 minutes countdown for OTP
            } else if (stage === "otp") {
                // Validate OTP
                if (!otpCode) {
                    setErrors({ otpCode: "Mã xác thực là bắt buộc" });
                    return;
                }

                if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
                    setErrors({ otpCode: "Mã OTP phải gồm 6 chữ số" });
                    return;
                }

                // Verify OTP
                try {
                    const isValid = await verifyResetOtp(email, otpCode);
                    if (isValid) {
                        setStage("newPassword");
                    }
                } catch (error) {
                    setErrors({
                        otpCode: "Mã OTP không hợp lệ hoặc đã hết hạn",
                    });
                    return;
                }
            } else if (stage === "newPassword") {
                // Validate passwords
                if (!newPassword) {
                    setErrors({ newPassword: "Mật khẩu mới là bắt buộc" });
                    return;
                }

                if (newPassword.length < 6) {
                    setErrors({
                        newPassword: "Mật khẩu mới phải có ít nhất 6 ký tự",
                    });
                    return;
                }

                if (!confirmPassword) {
                    setErrors({
                        confirmPassword: "Xác nhận mật khẩu là bắt buộc",
                    });
                    return;
                }

                if (newPassword !== confirmPassword) {
                    setErrors({ confirmPassword: "Mật khẩu không khớp" });
                    return;
                }

                // Reset password with OTP
                await resetPassword(email, otpCode, newPassword);
                onSubmit(email, otpCode, newPassword);
            }
        } catch (error) {
            // Error handling by auth context
            const errorMsg =
                error instanceof Error ? error.message : "Đã xảy ra lỗi";
            if (stage === "email") {
                setErrors({ email: errorMsg });
            } else if (stage === "otp") {
                setErrors({ otpCode: errorMsg });
            } else {
                setErrors({ newPassword: errorMsg });
            }
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });

        switch (field) {
            case "email":
                setEmail(value);
                break;
            case "otpCode":
                setOtpCode(value);
                break;
            case "newPassword":
                setNewPassword(value);
                break;
            case "confirmPassword":
                setConfirmPassword(value);
                break;
            default:
                break;
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtp(email, "reset");
            setRemainingTime(120); // Reset timer to 2 minutes
        } catch (err) {
            // Error is handled by auth context

            // Show error message
            const errorMsg =
                err instanceof Error ? err.message : "Đã xảy ra lỗi";
            setErrors({ otpCode: errorMsg });
        }
    };

    const handleBack = () => {
        if (stage === "otp") {
            setStage("email");
        } else if (stage === "newPassword") {
            setStage("otp");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-8 py-6 self-stretch text-gray-800"
        >
            <div className="text-center mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                    {stage === "email"
                        ? "Quên mật khẩu"
                        : stage === "otp"
                          ? "Nhập mã xác thực"
                          : "Đặt lại mật khẩu"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    {stage === "email"
                        ? "Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu"
                        : stage === "otp"
                          ? `Chúng tôi đã gửi mã OTP đến email ${email}`
                          : "Tạo mật khẩu mới cho tài khoản của bạn"}
                </p>
            </div>

            {stage === "email" && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            handleInputChange("email", e.target.value)
                        }
                        className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                            errors.email ? "border-red-500" : "border-[#E4E7E9]"
                        }`}
                        placeholder="Nhập địa chỉ email"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <span className="text-xs text-red-500 mt-1">
                            {errors.email}
                        </span>
                    )}
                </div>
            )}

            {stage === "otp" && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-600">
                            Mã OTP
                        </label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) =>
                                handleInputChange("otpCode", e.target.value)
                            }
                            className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                                errors.otpCode
                                    ? "border-red-500"
                                    : "border-[#E4E7E9]"
                            }`}
                            placeholder="Nhập mã OTP 6 chữ số"
                            maxLength={6}
                            disabled={isLoading}
                        />
                        {errors.otpCode && (
                            <span className="text-xs text-red-500 mt-1">
                                {errors.otpCode}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-center mt-2">
                        {remainingTime > 0 ? (
                            <p className="text-sm text-gray-500">
                                Gửi lại mã sau {Math.floor(remainingTime / 60)}:
                                {(remainingTime % 60)
                                    .toString()
                                    .padStart(2, "0")}
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
            )}

            {stage === "newPassword" && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-600">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                handleInputChange("newPassword", e.target.value)
                            }
                            className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                                errors.newPassword
                                    ? "border-red-500"
                                    : "border-[#E4E7E9]"
                            }`}
                            placeholder="Nhập mật khẩu mới"
                            disabled={isLoading}
                        />
                        {errors.newPassword && (
                            <span className="text-xs text-red-500 mt-1">
                                {errors.newPassword}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-600">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                handleInputChange(
                                    "confirmPassword",
                                    e.target.value,
                                )
                            }
                            className={`px-2.5 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary ${
                                errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-[#E4E7E9]"
                            }`}
                            placeholder="Nhập lại mật khẩu mới"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className="text-xs text-red-500 mt-1">
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>
                </>
            )}

            <div className="mt-4 flex flex-col gap-3">
                <LoginButton type="submit" disabled={isLoading}>
                    <span>
                        {isLoading
                            ? "ĐANG XỬ LÝ..."
                            : stage === "email"
                              ? "GỬI MÃ XÁC THỰC"
                              : stage === "otp"
                                ? "XÁC THỰC"
                                : "ĐẶT LẠI MẬT KHẨU"}
                    </span>
                </LoginButton>

                {stage !== "email" && (
                    <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-900 mt-2 text-center"
                        onClick={handleBack}
                        disabled={isLoading}
                    >
                        Quay lại
                    </button>
                )}

                <div className="flex justify-between w-full mt-4 text-sm">
                    <button
                        type="button"
                        className="text-primary hover:text-primary-dark"
                        onClick={onNavigateToLogin}
                        disabled={isLoading}
                    >
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        className="text-primary hover:text-primary-dark"
                        onClick={onNavigateToRegister}
                        disabled={isLoading}
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </form>
    );
};
