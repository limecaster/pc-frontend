import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ShoppingBagIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffSidebar } from "@/contexts/StaffSidebarContext";
import { useAuth } from "@/contexts/AuthContext";

const StaffSidebar: React.FC = () => {
    const { isCollapsed, toggleSidebar } = useStaffSidebar();
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const menuItems = [
        {
            title: "Đơn hàng",
            icon: <ShoppingBagIcon className="h-5 w-5" />,
            path: "/staff/orders",
        },
        {
            title: "Câu hỏi FAQ",
            icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
            path: "/staff/faq",
        },
    ];

    const isActive = (path: string) => {
        if (path === "/staff") {
            return pathname === "/staff";
        }
        return pathname?.startsWith(path);
    };

    return (
        <div
            className={`bg-white h-screen shadow-md transition-all duration-300 ${
                isCollapsed ? "w-16" : "w-64"
            } fixed left-0 top-0 z-40`}
        >
            <div className="flex items-center justify-between border-b p-4">
                {!isCollapsed && (
                    <div>
                        <h2 className="text-xl font-semibold text-blue-600">
                            B Store
                        </h2>
                        <p className="text-xs text-gray-500">Staff Portal</p>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className={`p-1 rounded-full hover:bg-gray-100 ${
                        isCollapsed ? "mx-auto" : ""
                    }`}
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                        <ChevronLeftIcon className="h-5 w-5 text-blue-600" />
                    )}
                </button>
            </div>

            <div className="p-2 space-y-1">
                {menuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                        <div
                            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                isActive(item.path)
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            } ${isCollapsed ? "justify-center" : "justify-start"}`}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="ml-3 text-sm font-medium">
                                    {item.title}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}

                <button
                    onClick={() => logout()}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full ${
                        isCollapsed ? "justify-center" : "justify-start"
                    }`}
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                            Đăng xuất
                        </span>
                    )}
                </button>
            </div>

            {!isCollapsed && (
                <div className="absolute bottom-0 p-4 border-t w-full">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-50 rounded-full p-2">
                            <span className="text-blue-600 font-semibold">
                                {(user?.firstName?.[0] || "") +
                                    (user?.lastName?.[0] || "S")}
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName || ""} {user?.lastName || ""}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || ""}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffSidebar;
