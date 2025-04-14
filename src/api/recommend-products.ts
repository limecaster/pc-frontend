import { API_URL } from "@/config/constants";
import { ProductDetailsDto } from "@/types/product";

/**
 * Fetches product details by ID
 * @param id The product ID to fetch
 * @returns ProductDetails object or null if not found
 */
export const fetchProductById = async (
    id: string,
): Promise<ProductDetailsDto | null> => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }
        return await response.json();
    } catch (error) {
        return null;
    }
};

/**
 * Fetches similar products based on current product
 * @param id Current product ID
 * @param category Product category for similar items
 * @param limit Number of similar products to fetch
 * @returns Array of similar products
 */
export const fetchSimilarProducts = async (
    id: string,
    category: string,
    limit: number = 4,
): Promise<ProductDetailsDto[]> => {
    try {
        const response = await fetch(
            `${API_URL}/products/similar?id=${id}&category=${encodeURIComponent(
                category,
            )}&limit=${limit}`,
        );

        if (!response.ok) {
            throw new Error("Failed to fetch similar products");
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        return [];
    }
};

/**
 * Fetches recommended products based on user behavior
 * @param productId Current product ID
 * @param category Current product category
 * @param limit Number of recommendations to fetch
 * @returns Array of recommended products
 */
export const fetchRecommendedProducts = async (
    productId: string | undefined,
    category?: string,
    limit: number = 4,
): Promise<ProductDetailsDto[]> => {
    try {
        const sessionId = localStorage.getItem("sessionId");
        let customerId = undefined;

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.sub) {
                    customerId = payload.sub;
                }
            } catch (error) {}
        }

        let url = `${API_URL}/products/recommendations?productId=${productId}`;
        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }
        if (customerId) {
            url += `&customerId=${customerId}`;
        }
        if (sessionId) {
            url += `&sessionId=${sessionId}`;
        }
        if (limit) {
            url += `&limit=${limit}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch recommended products");
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        return [];
    }
};

/**
 * Fetches advanced recommendations for the recommendations page
 * Uses both user behavior and viewed products data
 * @param category Optional category filter
 * @param limit Number of recommendations to fetch
 * @returns Array of recommended products
 */
export const fetchAdvancedRecommendations = async (
    category?: string,
    limit: number = 10,
): Promise<ProductDetailsDto[]> => {
    try {
        const sessionId = localStorage.getItem("sessionId");
        let customerId = undefined;

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.sub) {
                    customerId = payload.sub;
                }
            } catch (error) {}
        }

        const params = new URLSearchParams();
        if (category) {
            params.append("category", category);
        }
        if (customerId) {
            params.append("customerId", customerId.toString());
        }
        if (sessionId) {
            params.append("sessionId", sessionId);
        }
        if (limit) {
            params.append("limit", limit.toString());
        }

        const url = `/api/products/recommendations?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch advanced recommendations");
        }
        const data = await response.json();
        if (!data.success || !data.products || data.products.length === 0) {
            return [];
        }
        return data.products;
    } catch (error) {
        return [];
    }
};

/**
 * Fetches category-specific recommendations
 * @param category Product category to get recommendations for
 * @param limit Number of recommendations to fetch
 * @returns Array of recommended products
 */
export const fetchCategoryRecommendations = async (
    category: string,
    limit: number = 10,
): Promise<ProductDetailsDto[]> => {
    try {
        if (!category) {
            return [];
        }

        const url = `/api/products/category-recommendations/${encodeURIComponent(
            category,
        )}?limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch ${category} recommendations: ${response.status}`,
            );
        }
        const data = await response.json();
        if (!data.success || !data.products || data.products.length === 0) {
            return [];
        }
        return data.products;
    } catch (error) {
        return [];
    }
};

/**
 * Fetches preferred categories for a user based on their behavior
 * @param limit Number of categories to fetch
 * @returns Array of category names
 */
export const fetchPreferredCategories = async (
    limit: number = 5,
): Promise<string[]> => {
    try {
        const sessionId = localStorage.getItem("sessionId");
        let customerId = undefined;

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.sub) {
                    customerId = payload.sub;
                }
            } catch (error) {}
        }

        const params = new URLSearchParams();
        if (customerId) {
            params.append("customerId", customerId.toString());
        }
        if (sessionId) {
            params.append("sessionId", sessionId);
        }
        if (limit) {
            params.append("limit", limit.toString());
        }

        const url = `${API_URL}/products/preferred-categories?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch preferred categories");
        }
        const data = await response.json();
        if (!data.categories || !Array.isArray(data.categories)) {
            return ["CPU", "GraphicsCard", "Motherboard"];
        }
        return data.categories;
    } catch (error) {
        return ["CPU", "GraphicsCard", "Motherboard"];
    }
};
