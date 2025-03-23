import { Discount, DiscountInput } from "@/api/discount";

export interface DiscountFormProps {
    formData: DiscountInput;
    modalMode: "create" | "edit";
    isSubmitting: boolean;
    setFormData: React.Dispatch<React.SetStateAction<DiscountInput>>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleFormChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    handleTargetTypeChange: (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => Promise<void>;
    selectedProductNames: Record<string, string>;
    selectedCustomerNames: Record<string, string>;
    showProductSelector: boolean;
    showCustomerSelector: boolean;
    setShowProductSelector: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCustomerSelector: React.Dispatch<React.SetStateAction<boolean>>;
    categories: string[];
    loadingSelectors: boolean;
}

export interface DiscountTableProps {
    discounts: Discount[];
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    itemsPerPage: number;
    handleEditDiscount: (discount: Discount) => void;
    handleConfirmDelete: (id: number) => void;
    isLoading: boolean;
}

export interface DeleteConfirmationModalProps {
    deleteConfirmationId: number | null;
    setDeleteConfirmationId: React.Dispatch<
        React.SetStateAction<number | null>
    >;
    handleDeleteDiscount: () => Promise<void>;
    isSubmitting: boolean;
}

export interface StatisticsCardProps {
    totalUsage: number;
    totalSavings: number;
    mostUsedDiscounts: { discountCode: string; usageCount: number }[];
    isLoading: boolean;
}
