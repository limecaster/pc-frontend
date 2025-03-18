export interface Review {
    id: string;
    username: string;
    rating: number;
    date: string;
    content: string;
    avatar: string;
}

export interface ProductDetails {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating: number;
    reviewCount: number;
    description: string;
    additionalInfo?: string;
    imageUrl: string;
    additionalImages?: string[];
    specifications: Record<string, string>;
    reviews?: Review[];
    sku: string;
    stock: string;
    brand: string;
    category: string;
    color?: string;
    size?: string;
}
