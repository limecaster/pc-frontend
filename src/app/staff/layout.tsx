"use client";

import React from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import StaffSidebar from "@/components/staff/layout/StaffSidebar";
import { Toaster } from "react-hot-toast";
import {
    StaffSidebarProvider,
    useStaffSidebar,
} from "@/contexts/StaffSidebarContext";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    subsets: ["vietnamese"],
    weight: ["100", "300", "400", "500", "700", "900"],
});

function StaffContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useStaffSidebar();

    return (
        <div
            className={`${roboto.className} antialiased flex h-screen bg-gray-100`}
        >
            <StaffSidebar />
            <div
                className={`flex-1 transition-all duration-300 ${
                    isCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
                }`}
            >
                <main className="h-full overflow-y-auto p-6">{children}</main>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <StaffSidebarProvider>
                <StaffContent>{children}</StaffContent>
            </StaffSidebarProvider>
        </ProtectedRoute>
    );
}
