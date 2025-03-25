import { API_URL } from "@/config/constants";

interface SelectedPart {
    name: string;
    label: string;
}

interface CompatiblePartsResponse {
    items: any[];
    totalPages: number;
    currentPage: number;
    totalItems?: number;
}

/**
 * Fetches compatible parts for a specific category in manual PC building
 */
export async function getCompatibleParts(
    targetLabel: string,
    selectedParts: SelectedPart[],
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    sortOption?: "name" | "price-asc" | "price-desc",
): Promise<CompatiblePartsResponse> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("targetLabel", targetLabel);
        queryParams.append("selectedParts", JSON.stringify(selectedParts));
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());

        // Add search term and sort option if provided
        if (searchTerm) {
            queryParams.append("search", searchTerm);
        }

        if (sortOption) {
            queryParams.append("sort", sortOption);
        }

        const response = await fetch(
            `${API_URL}/build/manual-build/compatible-parts?${queryParams.toString()}`,
        );

        if (!response.ok) {
            throw new Error(
                `Error fetching compatible parts: ${response.statusText}`,
            );
        }

        const data = await response.json();
        return {
            items: data.items || [],
            totalPages: data.totalPages || 1,
            currentPage: page,
            totalItems: data.totalItems || 0,
        };
    } catch (error) {
        console.error("Error fetching compatible parts:", error);
        return {
            items: [],
            totalPages: 1,
            currentPage: page,
            totalItems: 0,
        };
    }
}

/**
 * Fetches all compatible parts for a specific category in manual PC building
 * (for client-side pagination)
 */
export async function getAllCompatibleParts(
    targetLabel: string,
    selectedParts: SelectedPart[],
    searchTerm?: string,
    sortOption?: "name" | "price-asc" | "price-desc",
): Promise<{ items: any[]; totalItems: number }> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("targetLabel", targetLabel);
        queryParams.append("selectedParts", JSON.stringify(selectedParts));
        queryParams.append("page", "1");
        queryParams.append("limit", "1000"); // Set a high limit to get all items

        // Add search term and sort option if provided
        if (searchTerm) {
            queryParams.append("search", searchTerm);
        }

        if (sortOption) {
            queryParams.append("sort", sortOption);
        }

        const response = await fetch(
            `${API_URL}/build/manual-build/compatible-parts?${queryParams.toString()}`,
        );

        if (!response.ok) {
            throw new Error(
                `Error fetching compatible parts: ${response.statusText}`,
            );
        }

        const data = await response.json();
        return {
            items: data.items || [],
            totalItems: data.totalItems || data.items?.length || 0,
        };
    } catch (error) {
        console.error("Error fetching all compatible parts:", error);
        return {
            items: [],
            totalItems: 0,
        };
    }
}
