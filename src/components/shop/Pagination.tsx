import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range to always show 3 pages if possible
    if (rangeEnd - rangeStart < 2 && totalPages > 3) {
      if (currentPage < totalPages / 2) {
        rangeEnd = Math.min(totalPages - 1, rangeStart + 2);
      } else {
        rangeStart = Math.max(2, rangeEnd - 2);
      }
    }
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pageNumbers.push("ellipsis1");
    }
    
    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push("ellipsis2");
    }
    
    // Always show last page if we have more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="inline-flex items-start gap-1">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded ${
          currentPage === 1 ? "text-gray-800 cursor-not-allowed" : "text-gray-800 hover:bg-gray-100"
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === "ellipsis1" || page === "ellipsis2" ? (
            <div className="flex items-center justify-center w-10 h-10 text-gray-800">
              ...
            </div>
          ) : (
            <button
              onClick={() => typeof page === "number" && onPageChange(page)}
              className={`flex items-center justify-center w-10 h-10 rounded text-gray-800 ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded ${
          currentPage === totalPages ? "text-gray-800 cursor-not-allowed" : "text-gray-800 hover:bg-gray-100"
        }`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
