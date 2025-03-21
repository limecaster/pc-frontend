"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            // User is not logged in, redirect to login
            toast.error("Vui lòng đăng nhập để tiếp tục");
            router.push("/authenticate");
            return;
        }

        // Check if user role is in allowed roles
        const userRole = user.role.toLowerCase();
        const hasPermission = allowedRoles.some(
            (role) => role.toLowerCase() === userRole,
        );

        if (!hasPermission) {
            // User doesn't have the required role
            toast.error("Bạn không có quyền truy cập vào trang này");

            // Redirect to appropriate page based on user's role
            if (userRole === "admin") {
                router.push("/admin");
            } else if (userRole === "staff") {
                router.push("/staff");
            } else {
                router.push("/");
            }
            return;
        }

        setAuthorized(true);
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading) {
        // Show loading state while checking authorization
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-3">Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    return authorized ? <>{children}</> : null;
};

export default RouteGuard;
