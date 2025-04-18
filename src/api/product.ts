import { API_URL } from "@/config/constants";
import { ProductDetailsDto } from "@/types/product";

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
 * Post-process product data to normalize discount information
 * @param product The product data from API
 * @returns Product with normalized discount fields
 */
export function normalizeProductDiscount(product: any) {
    // Make a copy to avoid mutating the original
    const normalizedProduct = { ...product };

    // Define meaningful discount thresholds
    const MIN_DISCOUNT_PERCENT = 1.0; // Minimum 1% discount to be considered meaningful
    const MIN_DISCOUNT_AMOUNT = 50000; // Minimum 50,000 VND discount to be considered meaningful

    // Handle discount information consistently - apply only if difference is meaningful
    if (
        normalizedProduct.originalPrice &&
        normalizedProduct.originalPrice > normalizedProduct.price
    ) {
        const priceDifference =
            normalizedProduct.originalPrice - normalizedProduct.price;
        const percentDifference =
            (priceDifference / normalizedProduct.originalPrice) * 100;

        // Check if the discount meets our meaningful threshold
        const isSignificantPercent = percentDifference >= MIN_DISCOUNT_PERCENT;
        const isSignificantAmount = priceDifference >= MIN_DISCOUNT_AMOUNT;

        // Only apply discount if it meets at least one threshold criterion
        if (isSignificantPercent || isSignificantAmount) {
            normalizedProduct.isDiscounted = true;

            // Calculate discount percentage
            if (!normalizedProduct.discountPercentage) {
                normalizedProduct.discountPercentage = Math.max(
                    1,
                    Math.round(percentDifference),
                );
            }

            // Default to 'manual' discount source if not specified
            if (!normalizedProduct.discountSource) {
                normalizedProduct.discountSource = "manual";
            }
        } else {
            // Keep the original price but don't mark as discounted
            normalizedProduct.isDiscounted = false;
            normalizedProduct.discountPercentage = undefined;
        }
    }

    // Enhanced logic for handling categories and discount sources
    if (product.categories && !Array.isArray(product.categories)) {
        product.categories = product.category ? [product.category] : [];
    }

    // Ensure appropriate discountType based on info we have
    if (
        product.isDiscounted &&
        product.originalPrice &&
        product.originalPrice > product.price
    ) {
        if (!product.discountType) {
            // If we have a discountPercentage, it's likely a percentage discount
            if (product.discountPercentage) {
                product.discountType = "percentage";
            } else {
                // Otherwise calculate if it's closer to a common percentage or just a fixed amount
                const percentOff =
                    ((product.originalPrice - product.price) /
                        product.originalPrice) *
                    100;
                const roundedPercent = Math.round(percentOff);

                // If it's close to common discount percentages (5%, 10%, 15%, etc) then it's likely percentage
                if (
                    Math.abs(percentOff - roundedPercent) < 0.1 &&
                    roundedPercent % 5 === 0
                ) {
                    product.discountType = "percentage";
                    if (!product.discountPercentage) {
                        product.discountPercentage = roundedPercent;
                    }
                } else {
                    product.discountType = "fixed";
                }
            }
        }
    }

    return normalizedProduct;
}

/**
 * Process array of products to normalize discount information
 * @param products Array of products from API
 * @returns Products with normalized discount fields
 */
export function normalizeProductsDiscounts(products: any[]) {
    return products.map((product) => normalizeProductDiscount(product));
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

        const data = await response.json();

        // Normalize discount information in products
        if (data.products && Array.isArray(data.products)) {
            data.products = normalizeProductsDiscounts(data.products);
        }

        return data;
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
            `${API_URL}/products/subcategory-values/${encodeURIComponent(
                category,
            )}/${encodeURIComponent(subcategory)}`,
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

            const subcategoriesParam = encodeURIComponent(
                JSON.stringify(subcategoryFilters),
            );
            url += `&subcategories=${subcategoriesParam}`;
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        // Normalize discount information in products
        if (data.products && Array.isArray(data.products)) {
            data.products = normalizeProductsDiscounts(data.products);
        }

        return data;
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
 * @param category Optional category filter
 * @param subcategoryFilters Optional subcategory filters (e.g., {socket: ['LGA1700']})
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
    category?: string | null,
    subcategoryFilters?: Record<string, string[]>,
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

        // Add category filter if provided
        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }

        // Add subcategory filters if provided
        if (subcategoryFilters && Object.keys(subcategoryFilters).length > 0) {
            const subcategoriesParam = encodeURIComponent(
                JSON.stringify(subcategoryFilters),
            );
            url += `&subcategories=${subcategoriesParam}`;
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

        // Normalize discount information in products
        if (data.products && Array.isArray(data.products)) {
            data.products = normalizeProductsDiscounts(data.products);
        }

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

        const data = await response.json();

        // Normalize discount information for product
        return normalizeProductDiscount(data);
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
            `${API_URL}/products/search-suggestions?query=${encodeURIComponent(
                query,
            )}`,
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
        url += `&subcategories=${encodeURIComponent(
            JSON.stringify(subcategoryFilters),
        )}`;
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

/**
 * Get multiple products by IDs with discount information pre-calculated
 * This replaces the need to extract categories from product names on frontend
 * @param productIds Array of product IDs to retrieve
 * @returns Promise with array of products with discount info
 */
export async function getProductsWithDiscounts(
    productIds: string[],
): Promise<any[]> {
    try {
        if (!productIds || productIds.length === 0) {
            return [];
        }

        // Use the new batch endpoint
        const response = await fetch(
            `${API_URL}/products/batch-with-discounts`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productIds }),
            },
        );

        if (!response.ok) {
            console.error(`Failed to fetch products batch: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error("Error fetching products with discounts:", error);
        return [];
    }
}

/**
 * Batch load products with their discounts pre-calculated
 * More efficient than making individual requests
 * @param ids Array of product IDs to fetch
 * @returns Promise with enriched product data
 */
export async function batchLoadProductsWithDiscounts(
    ids: string[],
): Promise<ProductDetailsDto[]> {
    try {
        if (!ids || ids.length === 0) {
            return [];
        }

        // Deduplicate IDs just to be safe
        const uniqueIds = [...new Set(ids)];
        const response = await fetch(
            `${API_URL}/products/batch-with-discounts`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productIds: uniqueIds,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to batch load products: ${response.status}`,
            );
        }

        const result = await response.json();

        if (!result.success || !result.products) {
            console.warn(
                "Batch product request succeeded but had invalid format",
            );
            return [];
        }
        // Process returned products to normalize discount data
        return normalizeProductsDiscounts(result.products);
    } catch (error) {
        console.error("Error batch loading products:", error);
        return [];
    }
}

interface PaginatedResponse<T> {
    products: T[];
    total: number;
    pages: number;
}

export const getViewedProducts = async (
    page: number = 1,
): Promise<PaginatedResponse<ProductDetailsDto>> => {
    const response = await fetch(`${API_URL}/viewed-products?page=${page}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get viewed products: ${response.status}`);
    }

    return await response.json();
};

/**
 * Clear all viewed products for the current user
 * @returns Promise with success status
 */
export async function clearViewedProducts(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const response = await fetch(`${API_URL}/viewed-products`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to clear viewed products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error clearing viewed products:", error);
        return {
            success: false,
            message: error.message || "Unknown error occurred",
        };
    }
}
