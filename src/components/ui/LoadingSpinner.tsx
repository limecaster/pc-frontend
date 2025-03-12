import React from "react";

type LoadingSpinnerProps = {
    size?: "small" | "medium" | "large";
    color?: "primary" | "white";
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = "medium", 
    color = "primary" 
}) => {
    // Determine size classes
    const sizeClasses = {
        small: "w-4 h-4 border-2",
        medium: "w-8 h-8 border-2",
        large: "w-12 h-12 border-4",
    };

    // Determine color classes
    const colorClasses = {
        primary: "border-blue-600 border-t-transparent",
        white: "border-white border-t-transparent",
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
                role="status"
                aria-label="loading"
            ></div>
        </div>
    );
};

export default LoadingSpinner;
