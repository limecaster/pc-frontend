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
        // Get sessionId from sessionStorage (where it's supposed to be based on events.ts)
        let sessionId = sessionStorage.getItem("sessionId");

        // Fallback to localStorage in case it was stored there
        if (!sessionId) {
            sessionId = localStorage.getItem("sessionId");
        }

        // If no sessionId found, generate a random one for this request
        if (!sessionId) {
            sessionId =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            // Store in sessionStorage for consistency with events.ts
            sessionStorage.setItem("sessionId", sessionId);
        }

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

        // Build URL parameters
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

        // Add cache-busting parameter
        params.append("_nocache", Date.now().toString());

        // Direct call to server API instead of Next.js route
        const url = `${API_URL}/products/recommendations?${params.toString()}`;

        // Simplified fetch without problematic headers
        const response = await fetch(url, {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch advanced recommendations");
        }

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
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

        // Get sessionId from sessionStorage (where it's supposed to be based on events.ts)
        let sessionId = sessionStorage.getItem("sessionId");

        // Fallback to localStorage in case it was stored there
        if (!sessionId) {
            sessionId = localStorage.getItem("sessionId");
        }

        // If no sessionId found, generate a random one for this request
        if (!sessionId) {
            sessionId =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            // Store in sessionStorage for consistency with events.ts
            sessionStorage.setItem("sessionId", sessionId);
        }

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
        params.append("category", category);

        if (customerId) {
            params.append("customerId", customerId.toString());
        }
        if (sessionId) {
            params.append("sessionId", sessionId);
        }
        if (limit) {
            params.append("limit", limit.toString());
        }

        // Add timestamp to prevent caching
        params.append("_nocache", Date.now().toString());

        // Direct call to server API instead of Next.js route
        const url = `${API_URL}/products/category-recommendations/${category}?${params.toString()}`;

        // Simplified fetch without problematic headers
        const response = await fetch(url, {
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch ${category} recommendations: ${response.status}`,
            );
            throw new Error(
                `Failed to fetch ${category} recommendations: ${response.status}`,
            );
        }
        const data = await response.json();
        if (!data.products || data.products.length === 0) {
            return [];
        }
        return data.products;
    } catch (error) {
        console.error(
            `Error fetching category recommendations for ${category}:`,
            error,
        );
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
        // Get sessionId from sessionStorage (where it's supposed to be based on events.ts)
        let sessionId = sessionStorage.getItem("sessionId");

        // Fallback to localStorage in case it was stored there
        if (!sessionId) {
            sessionId = localStorage.getItem("sessionId");
        }

        // If no sessionId found, generate a random one for this request
        if (!sessionId) {
            sessionId =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            // Store in sessionStorage for consistency with events.ts
            sessionStorage.setItem("sessionId", sessionId);
        }

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

        // Direct call to server API instead of Next.js route
        const url = `${API_URL}/products/preferred-categories?${params.toString()}`;

        // Simplified fetch without problematic headers
        const response = await fetch(url, {
            cache: "no-store",
        });

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
