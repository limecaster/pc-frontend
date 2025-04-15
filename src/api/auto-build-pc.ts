import { API_URL } from "@/config/constants";

export interface Component {
    name: string;
    price: number;
    benchmarkScore?: number;
    image?: string;
    id?: string;
    partId?: string | string[];
    details?: any;
    type?: string;
    storageType?: string;
    formFactor?: string;
    interface?: string;
    fullDiskWriteThroughput?: number;
    writeSpeed?: number;
    readSpeed?: number;
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
    SSD?: Component;
    HDD?: Component;
    [key: string]: Component | undefined;
}

export interface AutoBuildResponse {
    saving?: PCConfiguration[];
    performance?: PCConfiguration[];
    popular?: PCConfiguration[];
}

export async function getAutoBuildSuggestions(
    userInput: string,
    userId?: string,
): Promise<AutoBuildResponse> {
    try {
        const response = await fetch(`${API_URL}/build/auto-build`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput, userId }),
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
