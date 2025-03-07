"use client";
import React, { useEffect } from "react";
import OrderTrackingForm from "@/components/track-order/OrderTrackingForm";

const TrackOrderPage = () => {
    useEffect(() => {
        document.title = "B Store - Theo dõi đơn hàng";
    }, []);
    return <OrderTrackingForm />;
};

export default TrackOrderPage;
