import React from "react";
import Image from "next/image";

// Import assets
import logoBlue from "@/assets/logo-blue.png";
import doubleCheck from "@/assets/icon/others/Checks.svg";

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col w-full max-md:max-w-full">
      <div className="flex flex-wrap gap-6 items-start py-20 pr-28 pl-20 w-full bg-primary min-h-[400px] max-md:px-5 max-md:max-w-full">
      <div className="flex flex-col grow shrink self-stretch my-auto font-medium min-w-[240px] w-[250px]">
        <Image
        src={logoBlue}
        alt="Company logo"
        className="object-contain max-w-full aspect-[1.06] w-[100px]"
        />
        <div className="flex flex-col mt-6 max-w-full w-[312px]">
        <div className="flex flex-col w-full">
          <h2 className="text-2xl leading-none text-white">
          Chăm sóc khách hàng:
          </h2>
          <p className="mt-1 text-lg leading-none text-white">
          0917 253 780
          </p>
        </div>
        <address className="mt-3 text-base text-white not-italic">
          Thủ Đức, TP. Hồ Chí Minh
        </address>
        <p className="mt-3 text-base text-white">
          <a href="mailto:bang.do38@hcmut.edu.vn">bang.do38@hcmut.edu.vn</a>
        </p>
        </div>
      </div>
      <div className="flex flex-col min-w-[240px] w-[608px] max-md:max-w-full">
        <h1 className="max-w-full text-4xl font-semibold leading-10 w-[608px] max-md:max-w-full">
        ĐỒ ÁN CHUYÊN NGÀNH <br /> HƯỚNG HỆ THỐNG THÔNG TIN
        </h1>
        <p className="mt-6 text-base leading-6 max-md:max-w-full">
        Đây là ĐACN của Đỗ Văn Bâng. <br /> Đây là một trang web thương
        mại điện tử, chuyên bán linh kiện máy tính và PC, có hỗ trợ tính
        năng build-PC.
        </p>
      </div>
      <ul className="flex flex-col text-base min-w-[240px] max-md:max-w-full">
        <li className="flex flex-wrap gap-3 items-start max-md:max-w-full">
        <Image
          src={doubleCheck}
          alt=""
          className="object-contain shrink-0 w-6 aspect-square"
        />
        <span className="w-[499px] max-md:max-w-full">
          Trang web thương mại điện tử
        </span>
        </li>
        <li className="flex flex-wrap gap-3 items-start mt-4 max-md:max-w-full">
        <Image
          src={doubleCheck}
          alt=""
          className="object-contain shrink-0 w-6 aspect-square"
        />
        <span className="w-[499px] max-md:max-w-full">
          Chuyên bán linh kiện máy tính và PC
        </span>
        </li>
        <li className="flex flex-wrap gap-3 items-start mt-4 max-md:max-w-full">
        <Image
          src={doubleCheck}
          alt=""
          className="object-contain shrink-0 w-6 aspect-square"
        />
        <span className="w-[499px] max-md:max-w-full">
          Hỗ trợ tính năng build-PC
        </span>
        </li>
        <li className="flex flex-wrap gap-3 items-start mt-4 max-md:max-w-full">
        <Image
          src={doubleCheck}
          alt=""
          className="object-contain shrink-0 w-6 aspect-square"
        />
        <span className="w-[499px] max-md:max-w-full">
          Có hệ thống gợi ý
        </span>
        </li>
      </ul>
      </div>
    </footer>
  );
};

export default Footer;
