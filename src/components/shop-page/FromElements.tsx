import React from "react";
import Image from "next/image";
import Check from "@/assets/icon/shop/Check.svg";

interface Props {
  type: "radio" | "checkbox";
  status: "active" | "normal";
  className: any;
}

const FromElements: React.FC<Props> = ({ type, status, className }) => {
  return (
    <div
      className={`w-5 h-5 ${status === "normal" ? "border border-solid" : ""} ${status === "normal" ? "border-gray-200" : ""} ${type === "radio" ? "rounded-[100px]" : "rounded-sm"} ${status === "active" ? "bg-primary-500" : "bg-gray-00"} ${status === "active" && type === "checkbox" ? "relative" : ""} ${className}`}
    >
      {status === "active" && type === "radio" && (
        <div className="relative w-2 h-2 top-1.5 left-1.5 bg-gray-00 rounded" />
      )}

      {status === "active" && type === "checkbox" && (
        <Image src={Check} alt="Check" />
      )}
    </div>
  );
};

export default FromElements;