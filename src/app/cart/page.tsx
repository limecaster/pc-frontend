"use client";
import React, { useEffect } from "react";
import CartPage from "@/components/cart/CartPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const Cart = () => {
    useEffect(() => {
        document.title = "B Store - Giỏ hàng";
    }, []);

    return (
        <ProtectedRoute>
            <CartPage />
        </ProtectedRoute>
    );
};

export default Cart;
