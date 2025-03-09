"use client";
import React, { Suspense } from "react";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

const CheckoutSuccessPage: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
};
export default CheckoutSuccessPage;