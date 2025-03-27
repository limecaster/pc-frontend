import { API_URL } from "@/config/constants";
import { getAuthHeaders } from "./auth";

/**
 * Interface for a PC configuration product
 */
export interface PCConfigurationProduct {
    componentType: string; // Component type (CPU, RAM, etc.)
    productId: string;
    category?: string;
    name?: string;
    price?: number;
    details?: any;
}

/**
 * Interface for the PC configuration data
 */
export interface PCConfiguration {
    id?: string;
    name: string;
    purpose: string;
    products: PCConfigurationProduct[]; // Now an array of products
    totalPrice: number;
    wattage?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Standard mapping between component types in different languages and formats
 */
export const COMPONENT_TYPE_MAPPING: Record<string, string> = {
    // English standard names
    CPU: "CPU",
    CPUCooler: "CPUCooler",
    "CPU Cooler": "CPUCooler",
    Motherboard: "Motherboard",
    RAM: "RAM",
    Memory: "RAM",
    GraphicsCard: "GraphicsCard",
    "Graphics Card": "GraphicsCard",
    GPU: "GraphicsCard",
    InternalHardDrive: "InternalHardDrive",
    Storage: "InternalHardDrive",
    SSD: "SSD",
    HDD: "HDD",
    Case: "Case",
    PowerSupply: "PowerSupply",
    "Power Supply": "PowerSupply",
    PSU: "PowerSupply",

    // Vietnamese names
    "Bo mạch chủ": "Motherboard",
    "Quạt tản nhiệt": "CPUCooler",
    "Card đồ họa": "GraphicsCard",
    "Bộ nhớ": "RAM",
    "Lưu trữ": "InternalHardDrive",
    "Ổ cứng": "InternalHardDrive",
    "Ổ SSD": "InternalHardDrive",
    "Vỏ case": "Case",
    Nguồn: "PowerSupply",
    "Nguồn máy tính": "PowerSupply",
    "Màn hình": "Monitor",
    "Bàn phím": "Keyboard",
    Chuột: "Mouse",
    "Card mạng không dây": "WiFiCard",
    "Card mạng có dây": "WiredNetworkCard",
    "Kem tản nhiệt": "ThermalPaste",
};

/**
 * Standardize component type to a consistent format
 */
export function standardizeComponentType(type: string): string {
    if (!type) return ""; // Handle null/undefined

    // Special case for SSD/HDD - for consistency with backend
    if (type === "SSD" || type === "HDD") {
        return "InternalHardDrive";
    }

    return COMPONENT_TYPE_MAPPING[type] || type;
}

/**
 * Get the specific storage type (SSD or HDD) from component type
 */
export function getStorageType(componentType: string): string | null {
    if (componentType === "SSD") return "SSD";
    if (componentType === "HDD") return "HDD";
    return null;
}

/**
 * Convert products object to the array format expected by the API
 */
export function formatProductsForApi(
    productsObj: Record<string, any>,
): PCConfigurationProduct[] {
    if (!productsObj) return [];

    // First create the array with possible nulls, then filter out nulls
    const productsArray = Object.entries(productsObj).map(
        ([componentType, product]) => {
            // Skip invalid products
            if (!product || !product.id) {
                console.warn(
                    `Skipping invalid product for component type: ${componentType}`,
                );
                return null;
            }

            // Standardize component type
            const standardType = standardizeComponentType(componentType);

            // For SSD/HDD, ensure the type property is set correctly
            let details = { ...(product.details || {}) };

            // Explicitly store the storage type for SSD/HDD
            if (componentType === "SSD") {
                details.type = "SSD";
                details.storageType = "SSD";
            } else if (componentType === "HDD") {
                details.type = "HDD";
                details.storageType = "HDD";
            }

            // Add original type for reference
            details.originalType = componentType;
            details.originalComponentType = componentType;

            // Ensure price is a number - add detailed logging
            let price = 0;
            if (product.price !== undefined && product.price !== null) {
                console.log(
                    `[${componentType}] Original price: "${product.price}" (${typeof product.price})`,
                );

                // Convert to number if it's a string
                if (typeof product.price === "string") {
                    const cleanPrice = product.price.replace(/,/g, "");
                    price = parseFloat(cleanPrice);
                    console.log(
                        `[${componentType}] Cleaned string price: "${cleanPrice}" → ${price}`,
                    );
                } else {
                    price = Number(product.price);
                    console.log(
                        `[${componentType}] Converted number price: ${price}`,
                    );
                }

                // If conversion resulted in NaN, default to 0
                if (isNaN(price)) {
                    console.log(
                        `[${componentType}] Price is NaN, defaulting to 0`,
                    );
                    price = 0;
                }
            } else {
                console.log(
                    `[${componentType}] No price found, defaulting to 0`,
                );
            }

            return {
                componentType: standardType, // Use standardized type name
                productId: product.id,
                category: product.category || standardType, // Use standardized type as fallback
                name: product.name || "",
                price: price, // Now ensures it's a number
                details: {
                    ...details,
                    // Include other common properties that might be useful
                    brand: product.brand,
                    model: product.model,
                    tdp: product.tdp,
                    imageUrl: product.imageUrl || product.image,
                },
            } as PCConfigurationProduct;
        },
    );

    // Log the final products array for debugging
    console.log(
        "Final products array before filtering nulls:",
        productsArray.map((p) =>
            p ? `${p.componentType}: ${p.name} (price: ${p.price})` : "null",
        ),
    );

    // Fix the type predicate by using a type guard function instead
    return productsArray.filter(
        (item): item is PCConfigurationProduct => item !== null,
    );
}

/**
 * Convert products array from API to object format used by the frontend
 */
export function formatProductsForFrontend(
    productsArray: PCConfigurationProduct[],
): Record<string, any> {
    console.log(
        "[formatProductsForFrontend] Processing products:",
        productsArray,
    );
    const productsObj: Record<string, any> = {};

    productsArray.forEach((product) => {
        // Get original component type if available
        const originalType =
            product.details?.originalType ||
            product.details?.originalComponentType ||
            product.componentType;

        // Special handling for storage devices - look for these in ascending order of priority
        let storageType = null;

        // 1. Check special property storageType
        if (product.componentType === "InternalHardDrive") {
            // 2. Check details.type
            if (
                product.details?.storageType === "SSD" ||
                product.details?.type === "SSD"
            ) {
                storageType = "SSD";
            } else if (
                product.details?.storageType === "HDD" ||
                product.details?.type === "HDD"
            ) {
                storageType = "HDD";
            }
            // 3. Check product name for common SSD patterns
            else if (
                product.name &&
                (product.name.includes("SSD") ||
                    product.name.includes("Solid State") ||
                    /NVMe|M\.2/.test(product.name))
            ) {
                storageType = "SSD";
            }
            // 4. Default fallback - if it has no identified type, assume HDD
            else {
                storageType = "HDD";
            }

            console.log(
                `[formatProductsForFrontend] Identified storage '${product.name}' as ${storageType}`,
            );
        }

        // Set the component key based on our detection
        const componentKey = storageType || product.componentType;

        // Use the determined component key
        productsObj[componentKey] = {
            id: product.productId,
            category: product.category || componentKey,
            name: product.name,
            price: product.price,
            componentType: originalType,
            // Add storage type to the object for consistency
            type: storageType || product.details?.type,
            storageType: storageType || product.details?.storageType,
            ...(product.details || {}),
        };
    });

    console.log(
        "[formatProductsForFrontend] Processed components:",
        Object.keys(productsObj),
    );
    return productsObj;
}

/**
 * Save a PC configuration to the server
 * @param config The configuration to save
 * @returns The saved configuration with id
 */
export async function saveConfiguration(
    config: PCConfiguration | Record<string, any>,
): Promise<PCConfiguration> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Get headers for authentication
        const headers = await getAuthHeaders();

