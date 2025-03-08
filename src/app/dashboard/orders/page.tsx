"use client";
import React, { useEffect } from "react";

import OrdersPage from "@/components/dashboard/orders/OrdersPage";

const OrdersDashboard = () => {
    useEffect(() => {
        document.title = "Đơn hàng | B Store";
    }, []);
    return <OrdersPage />;
};

export default OrdersDashboard;
