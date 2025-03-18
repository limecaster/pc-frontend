"use client";
import React, { Suspense } from "react";
import AutoBuildPCContent from "./AutoBuildPCContent";

const AutoBuildPCPage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <AutoBuildPCContent />
        </Suspense>
    );
};

export default AutoBuildPCPage;
