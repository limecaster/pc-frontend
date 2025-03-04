import React, { useState } from "react";
import FilterItem from "./FilterItem";

const ratingOptions = [
    { id: "1star", name: "Từ 1 sao trở lên" },
    { id: "2star", name: "Từ 2 sao trở lên" },
    { id: "3star", name: "Từ 3 sao trở lên" },
    { id: "4star", name: "Từ 4 sao trở lên" },
    { id: "5star", name: "5 sao" },
];

const RatingFilter: React.FC = () => {
    const [selectedRating, setSelectedRating] = useState<string>("5star");

    return (
        <div className="grid grid-cols-1 gap-4 relative px-5 mx-1">
            <div className="relative w-[312px] font-medium text-gray-900 text-base tracking-[0] leading-6">
                ĐÁNH GIÁ
            </div>
            <div className="grid grid-cols-1 gap-3 relative">
                {ratingOptions.map((option) => (
                    <div
                        key={option.id}
                        className="grid grid-cols-[auto_1fr] gap-2 relative items-start"
                    >
                        <FilterItem
                            className={`!relative ${
                                selectedRating === option.id
                                    ? "!bg-primary"
                                    : ""
                            }`}
                            checked={selectedRating === option.id}
                            type="radio"
                            onChange={() => setSelectedRating(option.id)}
                        />
                        <p className="relative font-normal text-gray-700 text-sm tracking-[0] leading-5">
                            {option.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingFilter;
