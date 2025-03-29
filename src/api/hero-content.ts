import { API_URL } from "@/config/constants";
import { ContentSection, ContentType } from "./cms";

// Interface for Hero Banner content
export interface HeroBanner {
    id: number;
    contentKey: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    displayOrder: number;
}

/**
 * Fetch all hero banners from CMS
 */
export async function getHeroBanners(): Promise<HeroBanner[]> {
    try {
        // Fetch hero banners from CMS API with proper filtering
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.HERO_BANNER}&section=${ContentSection.HOME}&status=active`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching hero banners: ${response.status}`);
        }

        const data = await response.json();
        return data.sort(
            (a: HeroBanner, b: HeroBanner) => a.displayOrder - b.displayOrder,
        );
    } catch (error) {
        console.error("Error fetching hero banners:", error);
        // Return empty array in case of error
        return [];
    }
}

/**
 * Fetch promotional banners for the sidebar
 */
export async function getPromoBanners(): Promise<HeroBanner[]> {
    try {
        // Fetch promo banners from CMS API
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.PROMO_BANNER}&section=${ContentSection.HOME}&status=active`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching promo banners: ${response.status}`);
        }

        const data = await response.json();
        return data.sort(
            (a: HeroBanner, b: HeroBanner) => a.displayOrder - b.displayOrder,
        );
    } catch (error) {
        console.error("Error fetching promo banners:", error);
        // Return empty array in case of error
        return [];
    }
}
