import React from "react";
import { LoginButton } from "./LoginButton";

export const SocialLogin: React.FC = () => {
    return (
        <section className="mt-5 w-full text-sm leading-none max-w-[360px]">
            <div className="flex w-full whitespace-nowrap text-slate-500 relative">
                <div className="absolute w-full h-px bg-gray-200 top-1/2 transform -translate-y-1/2" />
                <div className="relative z-10 mx-auto px-2 bg-white">hoặc</div>
            </div>

            <LoginButton
                variant="secondary"
                className="mt-5 px-4 py-3 text-center"
            >
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/6f33a6c0fcd7400b8e8582051039e87b/4db0fe1ca28cce6c221a30f946aae3abad2532f7c8f6221b93e9871e5c7fdc46?placeholderIfAbsent=true"
                    alt="Google logo"
                    className="object-contain shrink-0 w-5 aspect-square"
                />
                <span>Đăng nhập với Google</span>
            </LoginButton>
        </section>
    );
};
