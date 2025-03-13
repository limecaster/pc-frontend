import React from "react";

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    editable?: boolean;
    size?: "small" | "medium" | "large";
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    editable = false,
    size = "medium",
}) => {
    const handleClick = (selectedRating: number) => {
        if (editable && onRatingChange) {
            onRatingChange(selectedRating);
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case "small":
                return "text-lg";
            case "large":
                return "text-2xl";
            default:
                return "text-xl";
        }
    };

    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => handleClick(star)}
                    className={`
                        ${getSizeClass()}
                        ${star <= rating ? "text-secondary" : "text-gray-300"}
                        ${editable && "cursor-pointer hover:text-secondary"}
                    `}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
