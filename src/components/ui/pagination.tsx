import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    className?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    className,
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const paginationItems = React.useMemo(() => {
        const pages = [];

        // Always show first page
        pages.push(1);

        // Calculate range
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis if needed before startPage
        if (startPage > 2) {
            pages.push(-1); // Use -1 as an indicator for ellipsis
        }

        // Add pages in range
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add ellipsis if needed after endPage
        if (endPage < totalPages - 1) {
            pages.push(-2); // Use -2 as an indicator for ellipsis
        }

        // Always show last page if there is more than one page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <div
            className={cn(
                "flex items-center justify-center space-x-2",
                className,
            )}
        >
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                Trước
            </Button>

            <div className="flex items-center space-x-1">
                {paginationItems.map((page, idx) => {
                    if (page < 0) {
                        // This is an ellipsis
                        return <span key={`ellipsis-${idx}`}>...</span>;
                    }

                    return (
                        <Button
                            key={page}
                            variant={
                                page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={
                                page === currentPage
                                    ? "pointer-events-none"
                                    : ""
                            }
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
            >
                Sau
            </Button>
        </div>
    );
}
