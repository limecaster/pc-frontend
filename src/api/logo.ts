import { API_URL } from "@/config/constants";
import { ContentSection, ContentType, ContentStatus } from "./cms";

export interface LogoContent {
    id: number;
    contentKey: string;
    title?: string;
    imageUrl: string;
    link?: string;
}

/**
 * Fetch the website logo for a specific section (header, footer, etc.)
 */
export async function getLogo(
    section: ContentSection,
): Promise<LogoContent | null> {
    try {
        // Fetch logo from CMS API with proper filtering
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.LOGO}&section=${section}&status=${ContentStatus.ACTIVE}`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching logo: ${response.status}`);
        }

        const data = await response.json();

        // Return the first active logo for this section
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error(`Error fetching ${section} logo:`, error);
        return null;
    }
}

/**
 * Fetch the website favicon
 */
export async function getFavicon(): Promise<LogoContent | null> {
    try {
        // Fetch favicon with contentKey = 'favicon'
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.LOGO}&contentKey=favicon&status=${ContentStatus.ACTIVE}`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching favicon: ${response.status}`);
        }

        const data = await response.json();
        // Return the favicon if found
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error(`Error fetching favicon:`, error);
        return null;
    }
}
