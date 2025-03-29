import { API_URL } from "@/config/constants";
import { ContentSection, ContentType, ContentStatus } from "./cms";

export interface BrandContent {
    id: number;
    contentKey: string;
    title: string; // Brand name
    imageUrl: string; // Brand logo
    link: string; // Link to products filtered by brand
    displayOrder: number;
}

/**
 * Fetch all brands from CMS
 */
export async function getBrands(): Promise<BrandContent[]> {
    try {
        // Fetch brands from CMS API with proper filtering
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.BRAND}&section=${ContentSection.HOME}&status=${ContentStatus.ACTIVE}`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching brands: ${response.status}`);
        }

        const data = await response.json();
        return data.sort(
            (a: BrandContent, b: BrandContent) =>
                a.displayOrder - b.displayOrder,
        );
    } catch (error) {
        console.error("Error fetching brands:", error);
        // Return empty array in case of error
        return [];
    }
}
