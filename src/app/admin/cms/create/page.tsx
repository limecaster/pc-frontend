"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";
import CmsContentForm from "@/components/admin/cms/CmsContentForm";
import { createCmsContent, CmsContent, ContentType } from "@/api/cms";
import toast from "react-hot-toast";

const CreateCmsContentPage = () => {
    const router = useRouter();

    useEffect(() => {
        document.title = "Admin - Create CMS Content";
    }, []);

    const handleSubmit = async (values: Partial<CmsContent>) => {
        try {
            // Special handling for favicon
            if (
                values.contentKey === "favicon" &&
                values.contentType === ContentType.LOGO
            ) {
                // Add validation for favicon dimensions if needed
                if (!values.imageUrl) {
                    toast.error("Please upload an image for the favicon");
                    return;
                }
            }

            await createCmsContent(values);
            toast.success("CMS content created successfully!");
            router.push("/admin/cms");
        } catch (error) {
            console.error("Error creating CMS content:", error);
            toast.error("Failed to create CMS content");
            throw error; // Re-throw to let the form component handle it
        }
    };

    return (
        <div className="p-6">
            <AdminBreadcrumb
                items={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "CMS Management", href: "/admin/cms" },
                    { label: "Create Content", href: "/admin/cms/create" },
                ]}
            />

            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-semibold mb-6">
                    Create CMS Content
                </h1>
                <CmsContentForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default CreateCmsContentPage;
