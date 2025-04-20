import { trackChatbotSendMessage } from "./events";
import { getAuthHeaders } from "./auth";
import { API_URL } from "@/config/constants";

export const sendMessage = async (message: string) => {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/chatbot/client-chat`, {
            method: "POST",
            mode: "cors",
            headers,
            body: JSON.stringify({ message }),
        });
        if (!response.ok) {
            throw new Error("Failed to send message");
        }
        const data = await response.json();
        return data;    
    } catch (error) {
        console.error("Error:", error);
        throw error;
    } finally {
        await trackChatbotSendMessage(message);
    }
};