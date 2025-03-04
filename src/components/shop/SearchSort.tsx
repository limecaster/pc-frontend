import React, { useState } from "react";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@radix-ui/react-icons";

const sortOptions = [
  { id: "popular", name: "Phổ biến" },
  { id: "newest", name: "Mới nhất" },
  { id: "price-asc", name: "Giá: Thấp đến cao" },
  { id: "price-desc", name: "Giá: Cao đến thấp" },
  { id: "rating", name: "Đánh giá" },
];

const SearchSort: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("popular");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="inline-flex items-start gap-[307px] w-full">
      <form onSubmit={handleSearch} className="flex-grow">
        <div className="inline-flex items-center justify-between gap-2 px-4 py-3 relative w-[364px] bg-gray-00 rounded-sm border border-solid border-gray-100">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm"
            className="relative w-full outline-none font-normal text-gray-500 text-sm tracking-[0] leading-5 bg-transparent"
          />
          <button type="submit">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="inline-flex items-center gap-[22px] relative">
        <div className="relative w-fit font-normal text-gray-900 text-sm tracking-[0] leading-5 whitespace-nowrap">
          Sắp xếp:
        </div>

        <div className="relative">
          <button 
            className="inline-flex items-center justify-between w-[180px] px-4 py-3 bg-gray-00 border border-solid border-gray-100 rounded-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="font-normal text-sm leading-5">
              {sortOptions.find(opt => opt.id === sortOption)?.name || "Phổ biến"}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-[180px] bg-gray-00 border border-solid border-gray-100 rounded-sm mt-1 z-10">
              {sortOptions.map(option => (
                <div 
                  key={option.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => {
                    setSortOption(option.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSort;
