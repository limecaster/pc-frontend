import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Image from "next/image";
import {
    ContentType,
    ContentSection,
    ContentStatus,
    CmsContent,
    uploadCmsImage,
} from "@/api/cms";

interface CmsContentFormProps {
    initialValues?: Partial<CmsContent>;
    onSubmit: (values: Partial<CmsContent>) => Promise<void>;
    isEditing?: boolean;
}

const CmsContentForm: React.FC<CmsContentFormProps> = ({
    initialValues = {
        contentKey: "",
        contentType: ContentType.HERO_BANNER,
        title: "",
        description: "",
        imageUrl: "",
        cloudinaryPublicId: "",
        link: "",
        section: ContentSection.HOME,
        status: ContentStatus.ACTIVE,
        displayOrder: 0,
    },
    onSubmit,
    isEditing = false,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialValues.imageUrl || null,
    );

    const contentTypes = Object.values(ContentType);
    const contentSections = Object.values(ContentSection);
    const contentStatuses = Object.values(ContentStatus);

    const validationSchema = Yup.object({
        contentKey: Yup.string().required("Content key is required"),
        contentType: Yup.string().required("Content type is required"),
        section: Yup.string().required("Section is required"),
        status: Yup.string().required("Status is required"),
        displayOrder: Yup.number()
            .required("Display order is required")
            .typeError("Display order must be a number")
            .test(
                "is-valid-number",
                "Must be a valid number",
                (value) => !isNaN(Number(value)),
            ),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
                toast.success(
                    `Content ${isEditing ? "updated" : "created"} successfully!`,
                );
            } catch (error) {
                console.error("Form submission error:", error);
                toast.error(
                    `Failed to ${isEditing ? "update" : "create"} content`,
                );
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            toast.loading("Đang tải lên hình ảnh...", { id: "imageUpload" });
            const result = await uploadCmsImage(
                file,
                formik.values.contentType?.toLowerCase() || "cms",
            );

            if (result.success) {
                formik.setFieldValue("imageUrl", result.imageUrl);
                formik.setFieldValue("cloudinaryPublicId", result.publicId);
                toast.success("Hình ảnh đã được tải lên thành công!", {
                    id: "imageUpload",
                });
            } else {
                toast.error("Không thể tải lên hình ảnh", {
                    id: "imageUpload",
                });
            }
        } catch (error) {
            console.error("Lỗi tải lên hình ảnh:", error);
            toast.error("Không thể tải lên hình ảnh", { id: "imageUpload" });
        }
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <label
                            htmlFor="contentKey"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Content Key*
                        </label>
                        <input
                            id="contentKey"
                            name="contentKey"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.contentKey}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isEditing} // Can't change key when editing
                        />
                        {formik.touched.contentKey &&
                            formik.errors.contentKey && (
                                <div className="text-red-500 text-sm mt-1">
                                    {formik.errors.contentKey}
                                </div>
                            )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="contentType"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Content Type*
                        </label>
                        <select
                            id="contentType"
                            name="contentType"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.contentType}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {contentTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        {formik.touched.contentType &&
                            formik.errors.contentType && (
                                <div className="text-red-500 text-sm mt-1">
                                    {formik.errors.contentType}
                                </div>
                            )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Tiêu đề
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.title || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="link"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Link URL
                        </label>
                        <input
                            id="link"
                            name="link"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.link || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <label
                            htmlFor="section"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Section*
                        </label>
                        <select
                            id="section"
                            name="section"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.section}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {contentSections.map((section) => (
                                <option key={section} value={section}>
                                    {section}
                                </option>
                            ))}
                        </select>
                        {formik.touched.section && formik.errors.section && (
                            <div className="text-red-500 text-sm mt-1">
                                {formik.errors.section}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Trạng thái*
                        </label>
                        <select
                            id="status"
                            name="status"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.status}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {contentStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        {formik.touched.status && formik.errors.status && (
                            <div className="text-red-500 text-sm mt-1">
                                {formik.errors.status}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="displayOrder"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Thứ tự hiển thị*
                        </label>
                        <input
                            id="displayOrder"
                            name="displayOrder"
                            type="number"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.displayOrder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.displayOrder &&
                            formik.errors.displayOrder && (
                                <div className="text-red-500 text-sm mt-1">
                                    {formik.errors.displayOrder}
                                </div>
                            )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hình ảnh
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative w-full h-48 border border-gray-300 rounded-md overflow-hidden">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Đang gửi..."
                        : isEditing
                          ? "Cập nhật nội dung"
                          : "Tạo nội dung"}
                </button>
            </div>
        </form>
    );
};

export default CmsContentForm;
