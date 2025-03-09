import { API_URL } from "@/config/constants";

interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    birthday?: string;
    gender: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface AddressData {
    id?: number;
    fullName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault?: boolean; 
}

// Get user profile
export async function getProfile(): Promise<ProfileData> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch profile");
    }

    return response.json();
}

// Update user profile
export async function updateProfile(profileData: ProfileData): Promise<any> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    // Ensure gender is never empty - if undefined or empty, default to "male"
    console.log(profileData);
    if (!profileData.gender) {
        profileData.gender = "male";
    }

    const response = await fetch(`${API_URL}/dashboard/account/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
}

// Change password
export async function changePassword(passwordData: PasswordData): Promise<any> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
    }

    return response.json();
}

// Get all addresses
export async function getAddresses(): Promise<AddressData[]> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch addresses");
    }

    return response.json();
}

// Add a new address
export async function addAddress(addressData: AddressData): Promise<AddressData> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/addresses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add address");
    }

    return response.json();
}

// Update an address
export async function updateAddress(id: number, addressData: AddressData): Promise<AddressData> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/addresses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update address");
    }

    return response.json();
}

// Delete an address
export async function deleteAddress(id: number): Promise<any> {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/dashboard/account/addresses/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete address");
    }

    return response.json();
}
