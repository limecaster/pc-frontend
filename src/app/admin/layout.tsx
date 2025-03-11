"use client";

import React from "react";
import RouteGuard from "@/components/auth/RouteGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["admin"]}>
            <div className="admin-layout">
                {/* Admin sidebar navigation could go here */}
                <main>{children}</main>
            </div>
        </RouteGuard>
    );
}