        // Determine if this is an update (strict check - only true for valid id strings)
        const isUpdate =
            typeof config.id === "string" && config.id.trim() !== "";
        const method = isUpdate ? "PUT" : "POST";
        const url = isUpdate
            ? `${API_URL}/pc-configurations/${config.id}`
            : `${API_URL}/pc-configurations`;

        // Create a copy of the config
        const requestData = { ...config };
        delete requestData.id; // Remove ID from body for both POST and PUT requests

        // Convert products object to array format if it's an object
        if (requestData.products && !Array.isArray(requestData.products)) {
            requestData.products = formatProductsForApi(requestData.products);
        }

        console.log(`Operation type: ${isUpdate ? "UPDATE" : "CREATE"}`);
        console.log(
            "Saving configuration with data:",
            JSON.stringify(requestData),
        );

        const response = await fetch(url, {
            method,
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response body:", errorText);

            let errorMessage = `Failed to save configuration: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (parseError) {
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            throw new Error(errorMessage);
        }

        const savedConfig = await response.json();

        // Convert products array back to object format for frontend use
        if (savedConfig.products && Array.isArray(savedConfig.products)) {
            savedConfig.products = formatProductsForFrontend(
                savedConfig.products,
            );
        }

        return savedConfig;
    } catch (error) {
        console.error("Error saving PC configuration:", error);
        throw error;
    }
}

/**
 * Get all PC configurations for the current user
 * @returns Array of PC configurations
 */
export async function getAllConfigurations(): Promise<PCConfiguration[]> {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/pc-configurations`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get configurations: ${response.status}`);
        }

        const configurations = await response.json();

        // Convert products array to object format for each configuration
        return configurations.map((config: any) => ({
            ...config,
            products: config.products
                ? formatProductsForFrontend(config.products)
                : {},
        }));
    } catch (error) {
        console.error("Error getting PC configurations:", error);
        throw error;
    }
}

/**
 * Get a specific PC configuration by ID
 * @param id The configuration ID
 * @returns The configuration or null if not found
 */
export async function getConfiguration(
    id: string,
): Promise<PCConfiguration | null> {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/pc-configurations/${id}`, {
            headers,
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get configuration: ${response.status}`);
        }

        const config = await response.json();

        // Convert products array to object format
        if (config.products && Array.isArray(config.products)) {
            config.products = formatProductsForFrontend(config.products);
        }

        return config;
    } catch (error) {
        console.error(`Error getting PC configuration ${id}:`, error);
        throw error;
    }
}

/**
 * Delete a PC configuration
 * @param id The configuration ID to delete
 * @returns True if successful
 */
export async function deleteConfiguration(id: string): Promise<boolean> {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/pc-configurations/${id}`, {
            method: "DELETE",
            headers,
        });

        if (!response.ok) {
            throw new Error(
                `Failed to delete configuration: ${response.status}`,
            );
        }

        return true;
    } catch (error) {
        console.error(`Error deleting PC configuration ${id}:`, error);
        throw error;
    }
}

/**
 * Get all PC configurations for the current user
 * @returns Promise with the user's configurations
 */
export async function getUserConfigurations() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_URL}/pc-configuration/user`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `Server error: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting PC configurations:", error);
        throw error;
    }
}
