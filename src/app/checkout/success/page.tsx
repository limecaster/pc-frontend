"use client";
import React, { Suspense } from "react";
import CheckoutSuccessContent from "./CheckoutSuccessContent";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const CheckoutSuccessPage: React.FC = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <ProtectedRoute>
                <CheckoutSuccessContent />
            </ProtectedRoute>
        </Suspense>
    );
};
export default CheckoutSuccessPage;
