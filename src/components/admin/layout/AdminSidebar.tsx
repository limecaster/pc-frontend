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
    faUserShield
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
                { title: "Danh sách sản phẩm", path: "/admin/products", icon: faBox },
                { title: "Thêm sản phẩm", path: "/admin/products/add", icon: faBox },
                { title: "Danh mục", path: "/admin/products/categories", icon: faBox },
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

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(path + "/");
    };

    return (
        <>
            {/* Mobile menu button - only visible on small screens */}
            <button
                className="fixed top-4 left-4 z-40 md:hidden bg-blue-700 text-white p-2 rounded-md"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${className} fixed top-0 left-0 h-full z-30 transition-all duration-300 bg-slate-800 text-white
                ${isCollapsed ? "w-16" : "w-64"} 
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        {!isCollapsed && (
                            <h2 className="text-xl font-bold">Admin Panel</h2>
                        )}
                        <button
                            onClick={toggleCollapse}
                            className="p-1 rounded-full hover:bg-slate-700"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <FontAwesomeIcon icon={isCollapsed ? faAngleRight : faAngleDown} />
                        </button>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.title}>
                                    {item.submenu ? (
                                        <div className="block">
                                            <button
                                                onClick={() => toggleExpanded(item.title)}
                                                className={`flex items-center ${
                                                    isActive(item.path)
                                                        ? "bg-blue-700"
                                                        : "hover:bg-slate-700"
                                                } w-full p-3 ${
                                                    isCollapsed ? "justify-center" : "justify-between"
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        className={`${isCollapsed ? "" : "mr-3"}`}
                                                    />
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                </div>
                                                {!isCollapsed && (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            expanded === item.title
                                                                ? faAngleDown
                                                                : faAngleRight
                                                        }
                                                        size="sm"
                                                    />
                                                )}
                                            </button>
                                            {!isCollapsed && expanded === item.title && (
                                                <ul className="pl-6 mt-1 space-y-1">
                                                    {item.submenu.map((subItem) => (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                href={subItem.path}
                                                                className={`flex items-center p-2 ${
                                                                    isActive(subItem.path)
                                                                        ? "bg-blue-600 rounded-md"
                                                                        : "hover:bg-slate-700 rounded-md"
                                                                }`}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={subItem.icon}
                                                                    className="mr-3"
                                                                />
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.path}
                                            className={`flex items-center ${
                                                isActive(item.path)
                                                    ? "bg-blue-700"
                                                    : "hover:bg-slate-700"
                                            } p-3 ${
                                                isCollapsed ? "justify-center" : ""
                                            }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`${isCollapsed ? "" : "mr-3"}`}
                                            />
                                            {!isCollapsed && <span>{item.title}</span>}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Sidebar footer */}
                    <div className="mt-auto border-t border-slate-700 p-4">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center text-white hover:bg-slate-700 p-2 rounded-md w-full ${
                                isCollapsed ? "justify-center" : ""
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faSignOutAlt}
                                className={`${isCollapsed ? "" : "mr-3"}`}
                            />
                            {!isCollapsed && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
