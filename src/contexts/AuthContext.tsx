"use client";

// Handle errors by logging and showing a toast notification
const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast.error(message);
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config/constants";
import {
    refreshTokenIfNeeded,
    validateTokenFormat,
    handleAuthError,
} from "@/api/auth";
import { toast } from "react-hot-toast";

interface User {
    id: string;
    username: string;
    email: string;
    role: "admin" | "staff" | "customer";
    firstName?: string;
    lastName?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: any) => void;
    logout: (reason?: string) => void;
    checkUserRole: () => string | null;
    // Add missing methods for registration and password reset
    register: (
        email: string,
        password: string,
        username?: string,
        firstname?: string,
        lastname?: string,
    ) => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    verifyEmail: (email: string, otpCode: string) => Promise<any>;
    verifyResetOtp: (email: string, otpCode: string) => Promise<boolean>;
    resetPassword: (
        email: string,
        otpCode: string,
        newPassword: string,
    ) => Promise<any>;
    resendOtp: (email: string, type: "verification" | "reset") => Promise<any>;
    resendVerificationOtp: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                // Check if token exists and is valid
                if (validateTokenFormat()) {
                    await refreshTokenIfNeeded();

                    // Load user data from localStorage
                    const storedUser = localStorage.getItem("user");
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error("Authentication initialization error:", error);
                // Clear any invalid auth data
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Check for auth error messages on the auth page
    useEffect(() => {
        // Only run this effect when on the authentication page
        if (window.location.pathname.includes("/authenticate")) {
            const errorMsg = sessionStorage.getItem("auth_error");
            if (errorMsg) {
                toast.error(errorMsg);
                sessionStorage.removeItem("auth_error");
            }
        }
    }, []);

    const login = (token: string, userData: any) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = (reason?: string) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);

        // Show a toast message if a reason is provided
        if (reason) {
            toast.error(reason);
        }

        // Redirect to login page
        router.push("/authenticate");
    };

    const checkUserRole = (): string | null => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return null;

        try {
            const userData = JSON.parse(storedUser);
            return userData.role || null;
        } catch (e) {
            console.error("Error parsing user data:", e);
            return null;
        }
    };

    // // Expose handleAuthError function to components that need it
    // // This will make it available through the useAuth hook
    // const handleAuthenticationError = (message: string) => {
    //     logout(message);
    // };

    // Make handleAuthError available globally
    useEffect(() => {
        // @ts-ignore - Adding a global function for handling auth errors
        window.__handleAuthError = (message: string) => {
            logout(message);
        };
    }, []);

    // Register a new user
    const register = async (
        email: string,
        password: string,
        username?: string,
        firstname?: string,
        lastname?: string,
    ): Promise<any> => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    firstname,
                    lastname,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the user exists but is unverified, this should still be considered a success case
                // since we're going to send them to verification
                if (
                    response.status === 409 &&
                    data.message
                        ?.toLowerCase()
                        .includes("email đã được sử dụng")
                ) {
                    // Check if the user is unverified
                    const unverifiedCheck = await fetch(
                        `${API_URL}/auth/check-verification-status`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                        },
                    );

                    // If we can't check or the user is verified, treat as an error
                    if (!unverifiedCheck.ok) {
                        throw new Error(
                            data.message || "Email đã được sử dụng",
                        );
                    }

                    const statusData = await unverifiedCheck.json();
                    if (statusData.isVerified) {
                        throw new Error("Email đã được sử dụng");
                    }

                    // Email exists but unverified - send them to verification screen
                    toast.success(
                        "Bạn cần xác thực email của mình. Mã xác thực đã được gửi lại.",
                    );
                    return {
                        success: true,
                        needsVerification: true,
                        email,
                    };
                }
                throw new Error(data.message || "Registration failed");
            }

            toast.success(
                "Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.",
            );
            return data;
        } catch (error) {
            handleError(error, "Registration error:");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Initiate forgot password process
    const forgotPassword = async (email: string): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Forgot password request failed: ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Forgot password error:", error);
            throw error;
        }
    };

    // Verify email with OTP code
    const verifyEmail = async (
        email: string,
        otpCode: string,
    ): Promise<any> => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otpCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Mã xác thực không hợp lệ");
            }

            const data = await response.json();
            toast.success("Email đã được xác thực thành công!");
            return data;
        } catch (error) {
            // Don't use handleError here as we're already showing the error in the UI
            console.error("Verification error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Verify reset password OTP code
    const verifyResetOtp = async (
        email: string,
        otpCode: string,
    ): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `OTP verification failed: ${response.status}`,
                );
            }

            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error("Reset OTP verification error:", error);
            throw error;
        }
    };

    // Reset password with OTP code
    const resetPassword = async (
        email: string,
        otpCode: string,
        newPassword: string,
    ): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode, password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Password reset failed: ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Password reset error:", error);
            throw error;
        }
    };

    // Resend OTP code
    const resendOtp = async (
        email: string,
        type: "verification" | "reset",
    ): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `OTP resend failed: ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Resend OTP error:", error);
            throw error;
        }
    };

    // Add a new method to handle the resend OTP operation specifically for registration
    const resendVerificationOtp = async (email: string): Promise<any> => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "verification" }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể gửi lại mã OTP",
                );
            }

            toast.success("Mã xác thực mới đã được gửi đến email của bạn");
            return await response.json();
        } catch (error) {
            handleError(error, "Không thể gửi lại mã xác thực:");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                checkUserRole,
                register,
                forgotPassword,
                verifyEmail,
                verifyResetOtp,
                resetPassword,
                resendOtp,
                resendVerificationOtp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Export a global handler that doesn't require React context
export const handleGlobalAuthError = (message: string) => {
    handleAuthError(message);
};
