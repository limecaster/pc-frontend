"use client";
import { Suspense, useEffect } from "react";
import ManualBuildPCContent from "../../components/manual-build-pc/ManualBuildPCContent";

const ManualBuildPC = () => {
    useEffect(() => {
        document.title = "B Store - Xây dựng PC thủ công";
    }, []);

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <ManualBuildPCContent />
        </Suspense>
    );
}

export default ManualBuildPC;