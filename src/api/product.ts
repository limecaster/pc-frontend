import { API_URL } from "@/config/constants";

/**
 * Fetch all available product brands
 * @returns Promise with list of brand names
 */
export async function fetchAllBrands() {
    try {
        const response = await fetch(`${API_URL}/products/brands`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch brands: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

/**
 * Fetch all products with pagination and optional filters
 * @param page Page number (starts from 1)
 * @param limit Items per page
 * @param brands Optional array of brand names to filter by
 * @param minPrice Optional minimum price filter
 * @param maxPrice Optional maximum price filter
 * @param minRating Optional minimum rating filter (1-5)
 * @returns Promise with products and pagination info
 */
export async function fetchAllProducts(
    page: number = 1,
    limit: number = 12,
    brands?: string[],
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
) {
    try {
        let url = `${API_URL}/products/all?page=${page}&limit=${limit}`;

        if (brands && brands.length > 0) {
            url += `&brands=${brands.join(",")}`;
        }

        if (minPrice !== undefined) {
            url += `&minPrice=${minPrice}`;
        }

        if (maxPrice !== undefined) {
            url += `&maxPrice=${maxPrice}`;
        }

        if (minRating !== undefined) {
            url += `&minRating=${minRating}`;
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
}

/**
 * Fetch available subcategory values for a specific category
 * @param category The product category (e.g., CPU, GraphicsCard)
 * @param subcategory The subcategory name (e.g., socket, series)
 * @returns Promise with list of available values for the subcategory
 */
export async function fetchSubcategoryValues(
    category: string,
    subcategory: string,
) {
    try {
        const response = await fetch(
            `${API_URL}/products/subcategory-values/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch subcategory values: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error(
            `Error fetching ${subcategory} values for ${category}:`,
            error,
        );
        throw error;
    }
}

/**
 * Fetch products by category with filters
 * @param category Category name/identifier
 * @param page Page number (starts from 1)
 * @param limit Items per page
 * @param brands Optional array of brand names to filter by
 * @param minPrice Optional minimum price filter
 * @param maxPrice Optional maximum price filter
 * @param minRating Optional minimum rating filter (1-5)
 * @param subcategoryFilters Optional subcategory filters (e.g., {socket: ['LGA1700'], type: ['SSD']})
 * @returns Promise with products in the category and pagination info
 */
export async function fetchProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 12,
    brands?: string[],
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    subcategoryFilters?: Record<string, string[]>,
) {
    try {
        let url = `${API_URL}/products/category/${encodeURIComponent(
            category,
        )}?page=${page}&limit=${limit}`;

        if (brands && brands.length > 0) {
            url += `&brands=${brands.join(",")}`;
        }

        if (minPrice !== undefined) {
            url += `&minPrice=${minPrice}`;
        }

        if (maxPrice !== undefined) {
            url += `&maxPrice=${maxPrice}`;
        }

        if (minRating !== undefined) {
            url += `&minRating=${minRating}`;
        }

        // Add subcategory filters if provided
        if (subcategoryFilters && Object.keys(subcategoryFilters).length > 0) {
            // Make sure subcategoryFilters is properly structured before encoding
            console.log("Applying subcategory filters:", subcategoryFilters);
            const subcategoriesParam = encodeURIComponent(
                JSON.stringify(subcategoryFilters),
            );
            url += `&subcategories=${subcategoriesParam}`;
            console.log("API URL with subcategory filters:", url);
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(
            `Error fetching products for category ${category}:`,
            error,
        );
        throw error;
    }
}

/**
 * Fetch new/featured products for landing page
 * @returns Promise with featured products
 */
export async function fetchNewProducts() {
    try {
        const response = await fetch(
            `${API_URL}/products/landing-page-products`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch new products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching new products:", error);
        throw error;
    }
}

/**
 * Search for products with filters
 * @param query Search query string
 * @param page Page number (starts from 1)
 * @param limit Items per page
 * @param brands Optional array of brand names to filter by
 * @param minPrice Optional minimum price filter
 * @param maxPrice Optional maximum price filter
 * @param minRating Optional minimum rating filter (1-5)
 * @returns Promise with search results and pagination info
 */
export async function searchProducts(
    query: string,
    page: number = 1,
    limit: number = 12,
    brands?: string[],
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
) {
    try {
        let url = `${API_URL}/products/search?query=${encodeURIComponent(
            query,
        )}&page=${page}&limit=${limit}`;

        if (brands && brands.length > 0) {
            url += `&brands=${brands.join(",")}`;
        }

        if (minPrice !== undefined) {
            url += `&minPrice=${minPrice}`;
        }

        if (maxPrice !== undefined) {
            url += `&maxPrice=${maxPrice}`;
        }

        if (minRating !== undefined) {
            url += `&minRating=${minRating}`;
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
}

/**
 * Get a product by its ID
 * @param id The product ID
 * @returns The product data or null if not found
 */
export async function getProductById(id: string) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        return null;
    }
}

/**
 * Get search suggestions for autocomplete
 * @param query The search query to get suggestions for
 * @returns Promise with array of suggestion strings
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(
            `${API_URL}/products/search-suggestions?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch search suggestions: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching search suggestions:", error);
        return [];
    }
}

/**
 * Generate a URL for a category page with optional subcategory filters
 * @param category The product category (e.g., CPU, GraphicsCard)
 * @param subcategoryFilters Optional subcategory filters (e.g., {manufacturer: ['AMD']})
 * @param brands Optional array of brand names to filter by
 * @param minPrice Optional minimum price filter
 * @param maxPrice Optional maximum price filter
 * @param minRating Optional minimum rating filter (1-5)
 * @returns A properly formatted URL string
 */
export function generateCategoryUrl(
    category: string,
    subcategoryFilters?: Record<string, string[]>,
    brands?: string[],
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
): string {
    let url = `/products?category=${encodeURIComponent(category)}`;

    if (subcategoryFilters && Object.keys(subcategoryFilters).length > 0) {
        url += `&subcategories=${encodeURIComponent(JSON.stringify(subcategoryFilters))}`;
    }

    if (brands && brands.length > 0) {
        url += `&brands=${brands.join(",")}`;
    }

    if (minPrice !== undefined) {
        url += `&minPrice=${minPrice}`;
    }

    if (maxPrice !== undefined) {
        url += `&maxPrice=${maxPrice}`;
    }

    if (minRating !== undefined) {
        url += `&minRating=${minRating}`;
    }

    return url;
}

/**
 * Get stock quantities for multiple products
 * @param productIds Array of product IDs to get stock quantities for
 * @returns Promise with product stock quantities { id: stock_quantity }
 */
export async function getProductsStockQuantities(
    productIds: string[],
): Promise<Record<string, number>> {
    try {
        if (!productIds || productIds.length === 0) {
            return {};
        }

        // Remove duplicates
        const uniqueIds = [...new Set(productIds)];

        // Use comma-separated format which is less likely to cause issues
        const idsParam = uniqueIds.join(",");

        // Log the request for debugging
        console.log(`Fetching stock quantities for products: ${idsParam}`);

        const response = await fetch(
            `${API_URL}/products/stock?ids=${encodeURIComponent(idsParam)}`,
        );

        if (!response.ok) {
            // Get response text for better error diagnosis
            const responseText = await response.text();
            console.error(
                `Stock API returned ${response.status}: ${responseText}`,
            );
            throw new Error(
                `Failed to get stock quantities: ${response.status}`,
            );
        }

        const data = await response.json();
        return data.stocks || {};
    } catch (error) {
        console.error("Error fetching stock quantities:", error);
        return {}; // Return empty object rather than failing completely
    }
}
