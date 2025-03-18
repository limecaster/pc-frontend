"use client";
import React, { ReactNode } from "react";

interface LoginButtonProps {
    children: ReactNode;
    type?: "submit" | "button";
    variant?: "primary" | "secondary";
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
    children,
    type = "button",
    variant = "primary",
    className = "",
    onClick,
    disabled = false,
}) => {
    const baseStyles =
        "flex gap-2 justify-center items-center px-6 w-full text-sm font-bold tracking-normal leading-10 rounded-sm";
    const variantStyles = {
        primary: "text-white bg-primary",
        secondary:
            "text-neutral-600 bg-white border border-solid border-[#E4E7E9]",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className} ${
                disabled ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
