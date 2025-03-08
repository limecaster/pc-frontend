"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faShoppingCart,
    faBell,
    faSearch,
    faSignOutAlt,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const { user, isAuthenticated, logout } = useAuth();

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
    };

    // Update cart count
    useEffect(() => {
        // Fetch cart items from local storage
        const cartItems = localStorage.getItem("cart");
        if (cartItems) {
            const items = JSON.parse(cartItems);
            const count = items.reduce(
                (acc: number, item: any) => acc + item.quantity,
                0
            );
            setCartCount(count);
        }
    }, []);    

    return (
        <header className="bg-primary shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="B Store Logo"
                        width={40}
                        height={40}
                    />
                    <span className="text-xl font-bold text-white">
                        B Store
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex items-center flex-1 max-w-xl mx-6 relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="absolute right-3 text-gray-400 hover:text-gray-900">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center gap-6">
                    {/* User Account */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 focus:outline-none"
                            onClick={toggleUserMenu}
                        >
                            <FontAwesomeIcon
                                icon={faUser}
                                className="text-white hover:text-gray-300 transition-colors"
                                size="lg"
                            />
                            <span className="hidden md:inline text-sm text-white">
                                {isAuthenticated
                                    ? `Xin chào, ${
                                          user?.firstname || user?.username
                                      }`
                                    : "Tài khoản"}
                            </span>
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/dashboard/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                className="mr-2"
                                            />
                                            Thông tin tài khoản
                                        </Link>
                                        <Link
                                            href="/dashboard/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faBell}
                                                className="mr-2"
                                            />
                                            Đơn hàng của tôi
                                        </Link>
                                        <hr className="my-1" />
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            onClick={handleLogout}
                                        >
                                            <FontAwesomeIcon
                                                icon={faSignOutAlt}
                                                className="mr-2"
                                            />
                                            Đăng xuất
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/authenticate"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/authenticate?tab=register"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            Đăng ký
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <Link href="/notifications" className="hidden md:block">
                        <FontAwesomeIcon
                            icon={faBell}
                            className="text-white hover:text-gray-300 transition-colors"
                            size="lg"
                        />
                    </Link>

                    {/* Shopping Cart */}
                    <Link href="/cart" className="flex items-center gap-1">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faShoppingCart}
                                className="text-white hover:text-gray-300 transition-colors"
                                size="lg"
                            />
                            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        </div>
                        <span className="hidden md:inline text-sm text-white">
                            Giỏ hàng
                        </span>
                    </Link>
                </div>
            </div>

            {/* Mobile Search - Visible only on mobile */}
            <div className="md:hidden px-4 py-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
