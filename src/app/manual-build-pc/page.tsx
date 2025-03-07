"use client";
import { Suspense, useEffect } from "react";
import ManualBuildPCContent from "../../components/manual-build-pc/ManualBuildPCComponent";

const ManualBuildPC = () => {
    useEffect(() => {
        document.title = "B Store - Xây dựng PC thủ công";
    }, []);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ManualBuildPCContent />
        </Suspense>
    );
}

export default ManualBuildPC;