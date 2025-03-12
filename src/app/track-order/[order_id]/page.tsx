"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { trackOrder, verifyOrderTrackingOTP, requestOrderTrackingOTP } from "@/api/order";
import OrderStatusPage from "@/components/track-order/OrderStatusPage";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function OrderTrackingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.order_id as string;
    const [orderData, setOrderData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Verification states - simplified to just OTP
    const [verificationNeeded, setVerificationNeeded] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    
    const hasFetched = useRef(false);

    // Check session storage for previously verified orders
    const checkSessionStorage = () => {
        try {
            return sessionStorage.getItem(`verified-order-${orderId}`) === 'true';
        } catch (e) {
            return false;
        }
    };

    // Initial data fetch
    useEffect(() => {
        document.title = `B Store - Theo dõi đơn hàng #${orderId}`;
        
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        // Check if already verified
        const isVerified = checkSessionStorage();
        
        fetchOrderData(isVerified);
    }, [orderId]);

    // Main data fetching function
    const fetchOrderData = async (skipVerification = false) => {
        try {
            setIsLoading(true);
            console.log(`Fetching order tracking data for: ${orderId}`);
            
            const response = await trackOrder(orderId);
            
            if (response.success) {
                setOrderData(response.order);
                
                // Check if verification is needed and hasn't been done before
                if (response.requiresVerification && !skipVerification) {
                    setVerificationNeeded(true);
                } else {
                    setVerificationNeeded(false);
                }
            } else {
                setError(response.message || "Không tìm thấy đơn hàng");
            }
        } catch (error) {
            console.error("Error fetching order data:", error);
            setError("Có lỗi xảy ra khi tìm thông tin đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle email submission and OTP request
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await requestOrderTrackingOTP(orderId, email);
            
            if (response.success) {
                toast.success("Mã xác thực đã được gửi đến email của bạn");
            } else {
                toast.error(response.message || "Email không khớp với đơn hàng này");
            }
        } catch (error) {
            console.error("Error requesting OTP:", error);
            toast.error("Email không khớp với đơn hàng này");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!otp) {
            setOtpError("Vui lòng nhập mã xác thực");
            return;
        }
        
        setOtpError("");
        setIsLoading(true);
        
        try {
            const response = await verifyOrderTrackingOTP(orderId, email, otp);
            
            if (response.success) {
                // Save verification state to session storage
                try {
                    sessionStorage.setItem(`verified-order-${orderId}`, 'true');
                } catch (e) {
                    console.error("Error saving to session storage:", e);
                }
                
                setOrderData(response.order);
                setVerificationNeeded(false);
                toast.success("Xác thực thành công");
            } else {
                setOtpError(response.message || "Mã xác thực không hợp lệ");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setOtpError("Có lỗi khi xác thực mã OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Error state
    if (error || !orderData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Không tìm thấy đơn hàng
                </h1>
                <p className="text-gray-700 mb-6">{error || "Đơn hàng không tồn tại hoặc đã bị xóa"}</p>
                <button
                    onClick={() => router.push('/track-order')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // Verification needed - show a simplified form focusing only on email + OTP
    if (verificationNeeded) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        Xác thực đơn hàng #{orderData.orderNumber}
                    </h1>
                    
                    {!email ? (
                        // Step 1: Email input
                        <>
                            <p className="mb-4 text-gray-600">
                                Để xem chi tiết đơn hàng, vui lòng nhập email đã dùng khi đặt hàng:
                            </p>
                            <form onSubmit={handleEmailSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary border-gray-300"
                                        placeholder="Nhập email của bạn"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isLoading ? "Đang xử lý..." : "Gửi mã xác thực"}
                                </button>
                            </form>
                        </>
                    ) : (
                        // Step 2: OTP input
                        <>
                            <p className="mb-4 text-gray-600">
                                Mã xác thực đã được gửi đến <span className="font-medium">{email}</span>. Vui lòng kiểm tra và nhập mã:
                            </p>
                            <form onSubmit={handleOtpSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                                            otpError ? "border-red-500" : "border-gray-300"
                                        }`}
                                        placeholder="Nhập mã xác thực"
                                        required
                                    />
                                    {otpError && (
                                        <p className="mt-1 text-sm text-red-600">{otpError}</p>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {isLoading ? "Đang xác thực..." : "Xác nhận"}
                                    </button>
                                    <div className="flex justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setEmail("")}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            Thay đổi email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEmailSubmit}
                                            disabled={isLoading}
                                            className="text-primary hover:text-blue-700"
                                        >
                                            Gửi lại mã
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-semibold mb-2">
                            Thông tin đơn hàng
                        </h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>Mã đơn hàng: <span className="font-medium">{orderData.orderNumber}</span></p>
                            <p>Trạng thái: <span className="font-medium">{orderData.status}</span></p>
                            <p>Ngày đặt: <span className="font-medium">{new Date(orderData.orderDate).toLocaleDateString('vi-VN')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full order details - no verification needed or verification completed
    return <OrderStatusPage {...orderData} />;
}
