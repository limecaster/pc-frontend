"use client";

import React from "react";
import RouteGuard from "@/components/auth/RouteGuard";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["customer", "admin", "staff"]}>
            <div className="profile-layout">
                {/* Profile navigation could go here */}
                <main>{children}</main>
            </div>
        </RouteGuard>
    );
}
