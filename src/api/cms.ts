import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = (includeContentType = true) => {
    const token = localStorage.getItem("token");
    return {
        ...(includeContentType && { "Content-Type": "application/json" }),
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Types for the CMS API
export enum ContentType {
    HERO_BANNER = "hero_banner",
    TEAM_MEMBER = "team_member",
    LOGO = "logo",
    PROMO_BANNER = "promo_banner",
    ABOUT_IMAGE = "about_image",
    BRAND = "brand_showcase",
}

export enum ContentSection {
    HOME = "home",
    ABOUT = "about",
    SUPPORT = "support",
    FOOTER = "footer",
    HEADER = "header",
}

export enum ContentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export interface CmsContent {
    id?: number;
    contentKey: string;
    contentType: ContentType;
    title?: string;
    description?: string;
    imageUrl?: string;
    cloudinaryPublicId?: string;
    link?: string;
    section: ContentSection;
    status: ContentStatus;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

// Get all CMS content with optional filtering
export async function getCmsContent(filters?: {
    contentType?: ContentType;
    section?: ContentSection;
    status?: ContentStatus;
}) {
    try {
        let url = `${API_URL}/cms`;

        if (filters) {
            const params = new URLSearchParams();
            if (filters.contentType)
                params.append("contentType", filters.contentType);
            if (filters.section) params.append("section", filters.section);
            if (filters.status) params.append("status", filters.status);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching CMS content:", error);
        throw error;
    }
}

// Get a single CMS content item by ID
export async function getCmsContentById(id: number) {
    try {
        const response = await fetch(`${API_URL}/cms/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching CMS content ${id}:`, error);
        throw error;
    }
}

// Get a single CMS content item by key
export async function getCmsContentByKey(key: string) {
    try {
        const response = await fetch(`${API_URL}/cms/key/${key}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching CMS content by key ${key}:`, error);
        throw error;
    }
}

// Create a new CMS content item
export async function createCmsContent(contentData: Partial<CmsContent>) {
    try {
        const response = await fetch(`${API_URL}/cms`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(contentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating CMS content:", error);
        throw error;
    }
}

// Update an existing CMS content item
export async function updateCmsContent(
    id: number,
    contentData: Partial<CmsContent>,
) {
    try {
        const response = await fetch(`${API_URL}/cms/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(contentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating CMS content ${id}:`, error);
        throw error;
    }
}

// Delete a CMS content item
export async function deleteCmsContent(id: number) {
    try {
        const response = await fetch(`${API_URL}/cms/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deleting CMS content ${id}:`, error);
        throw error;
    }
}

// Upload an image for CMS content
export async function uploadCmsImage(file: File, folder: string = "cms") {
    try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
            `${API_URL}/cms/upload-image?folder=${folder}`,
            {
                method: "POST",
                headers: getAuthHeaders(false), // Don't include Content-Type as it's FormData
                body: formData,
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error uploading CMS image:", error);
        throw error;
    }
}

// Get content types, sections, and statuses for dropdowns
// Modify these functions to return enums directly instead of fetching from API
export async function getContentTypes() {
    // Skip API call and return local enum values directly
    return Promise.resolve(Object.values(ContentType));
}

export async function getContentSections() {
    // Skip API call and return local enum values directly
    return Promise.resolve(Object.values(ContentSection));
}

export async function getContentStatuses() {
    // Skip API call and return local enum values directly
    return Promise.resolve(Object.values(ContentStatus));
}
