"use client";
import React, { Suspense } from "react";
import CheckoutFailureContent from "./CheckoutFailureContent";

const CheckoutFailurePage: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <CheckoutFailureContent />
        </Suspense>
    );
};
export default CheckoutFailurePage;