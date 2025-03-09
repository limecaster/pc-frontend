"use client";
import React, { useEffect } from "react";
import WishlistPage from "@/components/dashboard/wishlist/WishlistPage";

const WishlistDashboard = () => {
    useEffect(() => {
        document.title = "Danh sách yêu thích | B Store";
    }, []);
    
    return <WishlistPage />;
};

export default WishlistDashboard;
