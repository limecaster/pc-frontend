import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BiUser,
    BiPurchaseTag,
    BiHeart,
    BiCog,
    BiLogOut,
} from "react-icons/bi";
import { FaRegAddressCard, FaDesktop } from "react-icons/fa";
import { MdOutlineReviews } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";

const DashboardSidebar = () => {
    const { logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname.startsWith(path);
    };

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        logout();
    };

    const menuItems = [
        {
            name: "Thông tin tài khoản",
            icon: <BiUser className="h-5 w-5" />,
            href: "/dashboard",
            exact: true,
        },
        {
            name: "Thông tin cá nhân",
            icon: <FaRegAddressCard className="h-5 w-5" />,
            href: "/dashboard/profile",
        },
        {
            name: "Đơn hàng của tôi",
            icon: <BiPurchaseTag className="h-5 w-5" />,
            href: "/dashboard/orders",
        },
        {
            name: "Cấu hình PC của tôi",
            icon: <FaDesktop className="h-5 w-5" />,
            href: "/dashboard/pc-configurations",
        },
        {
            name: "Sản phẩm yêu thích",
            icon: <BiHeart className="h-5 w-5" />,
            href: "/dashboard/wishlist",
        },
        {
            name: "Đánh giá của tôi",
            icon: <MdOutlineReviews className="h-5 w-5" />,
            href: "/dashboard/reviews",
        },
        {
            name: "Đổi mật khẩu",
            icon: <BiCog className="h-5 w-5" />,
            href: "/dashboard/change-password",
        },
    ];

    return (
        <div className="flex flex-col w-64 bg-white border-r">
            <div className="py-6 px-4">
                <h2 className="text-2xl font-semibold text-primary">
                    Dashboard
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="px-2 py-4">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.href} className="mb-1">
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-gray-700 rounded-md transition-colors ${
                                        isActive(item.href) &&
                                        (!item.exact || pathname === item.href)
                                            ? "bg-primary text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        <li className="mb-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <BiLogOut className="h-5 w-5 mr-3" />
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default DashboardSidebar;
