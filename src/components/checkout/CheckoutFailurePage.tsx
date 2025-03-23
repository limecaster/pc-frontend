"use client";

import React, { useEffect, useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";

interface CheckoutFailurePageProps {
    errorMessage?: string;
}

const CheckoutFailurePage: React.FC<CheckoutFailurePageProps> = ({
    errorMessage,
}) => {
    const [error, setError] = useState<string>(
        errorMessage || "Không thể hoàn tất thanh toán",
    );

    useEffect(() => {
        // Check if there's an error message in the URL
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const errorParam = urlParams.get("error");
            if (errorParam) {
                setError(decodeURIComponent(errorParam));
            }
        }
    }, []);

    return (
        <div className="w-full bg-gray-100 py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircleIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Thanh toán không thành công
                        </h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                            <Link
                                href="/dashboard/orders"
                                className="bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-dark transition-colors text-center"
                            >
                                Thử lại
                            </Link>
                            <Link
                                href="/cart"
                                className="bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium hover:bg-gray-300 transition-colors text-center"
                            >
                                Quay lại giỏ hàng
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Lý do có thể gây ra lỗi:
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Thông tin thanh toán không hợp lệ</li>
                            <li>
                                Tài khoản của bạn không đủ số dư để thanh toán
                            </li>
                            <li>Hết thời gian thực hiện thanh toán</li>
                            <li>Lỗi kết nối mạng</li>
                            <li>Lỗi hệ thống từ cổng thanh toán</li>
                        </ul>
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                        <h3 className="text-md font-medium text-gray-900 mb-2">
                            Bạn cần hỗ trợ?
                        </h3>
                        <p className="text-gray-600 mb-2">
                            Vui lòng liên hệ với bộ phận chăm sóc khách hàng của
                            chúng tôi:
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Email:</span>{" "}
                            <a
                                href="mailto:support@bstore.com"
                                className="text-primary hover:underline"
                            >
                                support@bstore.com
                            </a>
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Hotline:</span>{" "}
                            <a
                                href="tel:1900123456"
                                className="text-primary hover:underline"
                            >
                                1900 123 456
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutFailurePage;
