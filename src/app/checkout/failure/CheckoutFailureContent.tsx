"use client";
import React, { useEffect } from "react";
import CheckoutFailurePage from "@/components/checkout/CheckoutFailurePage";
import { useSearchParams } from "next/navigation";

const CheckoutFailureContent = () => {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');

    useEffect(() => {
        document.title = "B Store - Thanh toán thất bại";
    }, []);

    return <CheckoutFailurePage errorMessage={errorMessage || undefined} />;
};

export default CheckoutFailureContent;
