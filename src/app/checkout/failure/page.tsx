"use client";
import React, { Suspense } from "react";
import CheckoutFailureContent from "./CheckoutFailureContent";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const CheckoutFailurePage: React.FC = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <ProtectedRoute>
                <CheckoutFailureContent />
            </ProtectedRoute>
        </Suspense>
    );
};
export default CheckoutFailurePage;
