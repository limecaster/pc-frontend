import React from "react";
import Image from "next/image";
import Check from "@/assets/icon/shop/Check.svg";

interface FilterItemProps {
    type: "radio" | "checkbox";
    checked: boolean;
    className?: string;
    onChange?: () => void;
}

const FilterItem: React.FC<FilterItemProps> = ({
    type,
    checked,
    className = "",
    onChange,
}) => {
    return (
        <div
            onClick={onChange}
            className={`
        w-5 h-5 
        ${!checked ? "border border-solid border-gray-400" : ""} 
        ${type === "radio" ? "rounded-full" : "rounded-sm"} 
        ${checked ? "bg-primary-500" : "bg-gray-00"} 
        ${checked && type === "checkbox" ? "relative" : ""} 
        ${className}
      `}
        >
            {checked && type === "radio" && (
                <div className="relative w-full h-full flex items-center justify-center bg-primary rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
            )}

            {checked && type === "checkbox" && (
                <Image src={Check} alt="Check" />
            )}
        </div>
    );
};

export default FilterItem;
