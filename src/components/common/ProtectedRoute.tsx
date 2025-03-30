"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Redirect to login page with returnUrl
            const returnUrl = window.location.pathname;
            router.push(
                `/authenticate?returnUrl=${encodeURIComponent(returnUrl)}`,
            );
            return;
        }

        // Check role restrictions if specified
        if (allowedRoles && allowedRoles.length > 0 && user) {
            const userRole = user.role.toLowerCase();
            const hasPermission = allowedRoles.some(
                (role) => role.toLowerCase() === userRole,
            );

            if (!hasPermission) {
                toast.error("Bạn không có quyền truy cập vào trang này");

                // Redirect based on user role
                if (userRole === "admin") {
                    router.push("/admin/dashboard");
                } else if (userRole === "staff") {
                    router.push("/staff");
                } else {
                    router.push("/");
                }
            }
        }
    }, [isAuthenticated, isLoading, router, allowedRoles, user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will be redirected by the useEffect
    }

    return <>{children}</>;
};

export default ProtectedRoute;
