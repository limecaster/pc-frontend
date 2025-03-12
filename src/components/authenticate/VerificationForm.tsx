import React, { useState, useEffect } from "react";

interface VerificationFormProps {
    email: string;
    onSubmit: (otpCode: string) => void;
    onResend: () => void;
    isSubmitting?: boolean;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
    email,
    onSubmit,
    onResend,
    isSubmitting = false,
}) => {
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60); // 60 seconds countdown for resend

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = () => {
        onResend();
        setCountdown(60); // Reset countdown
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode) {
            setError("Vui lòng nhập mã OTP");
            return;
        }
        
        if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
            setError("Mã OTP phải gồm 6 chữ số");
            return;
        }

        setError(null);
        onSubmit(otpCode);
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        // Only allow digits and max 6 characters
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtpCode(value);
            if (error) setError(null);
        }
    };

    const maskedEmail = email
        ? email.replace(/^(.{3})(.*)(@.*)$/, (_, a, b, c) => 
            a + b.replace(/./g, '*') + c)
        : "your email";

    return (
        <div className="flex flex-col px-8 py-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                Xác thực tài khoản
            </h2>
            <p className="text-gray-600 mb-6 text-center">
                Chúng tôi đã gửi một mã xác thực đến email {maskedEmail}. 
                Vui lòng kiểm tra email và nhập mã xác thực để hoàn tất đăng ký.
            </p>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Nhập mã OTP 6 chữ số"
                        value={otpCode}
                        onChange={handleOtpChange}
                        className="px-3 py-3 text-sm bg-white border border-solid rounded-sm focus:outline-none focus:border-primary border-gray-300 text-center tracking-widest font-medium"
                        disabled={isSubmitting}
                        maxLength={6}
                    />
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-primary text-white py-3 px-4 rounded font-medium ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-primary-dark"
                    }`}
                >
                    {isSubmitting ? "Đang xử lý..." : "Xác thực"}
                </button>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Không nhận được mã? 
                        {countdown > 0 ? (
                            <span className="text-gray-500"> Gửi lại sau {countdown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-primary hover:underline ml-1 focus:outline-none"
                                disabled={isSubmitting}
                            >
                                Gửi lại
                            </button>
                        )}
                    </p>
                </div>
            </form>
        </div>
    );
};
