import React, { useEffect } from "react";
import CartPage from "@/components/cart/CartPage";

const Cart = () => {
    useEffect(() => {
        document.title = "B Store - Giỏ hàng";
    }, []);
    return <CartPage />;
};

export default Cart;
