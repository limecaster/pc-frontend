import { API_URL } from "@/config/constants";
import { fetchAllProducts } from "./product";

// Helper to include auth token in requests
const getAuthHeaders = (includeContentType = true) => {
    const token = localStorage.getItem("token");
    return {
        ...(includeContentType && { "Content-Type": "application/json" }),
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Define types for the API
interface ProductData {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    status: string;
    category: string;
    images: string[];
    specifications: Record<string, string>;
    thumbnail: string;
    [key: string]: string | string[] | number | Record<string, string>;
}

/**
 * Fetch products with pagination, filtering and sorting
 * For admin dashboard - fetches all products including inactive ones
 */
export async function fetchProducts(params: Record<string, any> = {}) {
    try {
        const page = params["page"] || 1;
        const limit = params["limit"] || 10;
        const sortBy = params["sortField"] || "createdAt";
        const sortOrder = params["sortOrder"]?.toUpperCase() || "DESC";

        // Use the admin endpoint that shows all products including inactive ones
        const queryString = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
        }).toString();

        const response = await fetch(
            `${API_URL}/products/admin/all?${queryString}`,
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
            currentPage: data.page || 1,
            totalPages: data.pages || 1,
            totalItems: data.total || 0,
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

/**
 * Fetch a single product by ID for admin editing
 */
export async function fetchProductById(id: string) {
    try {
        // Use the admin-specific endpoint that returns all product data regardless of status
        const response = await fetch(`${API_URL}/products/admin/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Product with ID ${id} not found`);
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
}

/**
 * Create a new product
 */
export async function createProduct(productData: ProductData) {
    try {
        // Update endpoint from /admin/products to /products
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: ProductData) {
    try {
        // Update endpoint from /admin/products to /products
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
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
        // Update endpoint from /admin/products to /products
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
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
