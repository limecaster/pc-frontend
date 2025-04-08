"use client";
import React, { Suspense } from "react";
import HomePageContent from "./HomePage";

const HomePage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <HomePageContent />
        </Suspense>
    );
};

export default HomePage;
