import React, { useState, useEffect } from "react";
import FilterItem from "./FilterItem";

interface RatingFilterProps {
    onRatingChange?: (minRating: number | undefined) => void;
    selectedRating?: number | undefined;
}

const ratingOptions = [
    { id: "1star", value: 1, name: "Từ 1 sao trở lên" },
    { id: "2star", value: 2, name: "Từ 2 sao trở lên" },
    { id: "3star", value: 3, name: "Từ 3 sao trở lên" },
    { id: "4star", value: 4, name: "Từ 4 sao trở lên" },
    { id: "5star", value: 5, name: "5 sao" },
];

const RatingFilter: React.FC<RatingFilterProps> = ({ onRatingChange, selectedRating }) => {
    const [selected, setSelected] = useState<string | undefined>(
        selectedRating ? `${selectedRating}star` : undefined
    );

    // Update internal state when props change
    useEffect(() => {
        if (selectedRating !== undefined) {
            setSelected(`${selectedRating}star`);
        } else {
            setSelected(undefined);
        }
    }, [selectedRating]);

    const handleRatingSelect = (optionId: string, ratingValue: number) => {
        // If already selected, toggle it off
        if (selected === optionId) {
            setSelected(undefined);
            if (onRatingChange) {
                onRatingChange(undefined);
            }
        } else {
            setSelected(optionId);
            if (onRatingChange) {
                onRatingChange(ratingValue);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="font-medium text-gray-900 text-base">
                ĐÁNH GIÁ
            </div>

            <div className="flex flex-col gap-3">
                {ratingOptions.map((option) => (
                    <div
                        key={option.id}
                        className="flex items-start gap-2"
                    >
                        <FilterItem
                            className={selected === option.id ? "bg-primary-500" : ""}
                            checked={selected === option.id}
                            type="radio"
                            onChange={() => handleRatingSelect(option.id, option.value)}
                        />
                        <div className="flex items-center gap-1">
                            {/* Star display */}
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                        key={star} 
                                        className={`text-sm ${star <= option.value ? 'text-primary' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm font-normal text-gray-700 leading-5 ml-2">
                                {option.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingFilter;
