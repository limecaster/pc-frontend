import { API_URL } from "@/config/constants";
import { getAuthHeaders } from "./auth";

export interface PCConfigurationProduct {
    [key: string]: any; // This will hold products by category
}

export interface PCConfiguration {
    id?: string;
    name: string;
    purpose?: string;
    products: PCConfigurationProduct;
    totalPrice?: number;
    wattage?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Save a PC configuration to the server
 * @param config The configuration to save
 * @returns The saved configuration with id
 */
export async function saveConfiguration(
    config: PCConfiguration,
): Promise<PCConfiguration> {
    try {
        const headers = await getAuthHeaders();

        // Determine if this is an update (strict check - only true for valid id strings)
        const isUpdate =
            typeof config.id === "string" && config.id.trim() !== "";
        const method = isUpdate ? "PUT" : "POST";
        const url = isUpdate
            ? `${API_URL}/pc-configurations/${config.id}`
            : `${API_URL}/pc-configurations`;

        // Create a copy of the config and ALWAYS remove the id property from the request body
        const requestData = { ...config };
        delete requestData.id; // Remove ID from body for both POST and PUT requests

        console.log(`Operation type: ${isUpdate ? "UPDATE" : "CREATE"}`);
        console.log(
            "Saving configuration with data:",
            JSON.stringify(requestData),
        );
        console.log("ID property exists in request:", "id" in requestData);

        const response = await fetch(url, {
            method,
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            // Try to get detailed error information
            const errorText = await response.text();
            console.error("Error response body:", errorText);

            let errorMessage = `Failed to save configuration: ${response.status}`;
            try {
                // Try to parse the error as JSON
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (parseError) {
                // If parsing fails, use the raw error text
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();
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

        return await response.json();
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

        return await response.json();
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
