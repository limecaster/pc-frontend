"use client";
import React, { Suspense } from "react";
import SearchResultsContent from "./SearchResultsContent";

const SearchPage: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
};
export default SearchPage;