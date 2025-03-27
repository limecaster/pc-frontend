import { API_URL } from "@/config/constants";

export interface Component {
    name: string;
    price: number;
    benchmarkScore?: number;
    image?: string;
    id?: string;
    partId?: string | string[]; // Add partId property
    details?: any; // Add details property
    type?: string; // Add type property
    storageType?: string; // Add storageType property
    formFactor?: string; // Add form factor property
    interface?: string; // Add interface property
    fullDiskWriteThroughput?: number; // Add write throughput
    writeSpeed?: number; // Add write speed
    readSpeed?: number; // Add read speed
}

export interface PCConfiguration {
    CPU: Component;
    CPUCooler: Component;
    Motherboard: Component;
    GraphicsCard: Component;
    RAM: Component;
    InternalHardDrive: Component;
    Case: Component;
    PowerSupply: Component;
    SSD?: Component; // Add SSD as optional property
    HDD?: Component; // Add HDD as optional property
    [key: string]: Component | undefined; // Allow string indexing
}

export interface AutoBuildResponse {
    saving?: PCConfiguration[];
    performance?: PCConfiguration[];
    popular?: PCConfiguration[];
}

/**
 * Submits a user's requirements for auto PC building and returns configuration suggestions
 */
export async function getAutoBuildSuggestions(
    userInput: string,
): Promise<AutoBuildResponse> {
    try {
        const response = await fetch(`${API_URL}/build/auto-build`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput }),
        });

        if (!response.ok) {
            throw new Error(
                `Error fetching auto build suggestions: ${response.statusText}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching auto build suggestions:", error);
        return {};
    }
}
