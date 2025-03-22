"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

const TrackOrderPage = () => {
    const router = useRouter();
    const [orderIdentifier, setOrderIdentifier] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = "B Store - Theo dõi đơn hàng";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderIdentifier.trim()) {
            toast.error("Vui lòng nhập mã đơn hàng");
            return;
        }

        setIsLoading(true);

        // Simply redirect to the order detail page
        router.push(
            `/track-order/${encodeURIComponent(orderIdentifier.trim())}`,
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-16 text-gray-800">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Theo dõi đơn hàng
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="orderNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mã đơn hàng
                        </label>
                        <input
                            type="text"
                            id="orderNumber"
                            value={orderIdentifier}
                            onChange={(e) => setOrderIdentifier(e.target.value)}
                            placeholder="Nhập mã đơn hàng của bạn"
                            className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <LoadingSpinner size="small" />
                                <span className="ml-2">Đang xử lý...</span>
                            </div>
                        ) : (
                            "Theo dõi"
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
                    <p className="mb-2">
                        Nhập mã đơn hàng để xem trạng thái và thông tin chi tiết
                        về đơn hàng của bạn.
                    </p>
                    <p>Mã đơn hàng được gửi trong email xác nhận đơn hàng.</p>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;
