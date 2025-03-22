"use client";
import React, { useEffect } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const Checkout: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Thanh toán";
    }, []);
    return (
        <ProtectedRoute>
            <CheckoutPage />
        </ProtectedRoute>
    );
};

export default Checkout;
