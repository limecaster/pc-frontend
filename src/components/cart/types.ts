import { Discount } from "@/api/discount";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    stock_quantity?: number;
    slug?: string;
    originalPrice?: number;
    discountSource?: "automatic" | "manual";
    discountType?: "percentage" | "fixed";
    discountedPrice?: number;
    discountAmount?: number;
    category: string;
    categoryNames?: string[];
    discountPercentage?: number;
    discountName?: string;
    discountCode?: string;
}

export interface PendingDiscountData {
    discount: Discount | null;
    discountAmount: number;
    autoAmount: number;
    targetedProducts: CartItem[];
}
