"use client";
import React, { Suspense } from "react";
import DirectPayContent from "./CheckoutDirectPayContent";

export default function DirectPayPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <DirectPayContent />
        </Suspense>
    );
}
