"use client";
import React, { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

const VerifyEmailPage: React.FC = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
};
export default VerifyEmailPage;
