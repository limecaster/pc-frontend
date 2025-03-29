"use client";

import { useState } from "react";

// FAQ data
export const faqItems = [
    {
        id: 1,
        question: "Bạn cung cấp những dịch vụ gì?",
        answer: "Chúng tôi cung cấp một loạt các dịch vụ máy tính bao gồm sửa chữa phần cứng, cài đặt phần mềm, thiết lập mạng và tư vấn CNTT.",
    },
    {
        id: 2,
        question: "Một sửa chữa điển hình mất bao lâu?",
        answer: "Hầu hết các sửa chữa được hoàn thành trong vòng 1-3 ngày làm việc, tùy thuộc vào độ phức tạp của vấn đề và tính khả dụng của các bộ phận.",
    },
    {
        id: 3,
        question: "Bạn có cung cấp hỗ trợ tại chỗ không?",
        answer: "Có, chúng tôi cung cấp hỗ trợ tại chỗ cho các doanh nghiệp và khách hàng dân cư trong bán kính 25 dặm.",
    },
    {
        id: 4,
        question: "Bạn chấp nhận những phương thức thanh toán nào?",
        answer: "Chúng tôi chấp nhận tất cả các thẻ tín dụng lớn, PayPal, chuyển khoản ngân hàng và tiền mặt cho các dịch vụ tại cửa hàng.",
    },
    {
        id: 5,
        question: "Bạn có cung cấp bảo hành cho sửa chữa không?",
        answer: "Có, tất cả các sửa chữa của chúng tôi đi kèm với bảo hành 90 ngày cho cả phụ tùng và nhân công.",
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

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement your email sending logic here
        console.log("Form submitted:", contactForm);

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
