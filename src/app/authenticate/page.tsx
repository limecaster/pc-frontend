"use client";
import React, { useEffect, useState } from "react";
import { LoginTabs } from "@/components/authenticate/LoginTabs";
import { LoginForm } from "@/components/authenticate/LoginForm";
import { RegisterForm } from "@/components/authenticate/RegisterForm";
import { ForgotPasswordForm } from "@/components/authenticate/ForgotPasswordForm";
import { SocialLogin } from "@/components/authenticate/LoginSocial";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "login" | "register" | "forgot-password";

const Authenticate: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [authMode, setAuthMode] = useState<AuthMode>("login");
    const { login, register: registerUser, forgotPassword, resetPassword, error, isAuthenticated, isLoading, clearError } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams?.get('returnUrl') || '/';
    const message = searchParams?.get('message');

    useEffect(() => {
        document.title = "B Store - Xác thực tài khoản";
        if (isAuthenticated) {
            router.push(returnUrl);
        }
    }, [isAuthenticated, router, returnUrl]);

    const handleLogin = async (loginId: string, password: string) => {
        await login(loginId, password);
    };

    const handleRegister = async (fullName: string, email: string, password: string, username?: string) => {
        // Split fullName into firstname and lastname
        const nameParts = fullName.trim().split(' ');
        const lastname = nameParts.pop() || '';
        const firstname = nameParts.join(' ');
        
        // Pass the username to the registration function
        await registerUser(email, password, username, firstname, lastname);
    };

    const handleForgotPassword = async (email: string, otp?: string, newPassword?: string) => {
        if (newPassword && otp) {
            // Handle password reset submission
            await resetPassword(email, otp, newPassword);
            navigateToLogin();
        } else {
            // Handle sending OTP
            await forgotPassword(email);
        }
    };

    const navigateToForgotPassword = () => {
        clearError();
        setAuthMode("forgot-password");
    };

    const navigateToLogin = () => {
        clearError();
        setAuthMode("login");
        setActiveTab("login");
    };

    const navigateToRegister = () => {
        clearError();
        setAuthMode("register");
        setActiveTab("register");
    };

    // Handle tab changes only when not in forgot-password mode
    const handleTabChange = (tab: "login" | "register") => {
        clearError();
        setActiveTab(tab);
        setAuthMode(tab);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <main className="overflow-hidden bg-white rounded border border-solid shadow-2xl border-[#E4E7E9] max-w-[424px] w-full">
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={clearError}>
                            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <title>Close</title>
                                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697L11.819 10l2.53 2.651a1.2 1.2 0 0 1 0 1.697z"/>
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-col items-center pb-4 w-full bg-white">
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
