import { API_URL } from "@/config/constants";
import { normalizeProductsDiscounts } from "@/api/product";
import { ProductDetailsDto } from "@/types/product";

// Helper to include auth token in requests
const getAuthHeaders = (includeContentType = true) => {
    const token = localStorage.getItem("token");
    return {
        ...(includeContentType && { "Content-Type": "application/json" }),
        Authorization: token ? `Bearer ${token}` : "",
    };
};

/**
 * Fetch hot sales products
 * @returns Promise with array of hot sales products
 */
export async function getHotSalesProducts(): Promise<ProductDetailsDto[]> {
    try {
        const response = await fetch(`${API_URL}/products/hot-sales`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch hot sales products: ${response.status}`,
            );
        }

        const data = await response.json();

        // Normalize discount information
        return normalizeProductsDiscounts(data);
    } catch (error) {
        console.error("Error fetching hot sales products:", error);
        return [];
    }
}

/**
 * Add a product to hot sales (admin only)
 * @param productId The product ID to add
 * @param displayOrder Display order value (optional)
 * @returns Promise with success status
 */
export async function addToHotSales(
    productId: string,
    displayOrder: number = 0,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(
            `${API_URL}/products/admin/hot-sales/${productId}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ displayOrder }),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error adding product to hot sales:`, error);
        throw error;
    }
}

/**
 * Remove a product from hot sales (admin only)
 * @param productId The product ID to remove
 * @returns Promise with success status
 */
export async function removeFromHotSales(
    productId: string,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(
            `${API_URL}/products/admin/hot-sales/${productId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error removing product from hot sales:`, error);
        throw error;
    }
}

/**
 * Update the display order of a hot sales product (admin only)
 * @param productId The product ID to update
 * @param displayOrder New display order value
 * @returns Promise with success status
 */
export async function updateHotSalesOrder(
    productId: string,
    displayOrder: number,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(
            `${API_URL}/products/admin/hot-sales/${productId}/order`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ displayOrder }),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating hot sales order:`, error);
        throw error;
    }
}

/**
 * Fetch hot sales products with filtering, sorting and pagination
 */
export const getFilteredHotSalesProducts = async (
    page = 1,
    limit = 12,
    brands?: string[],
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
    search?: string,
): Promise<{
    products: ProductDetailsDto[];
    total: number;
    pages: number;
    page: number;
}> => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        if (brands && brands.length > 0) {
            params.append("brands", brands.join(","));
        }

        if (minPrice !== undefined && minPrice > 0) {
            params.append("minPrice", minPrice.toString());
        }

        if (maxPrice !== undefined && maxPrice < 100_000_000) {
            params.append("maxPrice", maxPrice.toString());
        }

        if (minRating !== undefined) {
            params.append("minRating", minRating.toString());
        }

        if (sortBy) {
            params.append("sortBy", sortBy);
        }

        if (search && search.trim() !== "") {
            params.append("search", search.trim());
        }

        const response = await fetch(
            `${API_URL}/products/hot-sales-filtered?${params.toString()}`,
        );

        if (!response.ok) {
            throw new Error("Failed to fetch filtered hot sales products");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching filtered hot sales products:", error);
        throw error;
    }
};
