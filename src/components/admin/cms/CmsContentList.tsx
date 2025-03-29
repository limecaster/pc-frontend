import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getCmsContent,
    deleteCmsContent,
    CmsContent,
    ContentType,
    ContentSection,
    ContentStatus,
} from "@/api/cms";

const CmsContentList: React.FC = () => {
    const [contents, setContents] = useState<CmsContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [filter, setFilter] = useState({
        contentType: "",
        section: "",
        status: ContentStatus.ACTIVE,
    });

    // Handle content type mapping for display purposes
    const getContentTypeName = (type: string): string => {
        const mapping: Record<string, string> = {
            hero_banner: "Hero Banner",
            team_member: "Team Member",
            logo: "Logo",
            promo_banner: "Promo Banner",
            about_image: "About Image",
        };
        return mapping[type] || type;
    };

    // Handle section mapping for display purposes
    const getSectionName = (section: string): string => {
        const mapping: Record<string, string> = {
            home: "Home",
            about: "About",
            support: "Support",
            footer: "Footer",
            header: "Header",
        };
        return mapping[section] || section;
    };

    useEffect(() => {
        fetchContents();
    }, [filter]);

    const fetchContents = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: any = {};
            if (filter.contentType) filters.contentType = filter.contentType;
            if (filter.section) filters.section = filter.section;
            if (filter.status) filters.status = filter.status;

            // Try to fetch data, but handle API not available scenario
            try {
                const data = await getCmsContent(filters);
                setContents(data);
            } catch (err) {
                console.error("Error fetching CMS content:", err);
                // Show more specific error message
                if (err instanceof Error && err.message.includes("404")) {
                    setError(
                        "CMS API endpoint not available. Please ensure the backend server is running and the CMS module is properly configured.",
                    );
                } else {
                    setError("Failed to load content. Please try again.");
                }
                // Set empty content array to avoid using stale data
                setContents([]);
                toast.error("Failed to load CMS content");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this content?")) {
            try {
                toast.loading("Deleting...", { id: "deleteContent" });
                await deleteCmsContent(id);
                toast.success("Content deleted successfully", {
                    id: "deleteContent",
                });
                fetchContents(); // Refresh the list
            } catch (error) {
                console.error("Error deleting content:", error);
                toast.error("Failed to delete content", {
                    id: "deleteContent",
                });
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditContent = (id: number) => {
        router.push(`/admin/cms/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
                <p>{error}</p>
                <button
                    onClick={fetchContents}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-2xl font-semibold mb-4 md:mb-0">
                    CMS Content Management
                </h1>
                <Link
                    href="/admin/cms/create"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 inline-block"
                >
                    Add New Content
                </Link>
            </div>

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label
                        htmlFor="contentType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Filter by Type
                    </label>
                    <select
                        id="contentType"
                        name="contentType"
                        onChange={handleFilterChange}
                        value={filter.contentType}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Types</option>
                        {Object.values(ContentType).map((type) => (
                            <option key={type} value={type}>
                                {getContentTypeName(type)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="section"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Filter by Section
                    </label>
                    <select
                        id="section"
                        name="section"
                        onChange={handleFilterChange}
                        value={filter.section}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Sections</option>
                        {Object.values(ContentSection).map((section) => (
                            <option key={section} value={section}>
                                {getSectionName(section)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Filter by Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        onChange={handleFilterChange}
                        value={filter.status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(ContentStatus).map((status) => (
                            <option key={status} value={status}>
                                {status === "active" ? "Active" : "Inactive"}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {contents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500 mb-4">
                        No content found with the current filters.
                    </p>
                    <button
                        onClick={() =>
                            setFilter({
                                contentType: "",
                                section: "",
                                status: ContentStatus.ACTIVE,
                            })
                        }
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Preview
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Content Key
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Type
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Section
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Title
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Status
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Order
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contents.map((content) => (
                                <tr
                                    key={content.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {content.imageUrl && (
                                            <div className="relative h-12 w-12 rounded overflow-hidden">
                                                <Image
                                                    src={content.imageUrl}
                                                    alt={
                                                        content.title ||
                                                        content.contentKey
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {content.contentKey}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {getContentTypeName(
                                            content.contentType,
                                        )}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {getSectionName(content.section)}
                                    </td>
                                    <td className="py-3 px-4">
                                        {content.title || "-"}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                content.status ===
                                                ContentStatus.ACTIVE
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {content.status ===
                                            ContentStatus.ACTIVE
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {content.displayOrder}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleEditContent(
                                                        content.id!,
                                                    )
                                                }
                                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(content.id!)
                                                }
                                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CmsContentList;
