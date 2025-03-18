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
            ],
        },
        {
            title: "Đơn hàng",
            path: "/admin/orders",
            icon: faShoppingCart,
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
            // Exact match - always active
            return true;
        }

        // For top-level items with submenu, don't highlight them based on child paths
        if (item?.submenu) {
            // Only highlight parent if it's exactly the current path
            return pathname === path;
        }

        // For items without submenu or submenu items themselves
        // Check if current path starts with this path AND
        // the next character (if it exists) is a slash
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
                className="fixed top-4 left-4 z-40 md:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
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
                className={`${className} fixed top-0 left-0 h-full z-30 transition-all duration-300 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xl
                ${isCollapsed ? "w-20" : "w-72"} 
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                        {!isCollapsed && (
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                                Admin Panel
                            </h2>
                        )}
                        <button
                            onClick={toggleCollapse}
                            className="p-2 rounded-full hover:bg-slate-700/50 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            aria-label={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <FontAwesomeIcon
                                icon={isCollapsed ? faAngleRight : faAngleDown}
                            />
                        </button>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex-1 overflow-y-auto py-5 px-3">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.title} className="group">
                                    {item.submenu ? (
                                        <div className="block">
                                            <button
                                                onClick={() =>
                                                    toggleExpanded(item.title)
                                                }
                                                className={`flex items-center rounded-lg w-full p-3 ${
                                                    isActive(item.path, item)
                                                        ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-blue-900/30"
                                                        : "hover:bg-slate-700/50 text-slate-200 hover:text-white"
                                                } ${
                                                    isCollapsed
                                                        ? "justify-center"
                                                        : "justify-between"
                                                } transition-all duration-200`}
                                            >
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        className={`${isCollapsed ? "text-lg" : "mr-3 text-blue-400 group-hover:text-blue-300"}`}
                                                    />
                                                    {!isCollapsed && (
                                                        <span className="tracking-wide">
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
                                                        className="text-blue-400 group-hover:text-blue-300 transition-transform duration-200"
                                                    />
                                                )}
                                            </button>
                                            {!isCollapsed &&
                                                expanded === item.title && (
                                                    <ul className="mt-2 space-y-1 pl-4 animated-dropdown">
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
                                                                                ? "bg-blue-600/30 text-blue-300"
                                                                                : "hover:bg-slate-700/30 text-slate-300 hover:text-white"
                                                                        } transition-colors duration-200`}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                subItem.icon
                                                                            }
                                                                            className="mr-3 text-blue-400 group-hover:text-blue-300"
                                                                        />
                                                                        <span className="text-sm">
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
                                            className={`flex items-center rounded-lg ${
                                                isActive(item.path, item)
                                                    ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-md shadow-blue-900/30"
                                                    : "hover:bg-slate-700/50"
                                            } p-3 ${
                                                isCollapsed
                                                    ? "justify-center"
                                                    : ""
                                            } transition-all duration-200 group`}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`${isCollapsed ? "text-lg" : "mr-3"} ${
                                                    isActive(item.path)
                                                        ? "text-white"
                                                        : "text-blue-400 group-hover:text-blue-300"
                                                }`}
                                            />
                                            {!isCollapsed && (
                                                <span className="tracking-wide">
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
                    <div className="mt-auto border-t border-slate-700/50 p-4">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center text-white hover:bg-red-500/20 p-3 rounded-lg w-full ${
                                isCollapsed ? "justify-center" : ""
                            } group transition-colors duration-200`}
                        >
                            <FontAwesomeIcon
                                icon={faSignOutAlt}
                                className={`${isCollapsed ? "text-lg" : "mr-3"} text-red-400 group-hover:text-red-300`}
                            />
                            {!isCollapsed && (
                                <span className="tracking-wide">Đăng xuất</span>
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
