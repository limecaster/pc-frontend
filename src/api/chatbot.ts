import { trackChatbotSendMessage } from "./events";
import { getAuthHeaders } from "./auth";
import { API_URL } from "@/config/constants";
import { getSessionId } from "./events";

export const sendMessage = async (message: string) => {
    const headers = await getAuthHeaders();
    const sessionId = getSessionId();
    try {
        const response = await fetch(`${API_URL}/chatbot/client-chat`, {
            method: "POST",
            mode: "cors",
            headers,
            body: JSON.stringify({ message, sessionId }),
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
