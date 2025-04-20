"use client";
import React, { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

const CheckoutPage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
};

export default CheckoutPage;
