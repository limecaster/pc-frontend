"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/authenticate/LoginForm";
import { RegisterForm } from "@/components/authenticate/RegisterForm";
import { ForgotPasswordForm } from "@/components/authenticate/ForgotPasswordForm";
import { LoginTabs } from "@/components/authenticate/LoginTabs";
import { SocialLogin } from "@/components/authenticate/LoginSocial";
import { unifiedLogin } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { VerificationForm } from "@/components/authenticate/VerificationForm";
import { toast } from "react-hot-toast";

type AuthScreen = "login" | "register" | "forgotPassword" | "verification";

const AuthenticateContent: React.FC = () => {
    useEffect(() => {
        document.title = "Đăng nhập hoặc Đăng ký";
    }, []);
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [currentScreen, setCurrentScreen] = useState<AuthScreen>("login");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationEmail, setRegistrationEmail] = useState<string>("");
    const {
        login,
        register,
        verifyEmail,
        isAuthenticated,
        checkUserRole,
        resendVerificationOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
    } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If already authenticated, redirect based on role
        if (isAuthenticated) {
            const role = checkUserRole();
            if (role === "admin") {
                router.push("/admin/dashboard");
            } else if (role === "staff") {
                router.push("/staff");
            } else {
                router.push("/");
            }
        }
    }, [isAuthenticated, router, checkUserRole]);

    const handleTabChange = (tab: "login" | "register") => {
        setActiveTab(tab);
        setCurrentScreen(tab);
        setError(null);
    };

    const handleLogin = async (loginId: string, password: string) => {
        try {
            setError(null);
            setIsSubmitting(true);

            const response = await unifiedLogin({
                username: loginId,
                password,
            });

            if (response.access_token && response.user) {
                login(response.access_token, response.user);

                // Redirect based on role
                if (response.user.role === "admin") {
                    router.push("/admin/dashboard");
                } else if (response.user.role === "staff") {
                    router.push("/staff");
                } else {
                    router.push("/");
                }
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err.message || "Login failed. Please check your credentials.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (
        fullName: string,
        email: string,
        password: string,
        username?: string,
    ) => {
        try {
            setError(null);
            setIsSubmitting(true);

            await register(
                email,
                password,
                username,
                fullName.split(" ")[0] || "", // firstname (first word of fullName)
                fullName.split(" ").slice(1).join(" ") || "", // lastname (rest of fullName)
            );

            setRegistrationEmail(email);

            setCurrentScreen("verification");
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerification = async (otpCode: string) => {
        try {
            setError(null);
            setIsSubmitting(true);

            await verifyEmail(registrationEmail, otpCode);

            // Verification successful - redirect to login
            toast.success("Xác thực email thành công! Bạn có thể đăng nhập.");
            setActiveTab("login");
            setCurrentScreen("login");
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(
                err.message ||
                    "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        if (!registrationEmail) {
            setError("Không thể gửi lại mã xác thực. Email không hợp lệ.");
            return;
        }

        try {
            setIsSubmitting(true);
            await resendVerificationOtp(registrationEmail);
            toast.success("Mã xác thực mới đã được gửi đến email của bạn.");
        } catch (err: any) {
            setError("Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPasswordSubmit = async (
        email: string,
        otpCode?: string,
        newPassword?: string,
    ) => {
        try {
            setError(null);
            setIsSubmitting(true);

            if (!otpCode && !newPassword) {
                // First step: Request password reset
                await forgotPassword(email);
                toast.success("Mã xác thực đã được gửi đến email của bạn");
            } else if (otpCode && !newPassword) {
                // Second step: Verify OTP
                const isValid = await verifyResetOtp(email, otpCode);
                if (isValid) {
                    toast.success("Mã xác thực hợp lệ");
                }
            } else if (otpCode && newPassword) {
                // Final step: Reset password
                // Only call resetPassword once with both OTP and new password
                await resetPassword(email, otpCode, newPassword);
                toast.success("Đặt lại mật khẩu thành công");
                // Redirect to login page immediately after successful password reset
                router.push("/");
                return;
            }
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigateToForgotPassword = () => {
        setCurrentScreen("forgotPassword");
        setError(null);
    };

    const handleNavigateToLogin = () => {
        setCurrentScreen("login");
        setActiveTab("login");
        setError(null);
    };

    const handleNavigateToRegister = () => {
        setCurrentScreen("register");
        setActiveTab("register");
        setError(null);
    };

    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case "login":
                return (
                    <>
                        <LoginForm
                            onSubmit={handleLogin}
                            onForgotPassword={handleNavigateToForgotPassword}
                            isSubmitting={isSubmitting}
                        />
                        <SocialLogin />
                    </>
                );
            case "register":
                return (
                    <>
                        <RegisterForm
                            onSubmit={handleRegister}
                            isSubmitting={isSubmitting}
                        />
                        <SocialLogin />
                    </>
                );
            case "verification":
                return (
                    <VerificationForm
                        email={registrationEmail}
                        onSubmit={handleVerification}
                        onResend={handleResendVerification}
                        isSubmitting={isSubmitting}
                    />
                );
            case "forgotPassword":
                return (
                    <ForgotPasswordForm
                        onSubmit={handleForgotPasswordSubmit}
                        onNavigateToLogin={handleNavigateToLogin}
                        onNavigateToRegister={handleNavigateToRegister}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white py-8 b">
            <div className="w-full max-w-md shadow-lg rounded-lg overflow-hidden border border-gray-200">
                {currentScreen !== "forgotPassword" &&
                    currentScreen !== "verification" && (
                        <LoginTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />
                    )}

                {error && (
                    <div className="px-8 py-2 mt-4 bg-red-100 text-red-700 text-sm">
                        {error === "Invalid credentials"
                            ? "Tên đăng nhập hoặc mật khẩu không chính xác"
                            : error}
                    </div>
                )}

                {renderCurrentScreen()}
            </div>
        </div>
    );
};

export default AuthenticateContent;
