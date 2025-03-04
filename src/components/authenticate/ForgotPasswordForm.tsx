import React, { useState } from "react";
import { LoginButton } from "./LoginButton";

interface ForgotPasswordFormProps {
    onSubmit: (email: string, otp?: string, newPassword?: string) => void;
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onSubmit,
    onNavigateToLogin,
    onNavigateToRegister,
}) => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!otpSent) {
            // First step: Send OTP to the email
            onSubmit(email);
            setOtpSent(true);
        } else if (otpSent && !otpVerified) {
            // Second step: Verify OTP
            onSubmit(email, otp);
            // In a real application, you would verify the OTP with the backend
            // and only set otpVerified to true if verification is successful
            setOtpVerified(true);
        } else {
            // Third step: Reset password
            if (newPassword !== confirmPassword) {
                setPasswordError("Mật khẩu xác nhận không khớp");
                return;
            }
            onSubmit(email, otp, newPassword);
            // In a real application, navigate to login screen or show success message
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const resendOtp = () => {
        onSubmit(email);
        // Additional logic for resetting countdown timer could be added here
    };

    // Determine the heading and instructions based on current step
    let heading = "Quên mật khẩu";
    let instructions = "Nhập email liên kết với tài khoản của bạn";
    let buttonText = "GỬI MÃ OTP";

    if (otpSent && !otpVerified) {
        instructions = "Vui lòng nhập mã OTP đã được gửi đến email của bạn";
        buttonText = "XÁC NHẬN";
    } else if (otpVerified) {
        heading = "Đổi mật khẩu";
        instructions = "Vui lòng nhập mật khẩu mới của bạn";
        buttonText = "CẬP NHẬT MẬT KHẨU";
    }

    return (
        <div className="mt-8 mx-5 w-full max-w-[600px] flex flex-col items-center px-10">
            <h2 className="text-xl font-semibold text-zinc-900 text-center">
                {heading}
            </h2>
            <p className="text-sm text-slate-500 mt-2 text-center">
                {instructions}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 w-full max-w-[600px]">
                <div className="w-full text-sm leading-none whitespace-nowrap text-zinc-900">
                    <label htmlFor="reset-email">Email</label>
                    <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={otpSent}
                        required
                        className={`flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3 ${
                            otpSent ? "bg-gray-100 text-zinc-400" : ""
                        }`}
                    />
                </div>

                {otpSent && !otpVerified && (
                    <div className="w-full text-sm leading-none whitespace-nowrap text-zinc-900 mt-4">
                        <label htmlFor="otp-input">Mã OTP</label>
                        <input
                            id="otp-input"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            autoFocus
                            placeholder="Nhập mã OTP"
                            className="flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3"
                        />
                    </div>
                )}

                {otpVerified && (
                    <>
                        <div className="mt-4 w-full text-sm leading-none">
                            <label htmlFor="new-password" className="text-zinc-900">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={passwordVisible ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    autoFocus
                                    className="flex w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3 mt-2 text-zinc-900"
                                />
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/1e266fd65a0f5dabfd384a7271901f23c8286d66b00712dc4e76f092744745ca?placeholderIfAbsent=true"
                                    alt="Toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 object-contain w-5 aspect-square cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="mt-4 w-full text-sm leading-none">
                            <label htmlFor="confirm-password" className="text-zinc-900">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="flex w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3 mt-2 text-zinc-900"
                                />
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/1e266fd65a0f5dabfd384a7271901f23c8286d66b00712dc4e76f092744745ca?placeholderIfAbsent=true"
                                    alt="Toggle password visibility"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 object-contain w-5 aspect-square cursor-pointer"
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                            )}
                        </div>
                    </>
                )}

                <LoginButton 
                    type="submit" 
                    className="mt-5"
                >
                    <span>{buttonText}</span>
                </LoginButton>
                
                {otpSent && !otpVerified && (
                    <div className="mt-3 text-center">
                        <button 
                            type="button"
                            onClick={resendOtp}
                            className="text-sm text-primary font-medium"
                        >
                            Gửi lại mã OTP
                        </button>
                    </div>
                )}
            </form>

            <div className="border-t border-gray-200 w-full my-6"></div>
            
            <div className="flex flex-col items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                    <span className="text-slate-500">Đã có tài khoản?</span>
                    <button 
                        onClick={onNavigateToLogin}
                        className="font-medium text-primary"
                    >
                        Đăng nhập
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-slate-500">Chưa có tài khoản?</span>
                    <button 
                        onClick={onNavigateToRegister}
                        className="font-medium text-primary"
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};
