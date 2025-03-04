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
        ${!checked ? "border border-solid border-gray-200" : ""} 
        ${type === "radio" ? "rounded-[100px]" : "rounded-sm"} 
        ${checked ? "bg-primary-500" : "bg-gray-00"} 
        ${checked && type === "checkbox" ? "relative" : ""} 
        ${className}
      `}
        >
            {checked && type === "radio" && (
                <div className="relative w-2 h-2 top-1.5 left-1.5 bg-gray-00 rounded" />
            )}

            {checked && type === "checkbox" && (
                <Image src={Check} alt="Check" />
            )}
        </div>
    );
};

export default FilterItem;
