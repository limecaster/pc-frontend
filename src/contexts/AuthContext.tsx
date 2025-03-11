"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config/constants";
import { refreshTokenIfNeeded, validateTokenFormat } from "@/api/auth";

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
    logout: () => void;
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

    const login = (token: string, userData: any) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
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

    // Register a new user
    const register = async (
        email: string,
        password: string,
        username?: string,
        firstname?: string,
        lastname?: string,
    ): Promise<any> => {
        try {
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Registration failed: ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
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
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Email verification failed: ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Email verification error:", error);
            throw error;
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
