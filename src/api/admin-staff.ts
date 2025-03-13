import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

interface StaffData {
    id?: number;
    username?: string;
    email: string;
    password?: string;
    firstname: string;
    lastname: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
}

export async function fetchAllStaff(page = 1, limit = 10) {
    try {
        const response = await fetch(
            `${API_URL}/staff/all?page=${page}&limit=${limit}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching staff accounts:", error);
        throw error;
    }
}

export async function fetchStaffById(id: number) {
    try {
        const response = await fetch(`${API_URL}/staff/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching staff ${id}:`, error);
        throw error;
    }
}

export async function createStaff(staffData: StaffData) {
    try {
        const response = await fetch(`${API_URL}/staff`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(staffData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating staff account:", error);
        throw error;
    }
}

export async function updateStaff(id: number, staffData: StaffData) {
    try {
        const response = await fetch(`${API_URL}/staff/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(staffData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating staff ${id}:`, error);
        throw error;
    }
}

export async function deleteStaff(id: number) {
    try {
        const response = await fetch(`${API_URL}/staff/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deleting staff ${id}:`, error);
        throw error;
    }
}

export async function deactivateStaff(id: number) {
    try {
        const response = await fetch(`${API_URL}/staff/${id}/deactivate`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deactivating staff ${id}:`, error);
        throw error;
    }
}

export async function activateStaff(id: number) {
    try {
        const response = await fetch(`${API_URL}/staff/${id}/activate`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error activating staff ${id}:`, error);
        throw error;
    }
}
