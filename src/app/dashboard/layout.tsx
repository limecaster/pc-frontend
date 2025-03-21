"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    PersonIcon,
    ClockIcon,
    CubeIcon,
    HeartIcon,
    ExitIcon,
    HamburgerMenuIcon,
    Cross2Icon,
    DesktopIcon, // Added icon for PC configurations
} from "@radix-ui/react-icons";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, isLoading, logout } = useAuth();

    const navigationItems = [
        {
            name: "Tổng quan",
            href: "/dashboard",
            icon: <HamburgerMenuIcon className="w-4 h-4" />,
        },
        {
            name: "Thông tin tài khoản",
            href: "/dashboard/account",
            icon: <PersonIcon className="w-4 h-4" />,
        },
        {
            name: "Đơn hàng của tôi",
            href: "/dashboard/orders",
            icon: <ClockIcon className="w-4 h-4" />,
        },
        {
            name: "Cấu hình PC của tôi", // Added PC configurations item
            href: "/dashboard/pc-configurations",
            icon: <DesktopIcon className="w-4 h-4" />,
        },
        {
            name: "Sản phẩm đã xem",
            href: "/dashboard/viewed-products",
            icon: <CubeIcon className="w-4 h-4" />,
        },
        {
            name: "Danh sách yêu thích",
            href: "/dashboard/wishlist",
            icon: <HeartIcon className="w-4 h-4" />,
        },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Handle loading and auth states
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2">Đang tải...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // This will be handled by the page components
        // that redirect to login if not authenticated
        return null;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex justify-between items-center bg-white rounded-lg shadow p-4 mb-4">
                        <h2 className="text-lg font-medium text-gray-800">
                            Tài khoản của tôi
                        </h2>
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-500 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <Cross2Icon className="w-5 h-5" />
                            ) : (
                                <HamburgerMenuIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Sidebar Navigation */}
                    <aside
                        className={`lg:w-1/4 ${
                            mobileMenuOpen ? "block" : "hidden"
                        } lg:block`}
                    >
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium mb-6 hidden lg:block text-gray-800">
                                Tài khoản của tôi
                            </h2>
                            <nav className="space-y-1">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                                            pathname === item.href
                                                ? "bg-primary text-white"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="mr-3">
                                            {item.icon}
                                        </span>
                                        {item.name}
                                    </Link>
                                ))}

                                <hr className="my-4 border-gray-200" />

                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <ExitIcon className="w-4 h-4 mr-3" />
                                    Đăng xuất
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-3/4 bg-white rounded-lg shadow p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
