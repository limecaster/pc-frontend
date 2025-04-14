import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    categoryId: number;
    category?: {
        id: number;
        name: string;
    };
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch all products with pagination and filtering
 */
export async function fetchAllProducts({
    page = 1,
    limit = 10,
    search = "",
    categoryId = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "DESC",
}: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    status?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
} = {}) {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        if (status) params.append("status", status);
        if (search) params.append("search", search);
        if (categoryId) params.append("categoryId", categoryId.toString());

        const response = await fetch(
            `${API_URL}/products/admin/all?${params.toString()}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();

        return {
            products: data.products || [],
            total: data.total || 0,
            pages: data.pages || 1,
            currentPage: data.currentPage || page,
        };
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
}

/**
 * Fetch product by ID
 */
export async function fetchProductById(id: string) {
    try {
        const response = await fetch(`${API_URL}/products/admin/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
}

/**
 * Create a new product
 */
export async function createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
) {
    try {
        const response = await fetch(`${API_URL}/products/admin`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: Partial<Product>) {
    try {
        const response = await fetch(`${API_URL}/products/admin/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
    try {
        const response = await fetch(`${API_URL}/products/admin/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return { success: true };
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
}

/**
 * Update product status (activate/deactivate)
 */
export async function updateProductStatus(
    id: string,
    status: "active" | "inactive",
) {
    try {
        const response = await fetch(`${API_URL}/products/admin/${id}/status`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error(`Error updating product ${id} status:`, error);
        throw error;
    }
}

/**
 * Fetch product categories
 */
export async function fetchProductCategories() {
    try {
        // Use the working categories endpoint
        const response = await fetch(`${API_URL}/products/categories`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product categories:", error);
        throw error;
    }
}

/**
 * Upload product image
 */
export async function uploadProductImage(file: File) {
    try {
        const formData = new FormData();
        formData.append("image", file);

        const token = localStorage.getItem("token");
        // This endpoint should already be working
        const response = await fetch(`${API_URL}/products/upload-image`, {
            method: "POST",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error uploading product image:", error);
        throw error;
    }
}

/**
 * Create a new product category
 */
export async function createProductCategory(categoryName: string) {
    try {
        const response = await fetch(`${API_URL}/products/categories`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: categoryName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}

/**
 * Update a product category
 */
export async function updateProductCategory(oldName: string, newName: string) {
    try {
        const response = await fetch(
            `${API_URL}/products/categories/${encodeURIComponent(oldName)}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: newName }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

/**
 * Delete a product category
 */
export async function deleteProductCategory(categoryName: string) {
    try {
        const response = await fetch(
            `${API_URL}/products/categories/${encodeURIComponent(
                categoryName,
            )}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}

/**
 * Get product count by category
 */
export async function getProductCountByCategory() {
    try {
        const response = await fetch(`${API_URL}/products/categories/counts`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting category counts:", error);
        throw error;
    }
}

/**
 * Get a simple list of products (id, name only) for admin use
 * Used in dropdowns and selection interfaces
 */
export async function getSimpleProductList(
    search?: string,
    page: number = 1,
    limit: number = 100,
): Promise<{
    products: { id: string; name: string }[];
    total: number;
    pages: number;
}> {
    try {
        let url = `${API_URL}/products/admin/simple-list?page=${page}&limit=${limit}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching simple product list:", error);
        throw error;
    }
}

/**
 * Get category-specific specification fields
 * This will query Neo4j for the specification template based on product category
 */
export async function fetchCategorySpecificationTemplate(
    category: string,
): Promise<string[]> {
    try {
        if (!category) {
            return [];
        }

        // This endpoint returns all possible subcategory keys for a given category
        const response = await fetch(
            `${API_URL}/products/subcategory-keys/${encodeURIComponent(category)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        return data.keys || [];
    } catch (error) {
        console.error(
            `Error fetching specification template for ${category}:`,
            error,
        );
        return []; // Return empty array on error
    }
}

/**
 * Get specification values for a specific category and subcategory
 * This can be used for dropdown options for each specification field
 */
export async function fetchSubcategoryValues(
    category: string,
    subcategory: string,
): Promise<string[]> {
    try {
        if (!category || !subcategory) {
            return [];
        }

        const response = await fetch(
            `${API_URL}/products/subcategory-values/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(
            `Error fetching values for ${category}/${subcategory}:`,
            error,
        );
        return []; // Return empty array on error
    }
}
