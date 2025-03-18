import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 rounded-md hover:bg-gray-200"
                >
                    1
                </button>,
            );
            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis1" className="px-2">
                        ...
                    </span>,
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === i
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="ellipsis2" className="px-2">
                        ...
                    </span>,
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1 rounded-md hover:bg-gray-200"
                >
                    {totalPages}
                </button>,
            );
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center space-x-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-200"
                }`}
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-200"
                }`}
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
};

export default Pagination;
