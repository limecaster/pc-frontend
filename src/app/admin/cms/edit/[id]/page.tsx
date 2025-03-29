"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";
import CmsContentForm from "@/components/admin/cms/CmsContentForm";
import { getCmsContentById, updateCmsContent, CmsContent } from "@/api/cms";
import toast from "react-hot-toast";

interface PageProps {
    params: Promise<{ id: string }>;
}

const EditCmsContentPage = ({ params }: PageProps) => {
    const [content, setContent] = useState<CmsContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { id } = use(params);
    const contentId = parseInt(id);

    useEffect(() => {
        document.title = "Admin - Edit CMS Content";
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const data = await getCmsContentById(contentId);
            setContent(data);
        } catch (error) {
            console.error(`Error fetching content ${contentId}:`, error);
            setError("Failed to load content. Please try again.");
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: Partial<CmsContent>) => {
        try {
            await updateCmsContent(contentId, values);
            toast.success("CMS content updated successfully!");
            router.push("/admin/cms");
        } catch (error) {
            console.error("Error updating CMS content:", error);
            toast.error("Failed to update CMS content");
            throw error; // Re-throw to let the form component handle it
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <AdminBreadcrumb
                    items={[
                        { label: "Dashboard", href: "/admin" },
                        { label: "CMS Management", href: "/admin/cms" },
                        {
                            label: "Edit Content",
                            href: `/admin/cms/edit/${contentId}`,
                        },
                    ]}
                />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="p-6">
                <AdminBreadcrumb
                    items={[
                        { label: "Dashboard", href: "/admin" },
                        { label: "CMS Management", href: "/admin/cms" },
                        {
                            label: "Edit Content",
                            href: `/admin/cms/edit/${contentId}`,
                        },
                    ]}
                />
                <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mt-6">
                    <p>{error || "Content not found"}</p>
                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            onClick={fetchContent}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push("/admin/cms")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Back to CMS List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <AdminBreadcrumb
                items={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "CMS Management", href: "/admin/cms" },
                    {
                        label: "Edit Content",
                        href: `/admin/cms/edit/${contentId}`,
                    },
                ]}
            />

            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-semibold mb-6">
                    Edit CMS Content
                </h1>
                <CmsContentForm
                    initialValues={content}
                    onSubmit={handleSubmit}
                    isEditing={true}
                />
            </div>
        </div>
    );
};

export default EditCmsContentPage;
