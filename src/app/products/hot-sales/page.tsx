"use client";

import React, { useEffect, Suspense } from "react";
import HotSalesContent from "./HotSalesContent";

export default function HotSalesPage() {
    useEffect(() => {
        document.title = "B Store | Hot Sales";
    }, []);

    return (
        <div className="p-6">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-screen bg-white">
                        Loading...
                    </div>
                }
            >
                <HotSalesContent />
            </Suspense>
        </div>
    );
}
