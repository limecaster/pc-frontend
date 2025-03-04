"use client";
import React from "react";

interface LoginButtonProps {
    children: React.ReactNode;
    type?: "submit" | "button";
    variant?: "primary" | "secondary";
    className?: string;
    onClick?: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
    children,
    type = "button",
    variant = "primary",
    className = "",
    onClick,
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
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            type = {type}
        >
            {children}
        </button>
    );
};
