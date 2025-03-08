import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Account API calls
export const getProfile = async () => {
    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return response.json();
};

export const updateProfile = async (profileData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
};

export const changePassword = async (passwordData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
    }

    return true;
};

export const getAddresses = async () => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch addresses");
    }

    return response.json();
};

export const addAddress = async (addressData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add address");
    }

    return response.json();
};

export const updateAddress = async (id: any, addressData: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update address");
    }

    return response.json();
};

export const deleteAddress = async (id: any) => {
    const response = await fetch(`${API_URL}/dashboard/account/addresses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete address");
    }

    return true;
};

// Overview API calls
export const getDashboardOverview = async () => {
    const response = await fetch(`${API_URL}/dashboard/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard overview");
    }

    return response.json();
};
