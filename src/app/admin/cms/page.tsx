"use client";

import React, { useEffect } from "react";
import CmsContentList from "@/components/admin/cms/CmsContentList";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";

const CmsManagementPage = () => {
    useEffect(() => {
        document.title = "Admin - CMS Management";
    }, []);

    return (
        <div className="p-6">
            <AdminBreadcrumb
                items={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "CMS Management", href: "/admin/cms" },
                ]}
            />

            <div className="mt-4">
                <CmsContentList />
            </div>
        </div>
    );
};

export default CmsManagementPage;
