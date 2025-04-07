"use client";

import React, { use, useEffect } from "react";
import PCConfigurationsPage from "@/components/dashboard/pc-configurations/PCConfigurationsPage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function PCConfigurations() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Protect this page - only logged in users can see it
    useEffect(() => {
        document.title = "Cấu hình PC của tôi | B Store";

        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/dashboard/pc-configurations");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2">Đang tải...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Cấu hình PC của tôi</h1>
            <PCConfigurationsPage />
        </div>
    );
}
