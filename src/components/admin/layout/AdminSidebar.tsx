"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt,
    faBox,
    faUsers,
    faShoppingCart,
    faMoneyBill,
    faChartLine,
    faCog,
    faSignOutAlt,
    faBars,
    faAngleDown,
    faAngleRight,
    faUserShield,
    faTag,
    faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminSidebar } from "@/contexts/AdminSidebarContext";

interface MenuItem {
    title: string;
    path: string;
    icon: any;
    submenu?: MenuItem[];
}

const AdminSidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [expanded, setExpanded] = useState<string | null>(null);
    const { isCollapsed, toggleCollapse } = useAdminSidebar();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Define menu items
    const menuItems: MenuItem[] = [
        {
            title: "Dashboard",
            path: "/admin/dashboard",
            icon: faTachometerAlt,
        },
        {
            title: "Sản phẩm",
            path: "/admin/products",
            icon: faBox,
            submenu: [
                {
                    title: "Danh sách sản phẩm",
                    path: "/admin/products",
                    icon: faBox,
                },
                {
                    title: "Thêm sản phẩm",
                    path: "/admin/products/add",
                    icon: faBox,
                },
                {
                    title: "Danh mục",
                    path: "/admin/products/categories",
                    icon: faBox,
                },
                {
                    title: "Hot Sales", // Add this item
                    path: "/admin/products/hot-sales",
                    icon: faTag,
                },
            ],
        },
        {
            title: "Đơn hàng",
            path: "/admin/orders",
            icon: faShoppingCart,
        },
        {
            title: "Mã giảm giá",
            path: "/admin/discounts",
            icon: faTag,
        },
        {
            title: "Khách hàng",
            path: "/admin/customers",
            icon: faUsers,
        },
        {
            title: "Nhân viên",
            path: "/admin/staff",
            icon: faUserShield,
        },
        {
            title: "Thống kê",
            path: "/admin/analytics",
            icon: faChartLine,
        },
        {
            title: "Nội dung CMS",
            path: "/admin/cms",
            icon: faMoneyBill,
        },
        {
            title: "Cài đặt",
            path: "/admin/settings",
            icon: faCog,
        },
    ];

    const toggleExpanded = (title: string) => {
        if (expanded === title) {
            setExpanded(null);
        } else {
            setExpanded(title);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const handleLogout = () => {
        logout();
    };

    // Modified isActive function to properly handle nested routes
    const isActive = (path: string, item?: MenuItem) => {
        if (pathname === path) {
            return true;
        }

        if (item?.submenu) {
            return pathname === path;
        }

        if (pathname?.startsWith(path) && pathname.length > path.length) {
            const nextChar = pathname.charAt(path.length);
            return nextChar === "/";
        }

        return false;
    };

    return (
        <>
            {/* Mobile menu button - only visible on small screens */}
            <button
                className="fixed top-4 left-4 z-40 md:hidden bg-white text-blue-600 p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-300"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${className} fixed top-0 left-0 h-full z-30 transition-all duration-300 bg-white text-gray-700 shadow-md
                ${isCollapsed ? "w-16" : "w-64"} 
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        {!isCollapsed && (
                            <div>
                                <h2 className="text-xl font-semibold text-blue-600">
                                    B Store
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Admin Portal
                                </p>
                            </div>
                        )}
                        <button
                            onClick={toggleCollapse}
                            className={`p-1 rounded-full hover:bg-gray-100 text-blue-600 ${
                                isCollapsed ? "mx-auto" : ""
                            }`}
                            aria-label={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <FontAwesomeIcon
                                icon={isCollapsed ? faAngleRight : faAngleLeft}
                                className="h-5 w-5"
                            />
                        </button>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex-1 overflow-y-auto py-4 px-2">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.title} className="group">
                                    {item.submenu ? (
                                        <div className="block">
                                            <button
                                                onClick={() =>
                                                    toggleExpanded(item.title)
                                                }
                                                className={`flex items-center rounded-md w-full p-2 ${
                                                    isActive(item.path, item)
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "hover:bg-gray-50 hover:text-blue-600"
                                                } ${
                                                    isCollapsed
                                                        ? "justify-center"
                                                        : "justify-between"
                                                } transition-all duration-200`}
                                            >
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        className={`${isCollapsed ? "text-lg" : "mr-3 text-gray-500 group-hover:text-blue-600"} ${
                                                            isActive(
                                                                item.path,
                                                                item,
                                                            )
                                                                ? "text-blue-600"
                                                                : ""
                                                        }`}
                                                    />
                                                    {!isCollapsed && (
                                                        <span className="text-sm font-medium">
                                                            {item.title}
                                                        </span>
                                                    )}
                                                </div>
                                                {!isCollapsed && (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            expanded ===
                                                            item.title
                                                                ? faAngleDown
                                                                : faAngleRight
                                                        }
                                                        size="sm"
                                                        className="text-gray-400 group-hover:text-blue-600"
                                                    />
                                                )}
                                            </button>
                                            {!isCollapsed &&
                                                expanded === item.title && (
                                                    <ul className="mt-1 pl-4 space-y-1 animated-dropdown">
                                                        {item.submenu.map(
                                                            (subItem) => (
                                                                <li
                                                                    key={
                                                                        subItem.path
                                                                    }
                                                                    className="group"
                                                                >
                                                                    <Link
                                                                        href={
                                                                            subItem.path
                                                                        }
                                                                        className={`flex items-center p-2 rounded-md ${
                                                                            isActive(
                                                                                subItem.path,
                                                                            )
                                                                                ? "bg-blue-50 text-blue-600"
                                                                                : "hover:bg-gray-50 text-gray-600 hover:text-blue-600"
                                                                        } transition-colors duration-200`}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                subItem.icon
                                                                            }
                                                                            className={`mr-3 ${
                                                                                isActive(
                                                                                    subItem.path,
                                                                                )
                                                                                    ? "text-blue-600"
                                                                                    : "text-gray-500"
                                                                            }`}
                                                                        />
                                                                        <span className="text-xs font-medium">
                                                                            {
                                                                                subItem.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.path}
                                            className={`flex items-center rounded-md ${
                                                isActive(item.path, item)
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "hover:bg-gray-50 hover:text-blue-600"
                                            } p-2 ${
                                                isCollapsed
                                                    ? "justify-center"
                                                    : ""
                                            } transition-all duration-200 group`}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`${isCollapsed ? "text-lg" : "mr-3"} ${
                                                    isActive(item.path)
                                                        ? "text-blue-600"
                                                        : "text-gray-500 group-hover:text-blue-600"
                                                }`}
                                            />
                                            {!isCollapsed && (
                                                <span className="text-sm font-medium">
                                                    {item.title}
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Sidebar footer */}
                    <div className="mt-auto border-t border-gray-100 p-4">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 p-2 rounded-md w-full ${
                                isCollapsed ? "justify-center" : ""
                            } group transition-colors duration-200`}
                        >
                            <FontAwesomeIcon
                                icon={faSignOutAlt}
                                className={`${isCollapsed ? "text-lg" : "mr-3"} text-gray-500 group-hover:text-red-600`}
                            />
                            {!isCollapsed && (
                                <span className="text-sm font-medium">
                                    Đăng xuất
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Add global styles for animations */}
            <style jsx global>{`
                .animated-dropdown {
                    animation: slideDown 0.2s ease-out forwards;
                    transform-origin: top center;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: scaleY(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scaleY(1);
                    }
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;
