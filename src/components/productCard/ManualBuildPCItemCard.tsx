import * as React from "react";
import Image from "next/image";

import { ManualBuildPCItemCardProps } from "./types";

export const ManualBuildPCItemCard: React.FC<ManualBuildPCItemCardProps> = ({
  label,
  imageSrc,
  description,
}) => {
  return (
    <div className="flex overflow-hidden flex-wrap gap-10 items-center py-6 pr-8 bg-white rounded-md max-w-[833px] max-md:pr-5">
      <div className="flex overflow-hidden gap-2.5 justify-center items-center px-1 leading-5 text-black">
      <div className="self-stretch my-auto w-20 font-medium text-center">{label}</div>
        <Image
          src={imageSrc}
          alt={`Product image for ${label}`}
          width={85}
          height={85}
          className="object-contain shrink-0 self-stretch my-auto aspect-square w-[85px]"
        />
        <div className="self-stretch my-auto w-[251px]">{description}</div>
      </div>
    </div>
  );
};
