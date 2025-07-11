"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUpload,
    faTimes,
    faSave,
    faArrowLeft,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
    createProduct,
    updateProduct,
    uploadProductImage,
    fetchProductCategories,
    fetchSpecificationKeys,
} from "@/api/admin-products";
import { Product } from "@/api/admin-products";
import toast from "react-hot-toast";
import Image from "next/image";

type CategoryOption = { id: number | string; name: string };

interface ProductFormProps {
    product?: any;
    mode: "add" | "edit";
}

interface FormData {
    name: string;
    description: string;
    price: string;
    stock_quantity?: number;
    status: string;
    category: string;
    images: string[];
    specifications: Record<string, string>;
    thumbnail: string;
    [key: string]: string | string[] | Record<string, string> | number | undefined;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, mode }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [specificationTemplate, setSpecificationTemplate] = useState<
        string[]
    >([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        price: "",
        stock_quantity: 0,
        status: "active",
        category: "",
        images: [] as string[],
        specifications: {} as Record<string, string>,
        thumbnail: "",
    });

    const [newSpec, setNewSpec] = useState({ key: "", value: "" });

    useEffect(() => {
        if (mode === "edit" && product) {
            const {
                id,
                name,
                description,
                price,
                stockQuantity,
                status,
                category,
                images = [],
                additionalImages = [],
                additional_images: additionalImagesString,
                specifications = {},
                thumbnail,
                imageUrl,
            } = product;

            let productImages = additionalImages;

            if (additionalImagesString) {
                try {
                    const parsedImages = JSON.parse(additionalImagesString);
                    if (Array.isArray(parsedImages)) {
                        productImages = parsedImages;
                    }
                } catch (e) {
                    console.error("Error parsing additional_images:", e);
                }
            }

            if (Array.isArray(images) && images.length > 0) {
                productImages = images;
            } else if (additionalImagesString) {
                try {
                    if (typeof additionalImagesString === "string") {
                        const parsedImages = JSON.parse(additionalImagesString);
                        if (Array.isArray(parsedImages)) {
                            productImages = parsedImages;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing additional_images:", e);
                }
            } else if (additionalImages) {
                if (Array.isArray(additionalImages)) {
                    productImages = additionalImages;
                }
            }

            if (productImages.length === 0 && imageUrl) {
                productImages = [imageUrl];
            }

            let finalStockQuantity = 0;
            if (stockQuantity !== undefined && stockQuantity !== null) {
                finalStockQuantity = stockQuantity;
            } else if (typeof stockQuantity === "number") {
                finalStockQuantity = stockQuantity;
            } else if (typeof stockQuantity === "string") {
                // Try to parse if stock is a string number, else fallback to 0
                const parsed = parseInt(stockQuantity, 10);
                finalStockQuantity = isNaN(parsed) ? 0 : parsed;
            }

            setFormData({
                name: name || "",
                description: description || "",
                price: price ? price.toString() : "",
                stock_quantity: finalStockQuantity,
                status: status || "active",
                category: category || "",
                images: productImages,
                specifications: specifications || {},
                thumbnail:
                    thumbnail ||
                    imageUrl ||
                    (productImages.length > 0 ? productImages[0] : ""),
            });

            if (productImages.length > 0) {
                setImagePreview(productImages[0]);
            }
        }
    }, [product, mode]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { categories } = await fetchProductCategories();
                const formattedCategories = categories.map((cat: string) => ({ id: cat, name: cat }));
                setCategories(formattedCategories);
            } catch (error) {
                console.error("Error loading categories:", error);
                toast.error("Không thể tải danh mục sản phẩm");
            }
        };

        loadCategories();
    }, []);

    // Load specification template when category changes
    useEffect(() => {
        const loadSpecTemplate = async () => {
            if (!formData.category) {
                setSpecificationTemplate([]);
                return;
            }

            try {
                const keys = await fetchSpecificationKeys(formData.category);
                setSpecificationTemplate(keys);
            } catch (error) {
                console.error("Error loading specification template:", error);
                toast.error("Không thể tải mẫu thông số kỹ thuật");
            }
        };

        loadSpecTemplate();
    }, [formData.category]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        setNewSpec((prev) => ({ ...prev, [name]: value }));
    };

    const addSpecification = () => {
        if (!newSpec.key.trim() || !newSpec.value.trim()) return;

        setFormData((prev) => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [newSpec.key.trim()]: newSpec.value.trim(),
            },
        }));

        setNewSpec({ key: "", value: "" });
    };

    const removeSpecification = (key: string) => {
        const updatedSpecs = { ...formData.specifications };
        delete updatedSpecs[key];

        setFormData((prev) => ({
            ...prev,
            specifications: updatedSpecs,
        }));
    };

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
            setImageLoading(true);
            toast.loading("Đang tải lên hình ảnh...", { id: "imageUpload" });

            const result = await uploadProductImage(file);

            if (result.imageUrl) {
                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, result.imageUrl],
                    // Set as thumbnail if first image
                    thumbnail: prev.thumbnail || result.imageUrl,
                }));
                toast.success("Tải ảnh lên thành công", { id: "imageUpload" });
            } else {
                toast.error("Không thể tải ảnh lên", { id: "imageUpload" });
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Không thể tải ảnh lên", { id: "imageUpload" });
        } finally {
            setImageLoading(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = [...formData.images];
        const removedImage = updatedImages.splice(index, 1)[0];

        // If removed image was the thumbnail, set new thumbnail to first image
        let newThumbnail = formData.thumbnail;
        if (formData.thumbnail === removedImage) {
            newThumbnail = updatedImages.length > 0 ? updatedImages[0] : "";
        }

        setFormData((prev) => ({
            ...prev,
            images: updatedImages,
            thumbnail: newThumbnail,
        }));
    };

    const setAsThumbnail = (imageUrl: string) => {
        setFormData((prev) => ({
            ...prev,
            thumbnail: imageUrl,
        }));

        // Also update the image preview
        setImagePreview(imageUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const requiredFields = ["name", "price", "category"];
        const missingFields = requiredFields.filter(
            (field) => !formData[field],
        );

        if (missingFields.length > 0) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        if (formData.images.length === 0) {
            toast.error("Vui lòng tải lên ít nhất một hình ảnh");
            return;
        }

        try {
            setLoading(true);

            const selectedCategory = categories.find(cat => String(cat.id) === String(formData.category));
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: formData.stock_quantity ?? 0,
                stockQuantity: formData.stock_quantity ?? 0,
                categoryId: selectedCategory ? Number(selectedCategory.id) : Number(formData.category),
                imageUrl:
                    (typeof formData.thumbnail === "string" && formData.thumbnail) ||
                    (Array.isArray(formData.images) && typeof formData.images[0] === "string" ? formData.images[0] : ""),
                specifications: formData.specifications || {},
                status: (formData.status === "active" ? "active" : "inactive") as "active" | "inactive",
                // Always send category as the name string for backend compatibility
                category: selectedCategory ? selectedCategory.name : formData.category,
            } as Omit<Product, "id" | "createdAt" | "updatedAt">;

            let result;
            if (mode === "add") {
                result = await createProduct(productData);
                toast.success("Tạo sản phẩm thành công");
            } else if (mode === "edit" && product?.id) {
                result = await updateProduct(product.id, productData);
                toast.success("Cập nhật sản phẩm thành công");
            }

            // Navigate back to product list
            router.push("/admin/products");
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error(
                mode === "add"
                    ? "Không thể tạo sản phẩm"
                    : "Không thể cập nhật sản phẩm",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 text-gray-800"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    {mode === "add"
                        ? "Thêm sản phẩm mới"
                        : "Chỉnh sửa sản phẩm"}
                </h2>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên sản phẩm *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category, idx) => (
                                <option key={`category-${idx}`} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá (VND) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tồn kho
                            </label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Đang bán</option>
                            <option value="inactive">Ngừng bán</option>
                        </select>
                    </div>
                </div>

                {/* Images and description */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hình ảnh sản phẩm *
                        </label>
                        <div className="mt-1 flex items-center">
                            <label className="block w-full">
                                <span className="sr-only">Chọn hình ảnh</span>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                    disabled={imageLoading}
                                />
                                <div className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 flex items-center justify-center cursor-pointer">
                                    {imageLoading ? (
                                        "Đang tải..."
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faUpload}
                                                className="mr-2"
                                            />
                                            Tải ảnh lên
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Image preview */}
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

                        {/* Display images */}
                        {formData.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Product ${index}`}
                                            className={`h-24 w-24 object-cover rounded-md border-2 ${formData.thumbnail === image
                                                ? "border-blue-500"
                                                : "border-gray-200"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon
                                                icon={faTimes}
                                                className="text-xs"
                                            />
                                        </button>
                                        {formData.thumbnail !== image && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAsThumbnail(image)
                                                }
                                                className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1"
                                            >
                                                Đặt làm ảnh chính
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Specifications */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Thông số kỹ thuật
                </h3>

                {/* Form for adding specifications */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1/3">
                        <select
                            name="key"
                            value={newSpec.key}
                            onChange={handleSpecChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Chọn thông số --</option>
                            {specificationTemplate.map((key) => (
                                <option
                                    key={key}
                                    value={key}
                                    disabled={key in formData.specifications} // Disable if already present
                                >
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-2/3">
                        {/* Always use text input for value */}
                        <input
                            type="text"
                            name="value"
                            value={newSpec.value}
                            onChange={handleSpecChange}
                            placeholder="Giá trị (Ví dụ: Intel Core i5)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                </div>

                {/* Display existing specifications */}
                <div className="bg-gray-50 rounded-md p-4">
                    {Object.keys(formData.specifications).length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {Object.entries(formData.specifications).map(
                                ([key, value]) => (
                                    <li
                                        key={key}
                                        className="py-2 flex justify-between"
                                    >
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                {key}:
                                            </span>{" "}
                                            <span className="text-gray-600">
                                                {value}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSpecification(key)
                                            }
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </li>
                                ),
                            )}
                        </ul>
                    ) : (
                        <p className="text-gray-500">
                            Chưa có thông số kỹ thuật.
                        </p>
                    )}
                </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? (
                        "Đang xử lý..."
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            {mode === "add"
                                ? "Tạo sản phẩm"
                                : "Cập nhật sản phẩm"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
