import React from "react";
import Image from "next/image";

// Import assets
import house from "@/assets/icon/others/House.svg";
import caretRight from "@/assets/icon/others/CaretRight.svg";

const Breadcrumb: React.FC = () => {
  return (
    <nav
      className="flex flex-col justify-center items-start px-16 py-4 w-full text-sm leading-none bg-bgSecondary max-md:px-5 max-md:max-w-full"
      aria-label="Breadcrumb"
    >
      <div className="flex gap-2 justify-center items-center">
        <Image
          src={house}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
        />
        <a href="#" className="self-stretch my-auto text-gray-500">
          Home
        </a>

        <Image
          src={caretRight}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
        />
        <span className="self-stretch my-auto font-medium text-cyan-300">
          Xây dựng cấu hình
        </span>
      </div>
    </nav>
  );
};

export default Breadcrumb;
