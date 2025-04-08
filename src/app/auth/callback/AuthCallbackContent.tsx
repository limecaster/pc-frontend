"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const userData = searchParams.get("user");

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                login(token, user);
                router.push("/"); // Redirect to home page after successful login
            } catch (error) {
                console.error("Error processing login:", error);
                router.push("/authenticate?error=Failed to process login");
            }
        } else {
            router.push("/authenticate?error=Missing token or user data");
        }
    }, [searchParams, login, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    Đang đăng nhập...
                </h1>
                <p className="text-gray-600">
                    Vui lòng đợi trong giây lát. Bạn sẽ được chuyển hướng đến
                    trang chính ngay lập tức.
                </p>
            </div>
        </div>
    );
}
