"use client";

import React from "react";
import RouteGuard from "@/components/auth/RouteGuard";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["staff"]}>
            <div className="staff-layout">
                {/* Staff sidebar navigation could go here */}
                <main>{children}</main>
            </div>
        </RouteGuard>
    );
}
