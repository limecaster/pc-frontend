"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { toast } from "react-hot-toast";

import {
    fetchDiscounts,
    fetchDiscountStatistics,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchProductsForSelector,
    fetchCategoriesForSelector,
    fetchCustomersForSelector,
    Discount,
    DiscountInput,
} from "@/api/discount";

// Component imports
import DiscountTable from "@/components/admin/discounts/DiscountTable";
import DiscountForm from "@/components/admin/discounts/DiscountForm";
import DeleteConfirmationModal from "@/components/admin/discounts/DeleteConfirmationModal";
import SelectorModal from "@/components/admin/SelectorModal";

export default function DiscountsManagement() {
    const router = useRouter();

    const [discounts, setDiscounts] = useState<Discount[]>([]);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<
        number | null
    >(null);

    // Form data
    const [formData, setFormData] = useState<DiscountInput>({
        discountCode: "",
        discountName: "",
        discountDescription: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        discountAmount: 0,
        type: "percentage",
        status: "active",
    });
    const [currentDiscountId, setCurrentDiscountId] = useState<number | null>(
        null,
    );

    // Selector data
    const [categories, setCategories] = useState<string[]>([]);
    const [loadingSelectors, setLoadingSelectors] = useState<boolean>(false);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [showCustomerSelector, setShowCustomerSelector] = useState(false);
    const [selectedProductNames, setSelectedProductNames] = useState<
        Record<string, string>
    >({});
    const [selectedCustomerNames, setSelectedCustomerNames] = useState<
        Record<string, string>
    >({});

    // Load discount data on mount
    useEffect(() => {
        loadDiscountsData();
    }, []);

    const loadDiscountsData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const discountsData = await fetchDiscounts();
            setDiscounts(discountsData);
        } catch (error) {
            console.error("Error loading discounts:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load discounts",
            );

            if (
                error instanceof Error &&
                error.message?.includes("Authentication")
            ) {
                router.push("/admin/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDiscount = () => {
        setModalMode("create");
        setFormData({
            discountCode: "",
            discountName: "",
            discountDescription: "",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            discountAmount: 0,
            type: "percentage",
            status: "active",
        });
        setShowModal(true);
    };

    const handleEditDiscount = (discount: Discount) => {
        setModalMode("edit");
        setCurrentDiscountId(discount.id);
        setFormData({
            discountCode: discount.discountCode,
            discountName: discount.discountName,
            discountDescription: discount.discountDescription || "",
            startDate: new Date(discount.startDate).toISOString().split("T")[0],
            endDate: new Date(discount.endDate).toISOString().split("T")[0],
            discountAmount: discount.discountAmount,
            type: discount.type,
            status: discount.status as "active" | "inactive",
            targetType: discount.targetType,
            productIds: discount.productIds,
            categoryNames: discount.categoryNames,
            customerIds: discount.customerIds,
            minOrderAmount: discount.minOrderAmount,
            isFirstPurchaseOnly: discount.isFirstPurchaseOnly,
            isAutomatic: discount.isAutomatic,
        });
        setShowModal(true);

        // Load target data if needed
        loadTargetData(discount);
    };

    const loadTargetData = async (discount: Discount) => {
        if (discount.targetType === "products" && discount.productIds?.length) {
            try {
                const result = await fetchProductsForSelector("", 1, 100);
                const productMap: Record<string, string> = {};
                result.products.forEach((p) => {
                    if (discount.productIds?.includes(p.id)) {
                        productMap[p.id] = p.name;
                    }
                });
                setSelectedProductNames(productMap);
            } catch (error) {
                console.error("Error loading selected product names:", error);
            }
        }

        if (
            discount.targetType === "customers" &&
            discount.customerIds?.length
        ) {
            try {
                const result = await fetchCustomersForSelector("", 1, 100);
                const customerMap: Record<string, string> = {};
                result.customers.forEach((c) => {
                    if (discount.customerIds?.includes(c.id)) {
                        customerMap[c.id] = c.name;
                    }
                });
                setSelectedCustomerNames(customerMap);
            } catch (error) {
                console.error("Error loading selected customer names:", error);
            }
        }

        if (discount.targetType === "categories" && categories.length === 0) {
            await loadSelectorData("categories");
        }
    };

    const handleDeleteDiscount = async () => {
        if (!deleteConfirmationId) return;

        try {
            setIsSubmitting(true);
            await deleteDiscount(deleteConfirmationId);
            setDeleteConfirmationId(null);
            toast.success("Mã giảm giá đã được xóa thành công");
            loadDiscountsData();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete discount",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = (id: number) => {
        setDeleteConfirmationId(id);
    };

    // Form handling
    const handleFormChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;

        // Special handling for numeric fields
        if (name === "discountAmount") {
            const numValue = parseFloat(value);
            setFormData((prev) => ({
                ...prev,
                [name]: isNaN(numValue) ? 0 : numValue,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const submissionData = {
                ...formData,
                discountAmount: Number(formData.discountAmount),
            };

            if (modalMode === "create") {
                await createDiscount(submissionData);
                toast.success("Mã giảm giá đã được tạo thành công");
            } else {
                if (currentDiscountId === null) {
                    throw new Error("Missing discount ID");
                }
                await updateDiscount(currentDiscountId, submissionData);
                toast.success("Mã giảm giá đã được cập nhật thành công");
            }

            setShowModal(false);
            loadDiscountsData();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save discount",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Target type and selector handling
    const handleTargetTypeChange = async (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const targetType = e.target.value;
        setFormData((prev) => ({
            ...prev,
            targetType: targetType as
                | "all"
                | "products"
                | "categories"
                | "customers",
        }));

        // Clear previous selections when changing target type
        setFormData((prev) => ({
            ...prev,
            productIds: targetType === "products" ? prev.productIds : [],
            categoryNames:
                targetType === "categories" ? prev.categoryNames : [],
            customerIds: targetType === "customers" ? prev.customerIds : [],
        }));

        if (targetType === "products" && formData.productIds?.length) {
            try {
                const result = await fetchProductsForSelector("", 1, 100);
                const productMap: Record<string, string> = {};
                result.products.forEach((p) => {
                    if (formData.productIds?.includes(p.id)) {
                        productMap[p.id] = p.name;
                    }
                });
                setSelectedProductNames(productMap);
            } catch (error) {
                console.error("Error loading selected product names:", error);
            }
        } else if (targetType === "customers" && formData.customerIds?.length) {
            try {
                const result = await fetchCustomersForSelector("", 1, 100);
                const customerMap: Record<string, string> = {};
                result.customers.forEach((c) => {
                    if (formData.customerIds?.includes(c.id)) {
                        customerMap[c.id] = c.name;
                    }
                });
                setSelectedCustomerNames(customerMap);
            } catch (error) {
                console.error("Error loading selected customer names:", error);
            }
        } else if (targetType === "categories" && categories.length === 0) {
            await loadSelectorData("categories");
        }
    };

    const loadSelectorData = async (targetType: string) => {
        setLoadingSelectors(true);
        try {
            if (targetType === "categories" && categories.length === 0) {
                const categoriesData = await fetchCategoriesForSelector();
                setCategories(categoriesData);
                if (categoriesData.length === 0) {
                    toast.error(
                        "Không thể tải danh sách danh mục từ server. Đang sử dụng dữ liệu mẫu.",
                    );
                }
            }
        } catch (error) {
            console.error("Error loading selector data:", error);
            toast.error("Không thể tải dữ liệu cho bộ chọn. Vui lòng thử lại.");
        } finally {
            setLoadingSelectors(false);
        }
    };

    // Selector modal handlers
    const fetchProductsForModal = async (
        search: string,
        page: number,
        limit: number,
    ) => {
        const result = await fetchProductsForSelector(search, page, limit);
        return {
            items: result.products,
            total: result.total,
            pages: result.pages,
        };
    };

    const fetchCustomersForModal = async (
        search: string,
        page: number,
        limit: number,
    ) => {
        const result = await fetchCustomersForSelector(search, page, limit);
        return {
            items: result.customers,
            total: result.total,
            pages: result.pages,
        };
    };

    const handleProductSelection = (selectedIds: string[]) => {
        setFormData((prev) => ({ ...prev, productIds: selectedIds }));
    };

    const handleCustomerSelection = (selectedIds: string[]) => {
        setFormData((prev) => ({ ...prev, customerIds: selectedIds }));
    };

    // Error handling
    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                    <h2 className="text-lg font-semibold text-red-800">
                        Error
                    </h2>
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Reload page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý mã giảm giá
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tạo và quản lý các mã giảm giá cho khách hàng
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button
                        onClick={handleCreateDiscount}
                        className="bg-primary hover:bg-blue-700 text-white"
                    >
                        <HiPlus className="mr-2 h-5 w-5" />
                        Tạo mã giảm giá mới
                    </Button>
                </div>
            </div>

            {/* Statistics Cards
            <StatisticsCards
                totalUsage={statistics.totalUsage}
                totalSavings={statistics.totalSavings}
                mostUsedDiscounts={statistics.mostUsedDiscounts}
                isLoading={isLoading}
            /> */}

            {/* Discount Table */}
            <DiscountTable
                discounts={discounts}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                handleEditDiscount={handleEditDiscount}
                handleConfirmDelete={handleConfirmDelete}
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                size="lg"
            >
                <Modal.Header>
                    {modalMode === "create"
                        ? "Tạo mã giảm giá mới"
                        : "Chỉnh sửa mã giảm giá"}
                </Modal.Header>
                <Modal.Body>
                    <DiscountForm
                        formData={formData}
                        modalMode={modalMode}
                        isSubmitting={isSubmitting}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        handleFormChange={handleFormChange}
                        handleTargetTypeChange={handleTargetTypeChange}
                        selectedProductNames={selectedProductNames}
                        selectedCustomerNames={selectedCustomerNames}
                        showProductSelector={showProductSelector}
                        showCustomerSelector={showCustomerSelector}
                        setShowProductSelector={setShowProductSelector}
                        setShowCustomerSelector={setShowCustomerSelector}
                        categories={categories}
                        loadingSelectors={loadingSelectors}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowModal(false)} color="gray">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isProcessing={isSubmitting}
                        disabled={isSubmitting}
                        className="bg-blue-700"
                    >
                        {modalMode === "create"
                            ? "Tạo mã giảm giá"
                            : "Cập nhật"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                deleteConfirmationId={deleteConfirmationId}
                setDeleteConfirmationId={setDeleteConfirmationId}
                handleDeleteDiscount={handleDeleteDiscount}
                isSubmitting={isSubmitting}
            />

            {/* Product Selector Modal */}
            <SelectorModal
                title="Chọn sản phẩm áp dụng"
                show={showProductSelector}
                onClose={() => setShowProductSelector(false)}
                fetchItems={fetchProductsForModal}
                onSelect={handleProductSelection}
                currentSelection={formData.productIds || []}
                itemsPerPage={10}
            />

            {/* Customer Selector Modal */}
            <SelectorModal
                title="Chọn khách hàng áp dụng"
                show={showCustomerSelector}
                onClose={() => setShowCustomerSelector(false)}
                fetchItems={fetchCustomersForModal}
                onSelect={handleCustomerSelection}
                currentSelection={formData.customerIds || []}
                itemsPerPage={10}
            />
        </div>
    );
}
