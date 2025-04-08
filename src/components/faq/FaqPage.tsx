"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// FAQ data
export const faqItems = [
    {
        id: 1,
        question: "Bạn chuyên cung cấp những dịch vụ nào?",
        answer: "Chúng tôi phục vụ đa dạng các dịch vụ về máy tính như sửa chữa phần cứng, cài đặt phần mềm, cấu hình mạng và tư vấn về công nghệ thông tin.",
    },
    {
        id: 2,
        question: "Thời gian sửa chữa trung bình mất bao lâu?",
        answer: "Hầu hết các dịch vụ được hoàn thành trong khoảng 1-3 ngày làm việc, tùy vào độ phức tạp và tình trạng của thiết bị.",
    },
    {
        id: 3,
        question: "Liệu có hỗ trợ sửa chữa tại chỗ không?",
        answer: "Có, chúng tôi cung cấp dịch vụ sửa chữa tại chỗ cho khách hàng cá nhân và doanh nghiệp trong bán kính 25 dặm.",
    },
    {
        id: 4,
        question: "Các hình thức thanh toán có những lựa chọn nào?",
        answer: "Bạn có thể thanh toán bằng thẻ tín dụng, PayPal, chuyển khoản ngân hàng hoặc trực tiếp tại cửa hàng bằng tiền mặt.",
    },
    {
        id: 5,
        question: "Có bảo hành cho các dịch vụ sửa chữa không?",
        answer: "Có, tất cả các dịch vụ sửa chữa đều được bảo hành trong vòng 90 ngày với đầy đủ điều kiện áp dụng.",
    },
];

const FaqPage = () => {
    const [openItem, setOpenItem] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleAccordion = (id: number) => {
        setOpenItem(openItem === id ? null : id);
    };

    const handleContactChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/faq`,
                contactForm,
            );
            toast.success("Câu hỏi của bạn đã được gửi thành công!");

            // Reset form and show success message
            setContactForm({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
            setFormSubmitted(true);

            // Hide success message after 5 seconds
            setTimeout(() => {
                setFormSubmitted(false);
            }, 5000);
        } catch (error) {
            toast.error("Không thể gửi câu hỏi. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 text-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
                    Câu Hỏi Thường Gặp
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cột FAQ */}
                    <div>
                        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Câu Hỏi Chung
                            </h2>

                            <div className="space-y-3">
                                {faqItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-gray-200 rounded-md overflow-hidden"
                                    >
                                        <button
                                            className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 flex justify-between items-center focus:outline-none"
                                            onClick={() =>
                                                toggleAccordion(item.id)
                                            }
                                            aria-expanded={openItem === item.id}
                                        >
                                            <span className="font-medium">
                                                {item.question}
                                            </span>
                                            <span className="text-xl font-bold">
                                                {openItem === item.id
                                                    ? "−"
                                                    : "+"}
                                            </span>
                                        </button>

                                        {openItem === item.id && (
                                            <div className="p-4 border-t border-gray-200 bg-white">
                                                <p className="text-gray-700">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cột Form Liên Hệ */}
                    <div>
                        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Vẫn Còn Câu Hỏi?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Gửi cho chúng tôi một tin nhắn và chúng tôi sẽ
                                phản hồi sớm nhất có thể.
                            </p>

                            {formSubmitted && (
                                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                                    <p>
                                        Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ
                                        phản hồi sớm.
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={handleContactSubmit}
                                className="space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-gray-700 font-medium mb-2"
                                    >
                                        Tên Của Bạn
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={contactForm.name}
                                        onChange={handleContactChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-gray-700 font-medium mb-2"
                                    >
                                        Địa Chỉ Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={contactForm.email}
                                        onChange={handleContactChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="block text-gray-700 font-medium mb-2"
                                    >
                                        Chủ Đề
                                    </label>
                                    <input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        value={contactForm.subject}
                                        onChange={handleContactChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-gray-700 font-medium mb-2"
                                    >
                                        Tin Nhắn Của Bạn
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={contactForm.message}
                                        onChange={handleContactChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
                                >
                                    Gửi Tin Nhắn
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
