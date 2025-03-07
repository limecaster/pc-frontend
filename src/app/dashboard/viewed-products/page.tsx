"use client";
import React, { useEffect } from "react";
import ViewedProductsPage from "@/components/dashboard/viewed-products/ViewedProductsPage";

const ViewedProductsDashboard = () => {
    useEffect(() => {
        document.title = "Sản phẩm đã xem | B Store";
    }, []);

    return <ViewedProductsPage />;
};

export default ViewedProductsDashboard;
