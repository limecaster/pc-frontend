"use client";
import React, { Suspense, useEffect } from "react";
import SearchResultsContent from "./SearchResultsContent";

const SearchPage: React.FC = () => {
    useEffect(() => {
        document.title = "Kết quả tìm kiếm";
    }, []);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <SearchResultsContent />
        </Suspense>
    );
};
export default SearchPage;
