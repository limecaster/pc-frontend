import { API_URL } from "@/config/constants";
import { getAuthHeaders } from "./auth";
export interface PCConfigurationProduct {
    componentType: string; // Component type (CPU, RAM, etc.)
    productId: string;
    category?: string;
    name?: string;
    price?: number;
    details?: any;
}

export interface PCConfiguration {
    id?: string;
    name: string;
    purpose: string;
    products: PCConfigurationProduct[];
    totalPrice: number;
    wattage?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Standard mapping between component types in different languages and formats
 */
export const COMPONENT_TYPE_MAPPING: Record<string, string> = {
    // English standard names to Vietnamese
    CPU: "CPU",
    CPUCooler: "Quạt tản nhiệt",
    "CPU Cooler": "Quạt tản nhiệt",
    Motherboard: "Bo mạch chủ",
    RAM: "RAM",
    Memory: "RAM",
    GraphicsCard: "Card đồ họa",
    "Graphics Card": "Card đồ họa",
    GPU: "Card đồ họa",
    InternalHardDrive: "Ổ cứng",
    Storage: "Ổ cứng",
    SSD: "SSD",
    HDD: "HDD",
    Case: "Vỏ case",
    PowerSupply: "Nguồn",
    "Power Supply": "Nguồn",
    PSU: "Nguồn",

    // Vietnamese to English (the reverse mapping)
    "Bo mạch chủ": "Motherboard",
    "Quạt tản nhiệt": "CPUCooler",
    "Card đồ họa": "GraphicsCard",
    "Bộ nhớ": "RAM",
    "Ổ cứng": "InternalHardDrive",
    "Vỏ case": "Case",
    Nguồn: "PowerSupply",
};

/**
 * Standardize component type to a consistent format
 */
export function standardizeComponentType(type: string): string {
    if (!type) return "";

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

    const productsArray = Object.entries(productsObj).map(
        ([componentType, product]) => {
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

            let price = 0;
            if (product.price !== undefined && product.price !== null) {
                // Convert to number if it's a string
                if (typeof product.price === "string") {
                    const cleanPrice = product.price.replace(/,/g, "");
                    price = parseFloat(cleanPrice);
                } else {
                    price = Number(product.price);
                }

                // If conversion resulted in NaN, default to 0
                if (isNaN(price)) {
                    price = 0;
                }
            } else {
                console.warn(
                    `[${componentType}] No price found, defaulting to 0`,
                );
            }

            return {
                componentType: standardType,
                productId: product.id,
                category: product.category || standardType,
                name: product.name || "",
                price: price,
                details: {
                    ...details,
                    brand: product.brand,
                    model: product.model,
                    tdp: product.tdp,
                    imageUrl: product.imageUrl || product.image,
                },
            } as PCConfigurationProduct;
        },
    );

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
    const productsObj: Record<string, any> = {};

    // Make sure we use the exact Vietnamese keys expected by ManualBuildPC
    const expectedManualBuildKeys = [
        "CPU",
        "Quạt tản nhiệt",
        "Bo mạch chủ",
        "Card đồ họa",
        "RAM",
        "Vỏ case",
        "Nguồn",
        "SSD",
        "HDD",
        "CPUCooler",
        "Monitor",
        "Keyboard",
        "Mouse",
        "WiFiCard",
        "WiredNetworkCard",
        "ThermalPaste",
        "InternalHardDrive",
        "GraphicsCard",
        "PowerSupply",
        "Case",
        "Motherboard",
    ];

    productsArray.forEach((product) => {
        let componentKey =
            product.details?.originalComponentType || product.componentType;

        if (COMPONENT_TYPE_MAPPING[componentKey]) {
            componentKey = COMPONENT_TYPE_MAPPING[componentKey];
        }

        // Special handling for storage
        if (product.componentType === "InternalHardDrive") {
            // Determine if it's SSD or HDD
            const isSSD =
                product.details?.type === "SSD" ||
                product.details?.storageType === "SSD";

            componentKey = isSSD ? "SSD" : "HDD";
        }

        if (!expectedManualBuildKeys.includes(componentKey)) {
            console.warn(
                `Component key ${componentKey} is not in the expected list: ${expectedManualBuildKeys.join(", ")}`,
            );
        }

        productsObj[componentKey] = {
            id: product.productId,
            name: product.name,
            price: product.price,
            componentType: product.componentType,
            type: product.details?.type,
            storageType: product.details?.storageType,
            ...(product.details || {}),
        };
    });

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

        const headers = await getAuthHeaders();

        const isUpdate =
            typeof config.id === "string" && config.id.trim() !== "";
        const method = isUpdate ? "PUT" : "POST";
        const url = isUpdate
            ? `${API_URL}/pc-configurations/${config.id}`
            : `${API_URL}/pc-configurations`;

        const requestData = { ...config };
        delete requestData.id;

        if (requestData.products && !Array.isArray(requestData.products)) {
            requestData.products = formatProductsForApi(requestData.products);
        }

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
