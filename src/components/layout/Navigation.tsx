import React from "react";
import Image from "next/image";

// Import assets
import frame from "@/assets/icon/others/Frame.svg";
import info from "@/assets/icon/others/Info.svg";
import mapPinLine from "@/assets/icon/others/MapPinLine.svg";
import caretDown from "@/assets/icon/others/CaretDown.svg";
import phone from "@/assets/icon/others/Phone.svg";
import phoneCall from "@/assets/icon/others/PhoneCall.svg";

const Navigation: React.FC = () => {
  return (
    <nav className="flex flex-wrap gap-10 justify-between items-center px-20 py-4 w-full bg-white shadow-sm max-md:px-5 max-md:max-w-full">
      <div className="flex flex-wrap gap-6 justify-center items-center self-stretch my-auto text-sm leading-none text-gray-500 min-w-[240px] max-md:max-w-full">
        <div className="flex flex-col self-stretch px-0.5 my-auto font-medium text-zinc-900 w-[203px]">
          <button className="flex gap-2 justify-center items-center px-6 py-3.5 bg-gray-100 rounded-sm max-md:px-5">
            <span className="self-stretch my-auto">Danh mục sản phẩm</span>
            <Image
              src={caretDown}
              alt=""
              className="object-contain shrink-0 self-stretch my-auto w-3 aspect-square"
            />
          </button>
        </div>
        <a href="#" className="flex gap-1.5 items-center self-stretch my-auto">
          <Image
            src={mapPinLine}
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
          <span className="self-stretch my-auto">Trạng thái đơn hàng</span>
        </a>
        <a
          href="#"
          className="flex gap-1 justify-between items-center self-stretch my-auto w-[143px]"
        >
          <Image
            src={frame}
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
          <span className="self-stretch my-auto">Xây dựng cấu hình</span>
        </a>
        <a href="#" className="flex gap-1.5 items-center self-stretch my-auto">
          <Image
            src={phone}
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />

          <span className="self-stretch my-auto">Chăm sóc khách hàng</span>
        </a>
        <a href="#" className="flex gap-1.5 items-center self-stretch my-auto">
          <Image
            src={info}
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
          <span className="self-stretch my-auto">Trợ giúp</span>
        </a>
      </div>
      <div className="flex gap-2 justify-center items-center self-stretch my-auto text-lg leading-none text-zinc-900">
        <Image
          src={phoneCall}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
        />
        <span className="self-stretch my-auto">0917 253 780</span>
      </div>
    </nav>
  );
};

export default Navigation;
