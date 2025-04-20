"use client";

import { useState, useRef, useEffect } from "react";
import ChatInput from "@/components/chatbot/ChatInput";
import ChatMessage from "@/components/chatbot/ChatMessage";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useFooter } from "@/contexts/FooterContext";
import { sendMessage as sendChatbotMessage } from "@/api/chatbot";

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
    const [isLoading, setIsLoading] = useState(false);
    const [isOverlappingFooter, setIsOverlappingFooter] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { footerRef } = useFooter();

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Detect overlap with footer
    useEffect(() => {
        if (!buttonRef.current || !footerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsOverlappingFooter(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1,
            },
        );

        observer.observe(footerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [footerRef]);

    // Add welcome message when chat is first opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    type: "text",
                    data: {
                        text: "Xin chào! Tôi là trợ lý ảo, tôi có thể giúp bạn tìm kiếm thông tin hoặc đề xuất cấu hình PC. Hãy cho tôi biết bạn cần hỗ trợ gì nhé!",
                    },
                    sender: "bot",
                },
            ]);
        }
    }, [isOpen]);

    const sendMessage = async (message: string) => {
        setMessages((prev) => [
            ...prev,
            {
                type: "text",
                data: { text: message },
                sender: "user",
            },
        ]);

        setIsLoading(true);
        try {
            const response = await sendChatbotMessage(message);
            setMessages((prev) => [
                ...prev,
                {
                    type: response.response.type || "text",
                    data: response.response.data,
                    sender: "bot",
                },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "text",
                    data: {
                        text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
                    },
                    sender: "bot",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const streamFaq = async (message: string) => {
        setMessages((prev) => [
            ...prev,
            { type: "faq", data: { text: "" }, sender: "bot" },
        ]);
        const response = await fetch(
            `http://localhost:3001/faq-stream?user_message=${encodeURIComponent(message)}`,
        );
        const reader = response.body?.getReader();
        let partial = "";
        while (true) {
            const { done, value } = (await reader?.read()) || {};
            if (done) break;
            partial += new TextDecoder().decode(value);
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].data.text = partial;
                return newMessages;
            });
        }
    };

    const toggleChatbot = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            {/* Floating Chatbot Button */}
            {!isOpen && (
                <button
                    ref={buttonRef}
                    onClick={toggleChatbot}
                    className={`fixed bottom-5 right-5 ${isOverlappingFooter ? "bg-secondary" : "bg-primary"} text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-110 focus:outline-none z-50`}
                    type="button"
                    aria-label="Open chatbot"
                >
                    <ChatBubbleIcon className="w-6 h-6" />
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div
                    className={`fixed ${
                        isFullscreen
                            ? "inset-0"
                            : "bottom-5 right-5 w-80 md:w-96 h-[500px]"
                    } bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col transition-all duration-300 z-50`}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gradient-to-r from-primary to-secondary rounded-t-xl">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <ChatBubbleIcon className="w-5 h-5 mr-2" />
                            Chatbot Hỗ Trợ
                        </h3>
                        <div className="flex gap-2">
                            {/* Toggle Fullscreen Button */}
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                                aria-label={
                                    isFullscreen ? "Thu nhỏ" : "Toàn màn hình"
                                }
                            >
                                {isFullscreen ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
                                    </svg>
                                )}
                            </button>
                            {/* Close Button */}
                            <button
                                onClick={toggleChatbot}
                                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                                aria-label="Close chatbot"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
                    >
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}

                        {isLoading && (
                            <div className="flex items-center space-x-2 text-gray-500">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
                                        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
                                    </svg>
                                </div>
                                <div className="flex space-x-1">
                                    <div
                                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <ChatInput onSend={sendMessage} />
                </div>
            )}
        </>
    );
}
