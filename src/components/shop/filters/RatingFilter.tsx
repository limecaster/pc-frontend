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
                            className={selectedRating === option.id ? "bg-primary-500" : ""}
                            checked={selectedRating === option.id}
                            type="radio"
                            onChange={() => setSelectedRating(option.id)}
                        />
                        <p className="text-sm font-normal text-gray-700 leading-5">
                            {option.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingFilter;
