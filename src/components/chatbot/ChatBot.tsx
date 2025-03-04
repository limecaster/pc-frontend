"use client";

import { useState, useRef, useEffect } from "react";
import ChatInput from "@/components/chatbot/ChatInput";
import ChatMessage from "@/components/chatbot/ChatMessage";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

export default function Chatbot() {
    const [messages, setMessages] = useState<
        {
            type: string;
            data: { text: string };
            sender: string;
        }[]
    >([]);

    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (message: string) => {
        setMessages((prev) => [
            ...prev,
            {
                type: 'text',
                data: { text: message },
                sender: 'user',
            },
        ]);

        try {
            const response = await fetch('http://localhost:3001/chatbot/client-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                 }),
            });
            const data = await response.json();
            const responseData = data.response.data;
            console.log(responseData);
            setMessages((prev) => [
                ...prev,
                {
                    type: data.response.type || 'text',
                    data: data.response.data,
                    sender: 'bot',
                },
            ]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const streamFaq = async (message: string) => {
        setMessages((prev) => [...prev, { type: 'faq', data: { text: '' }, sender: 'bot' }]);
        const response = await fetch(`http://localhost:3001/faq-stream?user_message=${encodeURIComponent(message)}`);
        const reader = response.body?.getReader();
        let partial = '';
        while (true) {
            const { done, value } = await reader?.read() || {};
            if (done) break;
            partial += new TextDecoder().decode(value);
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].data.text = partial;
                return newMessages;
            });
        }
    };

    return (
        <>
            {/* Floating Chatbot Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 bg-secondary text-white p-3 rounded-full shadow-lg"
                    type="button"
                >
                    <ChatBubbleIcon className="w-6 h-6" />
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div
                    className={`fixed ${
                        isFullscreen ? "inset-0" : "bottom-16 right-5 w-96 h-[500px]"
                    } bg-white dark:bg-gray-800 shadow-lg border border-gray-300 rounded-lg flex flex-col`}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Chatbot Hỗ Trợ
                        </h3>
                        <div className="flex gap-2">
                            {/* Toggle Fullscreen Button */}
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {isFullscreen ? "⤢ Thu nhỏ" : "⤢ Toàn màn hình"}
                            </button>
                            {/* Close Button */}
                            <button onClick={() => setIsOpen(false)} className="text-red-500">
                                ✖
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto space-y-2 p-2"
                    >
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                    </div>

                    {/* Chat Input */}
                    <ChatInput onSend={sendMessage} />
                </div>
            )}
        </>
    );
}
