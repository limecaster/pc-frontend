"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    firstname: string | null;
    lastname: string | null;
    username: string;
    avatar: string | null;
    phoneNumber: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (loginId: string, password: string) => Promise<void>;
    register: (
        email: string,
        password: string,
        username?: string,
        firstname?: string,
        lastname?: string,
    ) => Promise<{
        email: string;
        userId: number;
    }>;
    verifyEmail: (email: string, otpCode: string) => Promise<void>;
    resendOtp: (email: string, type: "verification" | "reset") => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    verifyResetOtp: (email: string, otpCode: string) => Promise<boolean>;
    resetPassword: (
        email: string,
        otpCode: string,
        newPassword: string,
    ) => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    changePassword: (
        currentPassword: string,
        newPassword: string,
    ) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const storedUser = localStorage.getItem("user");
            
            // Verify the token is still valid with the server
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            }).then(response => {
                if (!response.ok) {
                    // Token is invalid or user doesn't exist anymore
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return;
                }
                
                // Token is valid
                setToken(storedToken);
                setUser(storedUser ? JSON.parse(storedUser) : null);
            }).catch(err => {
                console.error("Failed to verify token:", err);
                // On error, we'll keep the user logged in but should add retry logic
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (loginId: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ loginId, password }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to login");
            }

            const data = await response.json();
            
            // Store token exactly as received from the server without any modification
            const receivedToken = data.access_token;
            
            // Debug token details
            console.log("Token received:", {
                length: receivedToken.length,
                firstPart: receivedToken.split('.')[0]?.substring(0, 10) + '...',
                parts: receivedToken.split('.').length
            });
            
            // Store token exactly as received
            localStorage.setItem("token", receivedToken);
            
            // Set user data
            setUser(data.user);
            setToken(receivedToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during login",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        email: string,
        password: string,
        username?: string,
        firstname?: string,
        lastname?: string,
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        username,
                        firstname,
                        lastname,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                // Handle conflict errors more specifically
                if (response.status === 409) {
                    // Check if the error message contains specific information
                    const errorMessage = errorData.message || '';
                    if (errorMessage.toLowerCase().includes('email')) {
                        throw new Error('Email này đã được sử dụng. Vui lòng chọn email khác.');
                    } else if (errorMessage.toLowerCase().includes('username')) {
                        throw new Error('Username này đã được sử dụng. Vui lòng chọn username khác.');
                    } else {
                        throw new Error('Tài khoản đã tồn tại trong hệ thống.');
                    }
                }
                
                throw new Error(errorData.message || "Đăng ký không thành công");
            }

            const data = await response.json();
            // Return user data to allow OTP verification
            return {
                email: email,
                userId: data.id,
            };
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Đã xảy ra lỗi trong quá trình đăng ký"
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (email: string, otpCode: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/verify-email`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otpCode }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to verify email");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during email verification",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const resendOtp = async (email: string, type: "verification" | "reset") => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/resend-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, type }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to resend OTP");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred when resending verification code",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to request password reset",
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during password reset request",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyResetOtp = async (email: string, otpCode: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/verify-reset-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otpCode }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Invalid verification code",
                );
            }

            const data = await response.json();
            return data.valid;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during OTP verification",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (
        email: string,
        otpCode: string,
        newPassword: string,
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otpCode,
                        password: newPassword,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to reset password",
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during password reset",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/authenticate");
    };

    const updateProfile = async (profileData: Partial<User>) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!token) {
                throw new Error("You must be logged in to update your profile");
            }

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(profileData),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update profile",
                );
            }

            const updatedUser = await response.json();
            setUser((prevUser) => ({ ...prevUser, ...updatedUser } as User));
            localStorage.setItem(
                "user",
                JSON.stringify({ ...user, ...updatedUser }),
            );

            return updatedUser;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while updating profile",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (
        currentPassword: string,
        newPassword: string,
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!token) {
                throw new Error(
                    "You must be logged in to change your password",
                );
            }

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/auth/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ currentPassword, newPassword }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to change password",
                );
            }

            return;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while changing password",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                verifyEmail,
                resendOtp,
                forgotPassword,
                verifyResetOtp,
                resetPassword,
                updateProfile,
                changePassword,
                logout,
                error,
                clearError,
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
