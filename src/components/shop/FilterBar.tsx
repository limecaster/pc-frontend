import React from "react";
import ActiveFilters from "./filters/ActiveFilters";

interface FilterBarProps {
  activeFilters: { id: string; text: string }[];
  resultCount: number;
  onRemoveFilter: (id: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilters, 
  resultCount, 
  onRemoveFilter 
}) => {
  return (
    <div className="flex w-full items-center justify-between px-6 py-3 bg-gray-50 rounded">
      <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
        <div className="relative w-fit mt-[-1.00px] font-normal text-gray-600 text-sm tracking-[0] leading-5 whitespace-nowrap">
          Lọc:
        </div>
        
        <ActiveFilters 
          filters={activeFilters}
          onRemoveFilter={onRemoveFilter}
        />
      </div>

      <p className="relative w-fit mt-[-1.00px] font-normal text-gray-900 text-sm tracking-[0] leading-5 whitespace-nowrap">
        <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(resultCount)}</span>
        <span className="font-normal text-gray-900 text-sm tracking-[0] leading-5"> kết quả</span>
      </p>
    </div>
  );
};

export default FilterBar;