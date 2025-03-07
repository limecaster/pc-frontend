"use client";
import React, { useEffect, useState } from "react";
import { LoginTabs } from "@/components/authenticate/LoginTabs";
import { LoginForm } from "@/components/authenticate/LoginForm";
import { RegisterForm } from "@/components/authenticate/RegisterForm";
import { ForgotPasswordForm } from "@/components/authenticate/ForgotPasswordForm";
import { SocialLogin } from "@/components/authenticate/LoginSocial";
import { LoginButton } from "@/components/authenticate/LoginButton";

type AuthMode = "login" | "register" | "forgot-password";

const Authenticate: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Xác thực tài khoản";
    }, []);
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [authMode, setAuthMode] = useState<AuthMode>("login");

    const handleLogin = (email: string, password: string) => {
        // Handle login logic here
        console.log("Authenticate attempt:", { email, password });
    };

    const handleRegister = (fullName: string, email: string, password: string, verificationCode?: string) => {
        if (verificationCode) {
            // Handle email verification
            console.log("Verifying email:", { fullName, email, verificationCode });
            // If verification is successful, navigate to login
            navigateToLogin();
        } else {
            // Handle initial registration and send verification email
            console.log("Registration attempt:", { fullName, email, password });
            // In a real application, this would send a verification code to the email
        }
    };

    const handleForgotPassword = (email: string, otp?: string, newPassword?: string) => {
        if (newPassword) {
            // Handle password reset submission
            console.log("Resetting password:", { email, otp, newPassword });
            // On successful password reset, navigate back to login
            navigateToLogin();
        } else if (otp) {
            // Handle OTP verification
            console.log("Verifying OTP:", { email, otp });
            // OTP verification is handled in the component itself for this demo
        } else {
            // Handle sending OTP
            console.log("Sending OTP to:", email);
        }
    };

    const navigateToForgotPassword = () => {
        setAuthMode("forgot-password");
    };

    const navigateToLogin = () => {
        setAuthMode("login");
        setActiveTab("login");
    };

    const navigateToRegister = () => {
        setAuthMode("register");
        setActiveTab("register");
    };

    // Handle tab changes only when not in forgot-password mode
    const handleTabChange = (tab: "login" | "register") => {
        setActiveTab(tab);
        setAuthMode(tab);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <main className="overflow-hidden bg-white rounded border border-solid shadow-2xl border-[#E4E7E9] max-w-[424px]">
                <div className="flex flex-col items-center pb-4 w-full bg-white border border-solid shadow-2xl border-[#E4E7E9]">
                    {authMode !== "forgot-password" && (
                        <>
                            <LoginTabs activeTab={activeTab} onTabChange={handleTabChange} />
                            <div className="self-stretch w-full bg-gray-200 border border-gray-200 border-solid min-h-px" />
                        </>
                    )}

                    {authMode === "login" && (
                        <>
                            <LoginForm 
                                onSubmit={handleLogin} 
                                onForgotPassword={navigateToForgotPassword} 
                            />
                            <LoginButton className="mt-5 max-w-[360px]">
                                <span>ĐĂNG NHẬP</span>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/2c2149ae3c405dce61079c18695dad90fa1ed8e56693380a2c000152af016002?placeholderIfAbsent=true"
                                    alt="Authenticate icon"
                                    className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                                />
                            </LoginButton>
                            <SocialLogin />
                        </>
                    )}

                    {authMode === "register" && (
                        <>
                            <RegisterForm onSubmit={handleRegister} />
                            <SocialLogin />
                        </>
                    )}

                    {authMode === "forgot-password" && (
                        <ForgotPasswordForm 
                            onSubmit={handleForgotPassword}
                            onNavigateToLogin={navigateToLogin}
                            onNavigateToRegister={navigateToRegister}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Authenticate;
