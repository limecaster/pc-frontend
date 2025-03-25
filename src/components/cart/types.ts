import { Discount } from "@/api/discount";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    slug: string;
    stock_quantity?: number;
    category: string;
    categoryNames?: string[];
    originalPrice?: number;
    discountSource?: "automatic" | "manual";
    discountType?: "fixed" | "percentage";
    discountAmount?: number; // Track the actual discount amount applied to this item
    discountPercentage?: number; // Add this property to track percentage-based discounts
}

export interface PendingDiscountData {
    discount: Discount | null;
    discountAmount: number;
    autoAmount: number;
    targetedProducts: CartItem[];
}
