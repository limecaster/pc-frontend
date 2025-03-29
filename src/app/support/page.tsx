"use client";

import React, { useEffect } from "react";
import CustomerSupportPage from "@/components/support/CustomerSupportPage";

const Support = () => {
    useEffect(() => {
        document.title = "B Store - Hỗ trợ khách hàng";
    }, []);

    return <CustomerSupportPage />;
};

export default Support;
