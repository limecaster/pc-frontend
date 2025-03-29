/**
 * Product detail response DTO
 */
export interface ProductDetailsDto {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    discountPercentage?: number; // Add this for percentage display
    isDiscounted?: boolean; // Explicitly track if product has a discount
    discountSource?: "automatic" | "manual"; // Track where discount comes from
    discountType?: "fixed" | "percentage"; // Add the discount type
    rating: number;
    reviewCount: number;
    description?: string;
    additionalInfo?: string;
    imageUrl: string;
    additionalImages?: string[];
    specifications?: Record<string, any>;
    reviews?: ProductReviewDto[];
    sku: string;
    stock: string;
    brand: string;
    category: string;
    categories?: string[]; // Array of category strings
    color?: string;
    size?: string;
    stockQuantity?: number;
    slug?: string; // Add the slug property
}

/**
 * Product review DTO
 */
export interface ProductReviewDto {
    id: string;
    userId: string;
    username: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Subcategory filter structure
 */
export interface SubcategoryFilter {
    key: string;
    title: string;
    values: string[];
}

/**
 * Product search query parameters
 */
export interface ProductSearchParams {
    category?: string;
    page?: number;
    limit?: number;
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    subcategories?: Record<string, string[]>;
}
