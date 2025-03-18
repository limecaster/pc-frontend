"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminSidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(
    undefined,
);

export function AdminSidebarProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <AdminSidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
            {children}
        </AdminSidebarContext.Provider>
    );
}

export function useAdminSidebar() {
    const context = useContext(AdminSidebarContext);
    if (context === undefined) {
        throw new Error(
            "useAdminSidebar must be used within an AdminSidebarProvider",
        );
    }
    return context;
}
