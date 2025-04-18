"use client";
import { Suspense, useEffect, useRef } from "react";
import ManualBuildPCContent from "../../components/manual-build-pc/ManualBuildPCContent";
import { trackManualBuildPCPageView } from "@/api/events";

const ManualBuildPC = () => {
    const hasTrackedPageView = useRef(false);

    useEffect(() => {
        document.title = "B Store - Xây dựng PC thủ công";

        if (!hasTrackedPageView.current) {
            trackManualBuildPCPageView()
                .then(() => {
                    hasTrackedPageView.current = true;
                })
                .catch((error) => {
                    console.error("Failed to track page view:", error);
                });
        }
    }, []);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <ManualBuildPCContent />
        </Suspense>
    );
};

export default ManualBuildPC;
