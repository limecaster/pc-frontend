"use client";

import React, { useState, useEffect } from "react";
import { fetchAllFAQ, answerFAQ, FAQ } from "@/api/staff-faq";
import { toast } from "react-hot-toast";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function FAQManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            const data = await fetchAllFAQ();
            setFaqs(data);
        } catch (error) {
            toast.error("Không thể tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFaq || !answer.trim()) return;

        try {
            await answerFAQ(selectedFaq.id, answer);
            toast.success("Đã gửi câu trả lời thành công");
            setSelectedFaq(null);
            setAnswer("");
            loadFAQs();
        } catch (error) {
            toast.error("Không thể gửi câu trả lời");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Quản lý câu hỏi FAQ
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FAQ List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Danh sách câu hỏi
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className={`p-4 rounded-lg border ${
                                    faq.status === "pending"
                                        ? "border-yellow-200 bg-yellow-50"
                                        : "border-green-200 bg-green-50"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-800">
                                            {faq.subject}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {faq.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Từ: {faq.name} ({faq.email})
                                        </p>
                                    </div>
                                    {faq.status === "pending" && (
                                        <button
                                            onClick={() => setSelectedFaq(faq)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Trả lời
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Answer Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {selectedFaq
                            ? "Trả lời câu hỏi"
                            : "Chọn một câu hỏi để trả lời"}
                    </h2>
                    {selectedFaq && (
                        <form
                            onSubmit={handleAnswerSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Câu hỏi
                                </label>
                                <p className="text-gray-600">
                                    {selectedFaq.message}
                                </p>
                            </div>
                            <div>
                                <label
                                    htmlFor="answer"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Câu trả lời
                                </label>
                                <textarea
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFaq(null);
                                        setAnswer("");
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Gửi câu trả lời
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
