import React from "react";

interface SpinnerProps {
    className?: string;
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({
    className = "h-6 w-6",
}) => {
    return (
        <div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${className}`}
        ></div>
    );
};
