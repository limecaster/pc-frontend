import React from "react";
import Image from "next/image";
import { ManualBuildPCItemCardProps } from "./types";

export const ManualBuildPCItemCard: React.FC<
    ManualBuildPCItemCardProps & { imageSrc: string | React.ReactNode }
> = ({ label, imageSrc, description, buttonLabel, onButtonClick }) => {
    return (
        <div className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center mb-4">
            <div className="flex items-center">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                    {typeof imageSrc === "string" ? (
                        <Image
                            src={imageSrc}
                            alt={label}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        imageSrc
                    )}
                </div>
                <div>
                    <p className="text-gray-800 font-medium">{label}</p>
                    <p className="text-gray-500 text-sm">{description}</p>
                </div>
            </div>
            <button
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={onButtonClick}
            >
                {buttonLabel}
            </button>
        </div>
    );
};
