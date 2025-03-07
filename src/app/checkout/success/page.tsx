"use client";
import React, { useEffect } from "react";
import CheckoutSuccessPageComponent from "@/components/checkout/CheckoutSuccessPage";

const CheckoutSuccessPage = () => {
    useEffect(() => {
        document.title = "B Store - Thanh toán thành công";
    }, []);
    return <CheckoutSuccessPageComponent />;
};

export default CheckoutSuccessPage;
