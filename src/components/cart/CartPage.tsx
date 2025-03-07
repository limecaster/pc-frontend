"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CartItem from "./CartItem";

import VietQRLogo from "@/assets/VietQRLogo.png";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
}

const CartPage: React.FC = () => {
    // This would typically come from a context or state management system
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: "1",
            name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
            price: 17990000,
            quantity: 1,
            image: "/products/rtx4070.jpg",
            slug: "msi-rtx-4070-gaming-x-trio",
        },
        {
            id: "2",
            name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
            price: 2190000,
            quantity: 2,
            image: "/products/keyboard.jpg",
            slug: "akko-3068b-plus-world-tour-tokyo",
        },
        {
            id: "3",
            name: "Chuột gaming Logitech G502 X PLUS LightForce",
            price: 3490000,
            quantity: 1,
            image: "/products/mouse.jpg",
            slug: "logitech-g502-x-plus",
        },
    ]);

    // Calculate totals
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );
    const shippingFee = 0; // Free shipping
    const tax = Math.round(subtotal * 0.08); // 8% tax example
    const total = subtotal + shippingFee + tax;

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Handle quantity change
    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item,
            ),
        );
    };

    // Handle item removal
    const removeItem = (id: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    // Empty cart
    const isCartEmpty = cartItems.length === 0;

    return (
        <div className="w-full bg-gray-100 py-8">
            <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    Giỏ hàng của bạn
                </h1>

                {isCartEmpty ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow p-8">
                        <div className="text-gray-500 text-lg mb-6">
                            Giỏ hàng của bạn đang trống
                        </div>
                        <Link
                            href="/products"
                            className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart items section */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Sản phẩm
                                                </th>
                                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Số lượng
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Giá tiền
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Tổng
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {cartItems.map((item) => (
                                                <CartItem
                                                    key={item.id}
                                                    id={item.id}
                                                    name={item.name}
                                                    price={item.price}
                                                    quantity={item.quantity}
                                                    image={item.image}
                                                    slug={item.slug}
                                                    onUpdateQuantity={
                                                        updateQuantity
                                                    }
                                                    onRemove={removeItem}
                                                    formatCurrency={
                                                        formatCurrency
                                                    }
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Continue Shopping Button */}
                            <div className="mt-6">
                                <Link
                                    href="/products"
                                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>

                        {/* Order summary section */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-lg shadow p-6 top-20">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    Tóm tắt đơn hàng
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-base text-gray-900">
                                        <p>
                                            Tạm tính ({cartItems.length} sản
                                            phẩm)
                                        </p>
                                        <p className="text-primary font-medium">
                                            {formatCurrency(subtotal)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between text-base text-gray-900">
                                        <p>Phí vận chuyển</p>
                                        <p className="text-secondary">
                                            {shippingFee === 0
                                                ? "Miễn phí"
                                                : formatCurrency(shippingFee)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between text-base text-gray-900">
                                        <p>Thuế (8%)</p>
                                        <p className="text-primary font-medium">
                                            {formatCurrency(tax)}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-medium">
                                        <p className="text-gray-900">Tổng cộng</p>
                                        <p className="text-primary font-semibold">
                                            {formatCurrency(total)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href="/checkout"
                                        className="w-full bg-primary py-3 px-4 rounded-md text-white font-medium 
                           hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-primary text-center block transition-colors"
                                    >
                                        Tiến hành thanh toán
                                    </Link>
                                </div>

                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <p>Hoặc</p>
                                    <button
                                        onClick={() => setCartItems([])}
                                        className="font-medium text-red-600 hover:text-red-800 mt-1 transition-colors"
                                    >
                                        Xóa giỏ hàng
                                    </button>
                                </div>
                            </div>
                            
                            {/* Coupon usage */}
                            <div className="mt-6 bg-white rounded-lg shadow p-6">
                                <h2 className="text-sm font-medium text-gray-900 mb-4">
                                    Sử dụng mã giảm giá
                                </h2>
                                <div className="flex flex-col space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giảm giá"
                                        className="w-full border border-gray-200 rounded-md p-2"
                                    />
                                    <button
                                        className="bg-primary text-white font-medium px-4 py-2 rounded-md"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                            {/* Payment methods */}
                            <div className="mt-6 bg-white rounded-lg shadow p-6">
                                <h2 className="text-sm font-medium text-gray-900 mb-4">
                                    Chúng tôi chấp nhận thanh toán qua
                                </h2>
                                <div className="flex items-center space-x-3 flex-wrap gap-2">
                                    <Image
                                        src={VietQRLogo}
                                        alt="Visa"
                                        width={48}
                                        height={48}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
