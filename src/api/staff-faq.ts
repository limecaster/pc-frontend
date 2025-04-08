import axios from "axios";
import { getAuthToken } from "@/utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface FAQ {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "pending" | "answered";
    answer?: string;
    answered_by?: number;
    answered_at?: string;
    created_at: string;
    updated_at: string;
}

export const fetchAllFAQ = async (): Promise<FAQ[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/faq`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const answerFAQ = async (id: number, answer: string): Promise<void> => {
    const token = getAuthToken();
    await axios.post(
        `${API_URL}/faq/${id}/answer`,
        { answer },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};
