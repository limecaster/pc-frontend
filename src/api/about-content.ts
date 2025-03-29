import { API_URL } from "@/config/constants";
import { ContentSection, ContentType, ContentStatus } from "./cms";

export interface AboutImage {
    id: number;
    contentKey: string;
    title?: string;
    description?: string;
    imageUrl: string;
}

/**
 * Fetch the about page main image from CMS
 */
export async function getAboutPageImage(): Promise<AboutImage | null> {
    try {
        // Fetch about image from CMS API with proper filtering
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.ABOUT_IMAGE}&section=${ContentSection.ABOUT}&status=${ContentStatus.ACTIVE}`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching about image: ${response.status}`);
        }

        const data = await response.json();

        // Return the first active about image
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Error fetching about page image:", error);
        return null;
    }
}
