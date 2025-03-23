import { API_URL } from "@/config/constants";

// Update the interface for Discount object with new fields
export interface Discount {
    id: number;
    discountCode: string;
    discountName: string;
    discountDescription?: string;
    startDate: string;
    endDate: string;
    discountAmount: number;
    type: "percentage" | "fixed";
    status: "active" | "inactive" | "expired";
    targetType: "all" | "products" | "categories" | "customers";
    productIds?: string[];
    categoryNames?: string[];
    customerIds?: string[];
    minOrderAmount?: number;
    isFirstPurchaseOnly: boolean;
    isAutomatic: boolean;
    createdAt?: string;
    updatedAt?: string;
    // New property to store names of targeted products for display
    targetedProducts?: string[];
}

// Update interface for creating/updating discount
export interface DiscountInput {
    discountCode: string;
    discountName: string;
    discountDescription?: string;
    startDate: string;
    endDate: string;
    discountAmount: number;
    type: "percentage" | "fixed";
    status?: "active" | "inactive";
    targetType?: "all" | "products" | "categories" | "customers";
    productIds?: string[];
    categoryNames?: string[];
    customerIds?: string[];
    minOrderAmount?: number;
    isFirstPurchaseOnly?: boolean;
    isAutomatic?: boolean;
}

// Update function to fetch products with search and pagination
export async function fetchProductsForSelector(
    search?: string,
    page: number = 1,
    limit: number = 10,
): Promise<{
    products: { id: string; name: string }[];
    total: number;
    pages: number;
}> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log("Fetching products with search:", search, "page:", page);

        // Build query string
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());

        const response = await fetch(
            `${API_URL}/products/admin/simple-list?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            console.warn(
                `API error: Failed to fetch products: ${response.status}`,
            );
            return {
                products: getFallbackProducts(),
                total: 10,
                pages: 1,
            };
        }

        const data = await response.json();
        return {
            products: data.products || [],
            total: data.total || 0,
            pages: data.pages || 1,
        };
    } catch (error) {
        console.error("Error fetching products for selector:", error);
        return {
            products: getFallbackProducts(),
            total: 10,
            pages: 1,
        };
    }
}

// Helper function to get fallback product data
function getFallbackProducts(): { id: string; name: string }[] {
    console.log("Returning fallback product data");
    return [
        { id: "1", name: "AMD Ryzen 7 5800X" },
        { id: "2", name: "NVIDIA GeForce RTX 3080" },
        { id: "3", name: "Samsung 970 EVO Plus 1TB" },
        { id: "4", name: "Corsair Vengeance RGB Pro 32GB" },
        { id: "5", name: "ASUS ROG Strix B550-F Gaming" },
        { id: "6", name: "Intel Core i9-12900K" },
        { id: "7", name: "MSI GeForce RTX 3070" },
        { id: "8", name: "Western Digital Black SN850 2TB" },
        { id: "9", name: "G.Skill Trident Z RGB 64GB" },
        { id: "10", name: "ASUS ROG Maximus Z690 Hero" },
    ];
}

// Add function to fetch categories for the selector
export async function fetchCategoriesForSelector(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/products/categories`, {
            method: "GET",
        });

        if (!response.ok) {
            console.warn(
                `API error: Failed to fetch categories: ${response.status}`,
            );
            // Return fallback categories
            return [
                "CPU",
                "GPU",
                "Motherboard",
                "RAM",
                "Storage",
                "PSU",
                "Case",
                "Cooling",
                "Monitor",
                "Keyboard",
                "Mouse",
            ];
        }

        const data = await response.json();
        return data.categories || [];
    } catch (error) {
        console.error("Error fetching categories for selector:", error);
        // Return fallback categories on error
        return [
            "CPU",
            "GPU",
            "Motherboard",
            "RAM",
            "Storage",
            "PSU",
            "Case",
            "Cooling",
            "Monitor",
            "Keyboard",
            "Mouse",
        ];
    }
}

