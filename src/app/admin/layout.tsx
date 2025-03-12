"use client";

import React from "react";
import RouteGuard from "@/components/auth/RouteGuard";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { Toaster } from "react-hot-toast";
import {
    AdminSidebarProvider,
    useAdminSidebar,
} from "@/contexts/AdminSidebarContext";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    subsets: ["vietnamese"],
    weight: ["100", "300", "400", "500", "700", "900"],
});

function AdminContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useAdminSidebar();

    return (
        <div className={`${roboto.className} antialiased flex h-screen bg-gray-100`}>
            <AdminSidebar />
            <div
                className={`flex-1 transition-all duration-300 ${
                    isCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
                }`}
            >
                <main className="h-full overflow-y-auto">{children}</main>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["admin"]}>
            <AdminSidebarProvider>
                <AdminContent>{children}</AdminContent>
            </AdminSidebarProvider>
        </RouteGuard>
    );
}
