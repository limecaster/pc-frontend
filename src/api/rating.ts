import { API_URL } from "@/config/constants";

export interface RatingCommentSubmit {
    productId: string;
    stars: number;
    comment: string;
}

export interface RatingComment {
    id: number;
    username: string;
    rating: number;
    date: string;
    content: string;
    avatar?: string;
    customerId?: number;
}

// Submit a new rating and comment
export const submitRating = async (rating: RatingCommentSubmit) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rating),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit rating");
    }

    return await response.json();
};

// Get all ratings for a product
export const getProductRatings = async (productId: string): Promise<RatingComment[]> => {
    const response = await fetch(`${API_URL}/ratings/product/${productId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch ratings");
    }

    return await response.json();
};

// Delete a rating (requires authentication)
export const deleteRating = async (ratingId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/ratings/${ratingId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete rating");
    }
};

// Check if the current user has already rated this product
export const hasUserRatedProduct = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem("token");

    if (!token) {
        return false; // Not logged in, so definitely hasn't rated
    }

    try {
        const response = await fetch(`${API_URL}/ratings/check/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.hasRated;
    } catch (error) {
        console.error("Error checking user rating status:", error);
        return false;
    }
};
