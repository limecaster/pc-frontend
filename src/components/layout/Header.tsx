import React from "react";
import Image from "next/image";

// Import assets
import logo from "@/assets/logo.png";
import searchIcon from "@/assets/icon/others/MagnifyingGlass.svg";
import userIcon from "@/assets/icon/others/User.svg";
import bellIcon from "@/assets/icon/others/Bell.svg";
import cartIcon from "@/assets/icon/others/ShoppingCartSimple.svg";

const Header: React.FC = () => {
  return (
    <header className="flex flex-col w-full max-md:max-w-full">
      <div className="flex flex-wrap gap-10 justify-between items-center px-2 py-5 w-full bg-primary max-md:px-5 max-md:max-w-full">
      <Image src={logo} width={80} height={60} alt="Company logo" className="mx-2" />
      <form className="flex flex-wrap gap-2 items-center self-stretch px-5 py-1 my-auto text-sm leading-none bg-white rounded-sm shadow-lg min-w-[240px] text-slate-500 max-md:max-w-full max-md:flex-1 max-md:gap-1">
        <label htmlFor="search" className="sr-only">
        Tìm kiếm sản phẩm...
        </label>
        <input
        type="text"
        id="search"
        placeholder="Tìm kiếm sản phẩm..."
        className="md:w-[578px] max-md:w-full text-slate-500 border-none focus:ring-0 focus:outline-none"
        />
        <button type="submit" aria-label="Search">
        <Image
          src={searchIcon}
          alt=""
          className="object-contain shrink-0 w-5 aspect-square my-2.5"
        />
        </button>
      </form>
      <nav className="flex gap-6 items-center self-stretch my-auto max-md:gap-4">
        <a href="#" aria-label="User account">
        <Image
          src={userIcon}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square max-md:w-6"
        />
        </a>
        <a href="#" aria-label="Notifications">
        <Image
          src={bellIcon}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square max-md:w-6"
        />
        </a>
        <a href="#" aria-label="Shopping cart">
        <Image
          src={cartIcon}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square max-md:w-6"
        />
        </a>
      </nav>
      </div>
    </header>
  );
};

export default Header;
