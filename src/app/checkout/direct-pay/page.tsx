"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { initiateOrderPayment } from "@/api/order";
import { API_URL } from "@/config/constants";
import { toast } from "react-hot-toast";

export default function DirectPayPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            setError("Không tìm thấy mã đơn hàng");
            setIsLoading(false);
            return;
        }

        const initiatePayment = async () => {
            try {
                setIsLoading(true);
                // Try to get a payment URL from our backend
                const result = await initiateOrderPayment(orderId);

                if (result.success) {
                    if (result.data?.checkoutUrl) {
                        // If we have a checkout URL, redirect to it
                        window.location.href = result.data.checkoutUrl;
                    } else {
                        // No checkout URL in response - go to API direct payment URL
                        window.location.href = `${API_URL}/payment/pay/${orderId}`;
                    }
                } else {
                    throw new Error("Không thể khởi tạo thanh toán");
                }
            } catch (err) {
                console.error("Payment initiation error:", err);
                setError("Không thể khởi tạo thanh toán");
                toast.error("Không thể khởi tạo thanh toán");
                setIsLoading(false);
            }
        };

        initiatePayment();
    }, [searchParams]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">
                    Đang chuyển hướng đến trang thanh toán...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-screen">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/orders")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Quay lại đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-10 h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3">
                Đang chuyển hướng đến trang thanh toán...
            </span>
        </div>
    );
}
