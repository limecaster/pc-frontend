"use client";
import { Suspense } from "react";
import ManualBuildPCContent from "./ManualBuildPCComponent";

const ManualBuildPC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ManualBuildPCContent />
        </Suspense>
    );
}

export default ManualBuildPC;