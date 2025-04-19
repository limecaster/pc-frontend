"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faShoppingCart,
    faBell,
    faSignOutAlt,
    faUserCircle,
    faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import SearchBar from "@/components/ui/SearchBar";
import { getLogo } from "@/api/logo";
import { ContentSection } from "@/api/cms";
import { getCart } from "@/api/cart";

// Default logo path to use as fallback
const DEFAULT_LOGO = "/logo.png";

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const userMenuRef = useRef<HTMLDivElement>(null); // For handling clicks outside of user menu

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
        const fetchCart = async () => {
            try {
                const cartItems = await getCart();
                if (cartItems) {
                    setCartCount(cartItems.length);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    // Handle clicks outside of user menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

    const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
    const [logoLink, setLogoLink] = useState<string>("/");

    // Fetch logo from CMS
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const logoData = await getLogo(ContentSection.HEADER);
                if (logoData && logoData.imageUrl) {
                    setLogoUrl(logoData.imageUrl);
                    if (logoData.link) {
                        setLogoLink(logoData.link);
                    }
                }
            } catch (error) {
                console.error("Error loading logo:", error);
                // Keep using the default logo on error
            }
        };

        fetchLogo();
    }, []);

    return (
        <header className="bg-primary shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link href={logoLink} className="flex items-center gap-2">
                    <Image
                        src={logoUrl}
                        alt="B Store Logo"
                        width={40}
                        height={25}
                    />
                    <span className="text-xl font-bold text-white">
                        B Store
                    </span>
                </Link>

                {/* Search Bar - Use the new SearchBar component with autocomplete */}
                <div className="hidden md:block flex-1 max-w-xl mx-6">
                    <SearchBar
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full"
                    />
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center gap-6">
                    {/* User Account */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            className="flex items-center gap-2 focus:outline-none"
                            aria-label="User Account"
                            type="button"
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
                                          user?.firstName || user?.username
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
                                            href="/dashboard"
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
                                            href="/recommendations"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faThumbsUp}
                                                className="mr-2"
                                            />
                                            Sản phẩm gợi ý
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

                    {/* Notifications
                    <Link href="/notifications" className="hidden md:block">
                        <FontAwesomeIcon
                            icon={faBell}
                            className="text-white hover:text-gray-300 transition-colors"
                            size="lg"
                        />
                    </Link> */}

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

            {/* Mobile Search - Also use the new SearchBar component */}
            <div className="md:hidden px-4 py-2">
                <SearchBar placeholder="Tìm kiếm sản phẩm..." />
            </div>
        </header>
    );
};

export default Header;
