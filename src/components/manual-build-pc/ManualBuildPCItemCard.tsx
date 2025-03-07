import * as React from "react";
import Image from "next/image";

import { ManualBuildPCItemCardProps } from "./types";

export const ManualBuildPCItemCard: React.FC<ManualBuildPCItemCardProps> = ({
  label,
  imageSrc,
  description,
  buttonLabel,
  onButtonClick,
}) => {
  return (
    <div className="flex overflow-hidden flex-wrap items-center py-6 pr-8 bg-white rounded-md w-full">
      <div className="flex overflow-hidden justify-center items-center px-1 leading-5 text-black flex-grow gap-2 sm:gap-4 md:gap-6 lg:gap-8">
      <div className="flex-shrink-0 w-20 font-medium text-center">{label}</div>
      <Image
        src={imageSrc}
        alt={`${label}`}
       
        className="object-contain flex-shrink-0"
      />
      <div className="flex-grow">{description}</div>
      </div>
      <button
        className="ml-20 text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={onButtonClick}
        type="button"
      >
      {buttonLabel}
      </button>
    </div>
  );
};
