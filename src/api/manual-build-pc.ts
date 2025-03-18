import { API_URL } from "@/config/constants";

interface SelectedPart {
    name: string;
    label: string;
}

interface CompatiblePartsResponse {
    items: any[];
    totalPages: number;
    currentPage: number;
}

/**
 * Fetches compatible parts for a specific category in manual PC building
 */
export async function getCompatibleParts(
    targetLabel: string,
    selectedParts: SelectedPart[],
    page: number = 1,
    limit: number = 10,
): Promise<CompatiblePartsResponse> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("targetLabel", targetLabel);
        queryParams.append("selectedParts", JSON.stringify(selectedParts));
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());

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
        };
    } catch (error) {
        console.error("Error fetching compatible parts:", error);
        return {
            items: [],
            totalPages: 1,
            currentPage: page,
        };
    }
}
