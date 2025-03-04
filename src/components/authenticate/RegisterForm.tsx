import React, { useState } from "react";
import { LoginButton } from "./LoginButton";

interface RegisterFormProps {
    onSubmit: (fullName: string, email: string, password: string, verificationCode?: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [verificationSent, setVerificationSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setPasswordError("Mật khẩu không khớp");
            return;
        }
        
        setPasswordError("");
        
        if (!verificationSent) {
            // First submit - Register the user and send verification email
            onSubmit(fullName, email, password);
            setVerificationSent(true);
        } else {
            // Second submit - Verify the email with the code
            onSubmit(fullName, email, password, verificationCode);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const resendVerificationCode = () => {
        // Resend verification code
        onSubmit(fullName, email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 w-full max-w-[360px]">
            {!verificationSent ? (
                // Registration form
                <>
                    <div className="w-full text-sm leading-none whitespace-nowrap text-zinc-900">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3"
                        />
                    </div>

                    <div className="mt-4 w-full text-sm leading-none whitespace-nowrap text-zinc-900">
                        <label htmlFor="registerEmail">Email</label>
                        <input
                            id="registerEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3"
                        />
                    </div>

                    <div className="mt-4 w-full text-sm leading-none">
                        <label
                            htmlFor="registerPassword"
                            className="text-zinc-900"
                        >
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="registerPassword"
                                type={passwordVisible ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                        <label
                            htmlFor="confirmPassword"
                            className="text-zinc-900"
                        >
                            Nhập lại mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
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
            ) : (
                // Email verification form
                <div className="w-full flex flex-col items-center">
                    <h2 className="text-xl font-semibold text-zinc-900 text-center">
                        Xác nhận địa chỉ email
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 text-center">
                        Chúng tôi đã gửi mã xác thực đến email {email}
                    </p>
                    
                    <div className="w-full text-sm leading-none whitespace-nowrap text-zinc-900 mt-6">
                        <label htmlFor="verification-code">Mã xác thực</label>
                        <input
                            id="verification-code"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            autoFocus
                            placeholder="Nhập mã xác thực"
                            className="flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3"
                        />
                    </div>
                    
                    <div className="mt-3 text-center w-full">
                        <button 
                            type="button"
                            onClick={resendVerificationCode}
                            className="text-sm text-primary font-medium"
                        >
                            Gửi lại mã xác thực
                        </button>
                    </div>
                </div>
            )}
            
            <LoginButton 
                type="submit"
                className="mt-5"
            >
                <span>
                    {verificationSent ? "XÁC NHẬN" : "ĐĂNG KÝ"}
                </span>
            </LoginButton>
        </form>
    );
};
