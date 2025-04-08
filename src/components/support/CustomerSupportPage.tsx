"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { faqItems } from "@/components/faq/FaqPage";

// Support feature cards data
const supportFeatures = [
    {
        id: 1,
        title: "Theo dõi đơn hàng",
        description: "Kiểm tra trạng thái và theo dõi đơn hàng của bạn",
        icon: "/images/support/order-tracking.png",
        url: "/track-order",
    },
    {
        id: 2,
        title: "Build PC thủ công",
        description: "Tự lựa chọn từng linh kiện cho cấu hình PC của bạn",
        icon: "/images/support/manual-build.png",
        url: "/manual-build-pc",
    },
    {
        id: 3,
        title: "Build PC tự động",
        description:
            "Để hệ thống gợi ý cấu hình PC phù hợp với nhu cầu của bạn",
        icon: "/images/support/auto-build.png",
        url: "/auto-build-pc",
    },
    {
        id: 4,
        title: "Duyệt sản phẩm",
        description: "Khám phá đa dạng sản phẩm linh kiện máy tính",
        icon: "/images/support/products.png",
        url: "/products",
    },
];

const CustomerSupportPage = () => {
    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hỗ trợ khách hàng
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn. Dưới đây là các dịch
                        vụ hỗ trợ thường được sử dụng.
                    </p>
                </div>

                {/* Row 1: Feature Cards */}
                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {supportFeatures.map((feature) => (
                            <Link href={feature.url} key={feature.id}>
                                <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                                    {/* <div className="w-16 h-16 mb-4 relative">
                                        <Image
                                            src={feature.icon}
                                            alt={feature.title}
                                            fill
                                            className="object-contain"
                                        />
                                    </div> */}
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 my-12"></div>

                {/* Row 2: FAQ Preview */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Câu hỏi thường gặp
                        </h2>
                        <Link
                            href="/faq"
                            className="text-primary hover:underline font-medium"
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqItems.slice(0, 4).map((item) => (
                            <Link href="/faq" key={item.id}>
                                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start">
                                        <svg
                                            className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p className="text-gray-800 font-medium">
                                            {item.question}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 my-12"></div>

                {/* Row 3: Direct Contact Information */}
                <div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Không tìm thấy câu trả lời?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Liên hệ trực tiếp với đội ngũ hỗ trợ khách hàng của
                            chúng tôi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Phone Support Card */}
                        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="h-8 w-8 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Hỗ trợ qua điện thoại
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Gọi ngay để được hỗ trợ nhanh chóng
                            </p>
                            <a
                                href="tel:1900123456"
                                className="text-2xl font-bold text-primary hover:underline"
                            >
                                1900 123 456
                            </a>
                            <p className="text-gray-500 mt-2 text-sm">
                                Thời gian làm việc: 8:00 - 22:00 (Thứ 2 - Chủ
                                nhật)
                            </p>
                        </div>

                        {/* Email Support Card */}
                        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="h-8 w-8 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Hỗ trợ qua email
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Gửi email cho chúng tôi
                            </p>
                            <a
                                href="mailto:bang.do38@hcmut.edu.vn"
                                className="text-xl font-bold text-primary hover:underline"
                            >
                                bang.do38@hcmut.edu.vn
                            </a>
                            <p className="text-gray-500 mt-2 text-sm">
                                Thời gian phản hồi: Trong vòng 24 giờ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSupportPage;
