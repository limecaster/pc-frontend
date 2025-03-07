"use client";
import React, { useEffect } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPage";

const Checkout: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Thanh toán";
    }, []);
    return <CheckoutPage />;
};

export default Checkout;
