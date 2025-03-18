import { API_URL } from "@/config/constants";
import { ProductDetails } from "@/types/ProductDetails";

/**
 * Fetches product details by ID
 * @param id The product ID to fetch
 * @returns ProductDetails object or null if not found
 */
export const fetchProductById = async (
    id: string,
): Promise<ProductDetails | null> => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product:", error);
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
): Promise<ProductDetails[]> => {
    try {
        const response = await fetch(
            `${API_URL}/products/similar?id=${id}&category=${encodeURIComponent(category)}&limit=${limit}`,
        );

        if (!response.ok) {
            throw new Error("Failed to fetch similar products");
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error("Error fetching similar products:", error);
        return [];
    }
};
