"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    trackOrder,
    verifyAndTrackOrder,
    requestOrderTrackingOTP,
    verifyOrderTrackingOTP,
} from "@/api/order";

const OrderTrackingForm: React.FC = () => {
    const router = useRouter();
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Track verification steps
    const [verificationStep, setVerificationStep] = useState<
        "orderId" | "email" | "otp"
    >("orderId");
    const [maskedEmail, setMaskedEmail] = useState("");

    // Add a ref to track if a request is in progress
    const requestInProgress = useRef(false);

    // Helper to mask email for display
    const maskEmail = (email: string) => {
        if (!email) return "";
        const [username, domain] = email.split("@");
        const maskedUsername = `${username.substring(0, 2)}****${username.substring(username.length - 2)}`;
        return `${maskedUsername}@${domain}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (requestInProgress.current || isLoading) {
            return;
        }

        // Handle different verification steps
        if (verificationStep === "orderId") {
            // Validation for order ID
            if (!orderId) {
                setError("Vui lòng nhập mã đơn hàng");
                return;
            }

            // Remove numeric-only validation since we now accept order numbers like "ORD-1741508691834"
            // if (!/^\d+$/.test(orderId)) {
            //     setError("Mã đơn hàng phải là số");
            //     return;
            // }

            setError("");
            setIsLoading(true);
            requestInProgress.current = true;

            try {
                const response = await trackOrder(orderId);

                if (response.success) {
                    if (response.requiresVerification) {
                        // Need to verify - show email verification form
                        setVerificationStep("email");

                        // If we have customer email hint, display it masked
                        if (response.customerEmail) {
                            setMaskedEmail(maskEmail(response.customerEmail));
                        }

                        // Show info toast with blue background for better visibility
                        toast((t) => (
                            <div className="flex items-center bg-blue-50 p-4 rounded shadow-md">
                                <div className="rounded-full bg-blue-100 p-2 mr-3">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-blue-700">
                                    <p className="font-medium">
                                        Vui lòng xác thực email để xem chi tiết
                                        đơn hàng
                                    </p>
                                </div>
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="ml-auto text-blue-500 hover:text-blue-700"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ));
                    } else {
                        // No verification needed, navigate to order details
                        router.push(`/track-order/${orderId}`);
                    }
                } else {
                    toast.error(
                        response.message ||
                            "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.",
                    );
                }
            } catch (error) {
                console.error("Error tracking order:", error);
                toast.error(
                    "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.",
                );
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    requestInProgress.current = false;
                }, 300);
            }
        } else if (verificationStep === "email") {
            // Validation for email
            if (!email) {
                setEmailError("Vui lòng nhập email");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("Email không hợp lệ");
                return;
            }

            setEmailError("");
            setIsLoading(true);
            requestInProgress.current = true;

            try {
                // Request OTP directly when email is entered
                const response = await requestOrderTrackingOTP(orderId, email);

                if (response.success) {
                    // Email is valid, move to OTP verification step
                    setVerificationStep("otp");
                    toast.success("Mã xác thực đã được gửi đến email của bạn");
                } else {
                    // Show error if email doesn't match order
                    setEmailError("Email không khớp với thông tin đơn hàng");
                    toast.error("Vui lòng sử dụng email đã dùng khi đặt hàng");
                }
            } catch (error) {
                console.error("Error requesting OTP:", error);
                toast.error("Email không khớp với thông tin đơn hàng");
                setEmailError("Vui lòng sử dụng email đã dùng khi đặt hàng");
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    requestInProgress.current = false;
                }, 300);
            }
        } else if (verificationStep === "otp") {
            // Validation for OTP
            if (!otp) {
                setOtpError("Vui lòng nhập mã xác thực");
                return;
            }

            if (otp.length < 6) {
                setOtpError("Mã xác thực không hợp lệ");
                return;
            }

            setOtpError("");
            setIsLoading(true);
            requestInProgress.current = true;

            try {
                // Verify OTP
                const response = await verifyOrderTrackingOTP(
                    orderId,
                    email,
                    otp,
                );

                if (response.success) {
                    // OTP valid, navigate to order details
                    router.push(`/track-order/${orderId}`);
                } else {
                    setOtpError("Mã xác thực không hợp lệ hoặc đã hết hạn");
                }
            } catch (error) {
                console.error("Error verifying OTP:", error);
                setOtpError("Có lỗi xảy ra khi xác thực mã OTP");
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    requestInProgress.current = false;
                }, 300);
            }
        }
    };

    const handleResendOTP = async () => {
        if (isLoading || !email) return;

        setIsLoading(true);
        try {
            const response = await requestOrderTrackingOTP(orderId, email);
            if (response.success) {
                toast.success("Mã xác thực mới đã được gửi đến email của bạn");
            }
        } catch (error) {
            console.error("Error resending OTP:", error);
            toast.error("Không thể gửi lại mã xác thực");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (verificationStep === "email") {
            setVerificationStep("orderId");
            setEmail("");
            setEmailError("");
        } else if (verificationStep === "otp") {
            setVerificationStep("email");
            setOtp("");
            setOtpError("");
        }
    };

    return (
        <div className="bg-gray-50">
            <div className="mx-auto px-4 py-12 max-w-3xl text-gray-800">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Theo dõi đơn hàng
                </h1>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <form onSubmit={handleSubmit}>
                        {verificationStep === "orderId" && (
                            <div className="mb-6">
                                <label
                                    htmlFor="orderId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Mã đơn hàng
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            id="orderId"
                                            name="orderId"
                                            type="text"
                                            value={orderId}
                                            onChange={(e) =>
                                                setOrderId(e.target.value)
                                            }
                                            placeholder="Nhập mã đơn hàng của bạn"
                                            className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                                                error
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {error && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                                    >
                                        {isLoading ? "Đang tìm..." : "Theo dõi"}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    * Nhập mã đơn hàng của bạn để kiểm tra tình
                                    trạng giao hàng
                                </p>
                            </div>
                        )}

                        {verificationStep === "email" && (
                            <div className="mb-6">
                                <div className="flex items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Quay lại
                                    </button>
                                    <span className="flex-1 text-center font-medium">
                                        Xác thực đơn hàng #{orderId}
                                    </span>
                                </div>

                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email đặt hàng
                                </label>
                                <div className="mb-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder={
                                            maskedEmail
                                                ? `Ví dụ: ${maskedEmail}`
                                                : "Nhập email đã dùng khi đặt hàng"
                                        }
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                                            emailError
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {emailError && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {emailError}
                                        </div>
                                    )}
                                </div>

                                {maskedEmail && (
                                    <p className="text-xs text-gray-600 mb-3">
                                        * Gợi ý: Email được sử dụng khi đặt hàng
                                        có dạng {maskedEmail}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                                >
                                    {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                                </button>
                            </div>
                        )}

                        {verificationStep === "otp" && (
                            <div className="mb-6">
                                <div className="flex items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Quay lại
                                    </button>
                                    <span className="flex-1 text-center font-medium">
                                        Nhập mã xác thực
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                    Mã xác thực đã được gửi đến email{" "}
                                    <span className="font-medium">{email}</span>
                                </p>

                                <label
                                    htmlFor="otp"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Mã xác thực
                                </label>
                                <div className="mb-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Nhập mã 6 số"
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                                            otpError
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {otpError && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {otpError}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                                >
                                    {isLoading
                                        ? "Đang xác thực..."
                                        : "Xác nhận"}
                                </button>

                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={isLoading}
                                        className="text-sm text-primary hover:text-blue-700"
                                    >
                                        Gửi lại mã xác thực
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingForm;
