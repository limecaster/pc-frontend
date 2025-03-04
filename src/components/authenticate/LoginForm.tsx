import React, { useState } from "react";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 w-full max-w-[360px]">
            <div className="w-full text-sm leading-none whitespace-nowrap text-zinc-900">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex mt-2 w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3"
                />
            </div>

            <div className="mt-4 w-full">
                <div className="flex gap-10 justify-between items-center w-full text-sm leading-none">
                    <label
                        htmlFor="password"
                        className="self-stretch my-auto text-zinc-900"
                    >
                        Mật khẩu
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="self-stretch my-auto font-medium text-cyan-300"
                    >
                        Quên mật khẩu?
                    </button>
                </div>
                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex w-full bg-white rounded-sm border border-solid border-[#E4E7E9] min-h-11 px-3 mt-2 text-zinc-900"
                    />
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/1e266fd65a0f5dabfd384a7271901f23c8286d66b00712dc4e76f092744745ca?placeholderIfAbsent=true"
                        alt="Toggle password visibility"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 object-contain w-5 aspect-square cursor-pointer"
                    />
                </div>
            </div>
        </form>
    );
};