// Update function to fetch customers with search and pagination
export async function fetchCustomersForSelector(
    search?: string,
    page: number = 1,
    limit: number = 10,
): Promise<{
    customers: { id: string; name: string }[];
    total: number;
    pages: number;
}> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log("Fetching customers with search:", search, "page:", page);

        // Build query string
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());

        const response = await fetch(
            `${API_URL}/customers/simple-list?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            console.warn(
                `API error: Failed to fetch customers: ${response.status}`,
            );
            return {
                customers: getFallbackCustomers(),
                total: 5,
                pages: 1,
            };
        }

        const data = await response.json();
        return {
            customers: data.customers || [],
            total: data.total || 0,
            pages: data.pages || 1,
        };
    } catch (error) {
        console.error("Error fetching customers for selector:", error);
        return {
            customers: getFallbackCustomers(),
            total: 5,
            pages: 1,
        };
    }
}

// Helper function for fallback customers
function getFallbackCustomers(): { id: string; name: string }[] {
    return [
        { id: "1", name: "John Doe (john@example.com)" },
        { id: "2", name: "Jane Smith (jane@example.com)" },
        { id: "3", name: "Michael Johnson (michael@example.com)" },
        { id: "4", name: "Emily Davis (emily@example.com)" },
        { id: "5", name: "Robert Brown (robert@example.com)" },
    ];
}

/**
 * Get all discounts
 * @returns Promise with array of discounts
 */
export async function fetchDiscounts(): Promise<Discount[]> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/discounts/admin`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to fetch discounts: ${response.status}`,
            );
        }

        const data = await response.json();
        return data.discounts || [];
    } catch (error) {
        console.error("Error fetching discounts:", error);
        throw error;
    }
}

/**
 * Create new discount
 * @param discountData Discount data
 * @returns Promise with created discount
 */
export async function createDiscount(
    discountData: DiscountInput,
): Promise<Discount> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Create a new object with numeric values properly converted
        const processedData = {
            ...discountData,
            // Ensure discountAmount is a number
            discountAmount: Number(discountData.discountAmount),
        };

        const response = await fetch(`${API_URL}/discounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(processedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to create discount: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating discount:", error);
        throw error;
    }
}

/**
 * Update existing discount
 * @param id Discount ID
 * @param discountData Updated discount data
 * @returns Promise with updated discount
 */
export async function updateDiscount(
    id: number,
    discountData: DiscountInput,
): Promise<Discount> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Create a new object with numeric values properly converted
        const processedData = {
            ...discountData,
            // Ensure discountAmount is a number if it exists
            discountAmount:
                discountData.discountAmount !== undefined
                    ? Number(discountData.discountAmount)
                    : undefined,
        };

        const response = await fetch(`${API_URL}/discounts/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(processedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to update discount: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating discount:", error);
        throw error;
    }
}

/**
 * Delete discount
 * @param id Discount ID
 * @returns Promise with success message
 */
export async function deleteDiscount(
    id: number,
): Promise<{ success: boolean; message: string }> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/discounts/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to delete discount: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting discount:", error);
        throw error;
    }
}

/**
 * Get discount statistics
 * @returns Promise with discount usage statistics
 */
export async function fetchDiscountStatistics(): Promise<{
    totalUsage: number;
    totalSavings: number;
    mostUsedDiscounts: { discountCode: string; usageCount: number }[];
}> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/discounts/statistics`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message ||
                    `Failed to fetch discount statistics: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching discount statistics:", error);
        throw error;
    }
}

// Update fetchAutomaticDiscounts to accept product prices
export async function fetchAutomaticDiscounts(options: {
    productIds?: string[];
    categoryNames?: string[];
    customerId?: string;
    isFirstPurchase?: boolean;
    orderAmount: number;
    productPrices?: Record<string, number>; // Add product prices
}): Promise<Discount[]> {
    try {
        const response = await fetch(`${API_URL}/discounts/automatic`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            console.warn(
                `API error: Failed to fetch automatic discounts: ${response.status}`,
            );
            return [];
        }

        const data = await response.json();
        return data.discounts || [];
    } catch (error) {
        console.error("Error fetching automatic discounts:", error);
        return [];
    }
}

// Update validateDiscount to accept productPrices for better targeting
export async function validateDiscount(
    code: string,
    orderAmount: number,
    productIds?: string[],
    productPrices?: Record<string, number>,
): Promise<{
    valid: boolean;
    discount?: Discount;
    discountAmount?: number;
    automaticDiscounts?: Discount[];
    automaticDiscountAmount?: number;
    totalDiscountAmount?: number;
    errorMessage?: string;
}> {
    try {
        const response = await fetch(`${API_URL}/discounts/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                orderAmount,
                productIds,
                productPrices, // Add this to help with per-product discount calculation
            }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to validate discount");
        }
        return await response.json();
    } catch (error) {
        console.error("Error validating discount:", error);
        throw error;
    }
}
