import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar, Spinner } from "flowbite-react";
import {
    ShoppingBagIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

interface StaffLayoutProps {
    children: React.ReactNode;
    title: string;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, title }) => {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if user is not logged in
        if (!user) {
            router.push("/login?redirect=/staff");
            return;
        }

        // Normalize the role for case-insensitive comparison
        const userRole = user.role?.toLowerCase();

        // Only allow staff role (not admin)
        if (userRole !== "staff") {
            if (userRole === "admin") {
                toast.error(
                    "Trang này chỉ dành cho nhân viên. Vui lòng truy cập trang quản trị.",
                );
                router.push("/admin");
            } else {
                toast.error("Bạn không có quyền truy cập trang này.");
                router.push("/");
            }
        }
    }, [user, router]);

    // If user data is still loading, show a loading indicator
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="xl" />
                <span className="ml-3">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold text-blue-600">
                        B Store Staff
                    </h2>
                    <p className="text-sm text-gray-600">
                        Xin chào, {user.firstName || "Nhân viên"}
                    </p>
                </div>

                <Sidebar aria-label="Staff sidebar" className="border-0">
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                            <Link href="/staff" passHref>
                                <Sidebar.Item
                                    as="div"
                                    icon={HeroIcon(ChartBarIcon)}
                                    className="hover:bg-gray-100 hover:text-blue-600 cursor-pointer"
                                >
                                    Tổng quan
                                </Sidebar.Item>
                            </Link>
                            <Link href="/staff/orders" passHref>
                                <Sidebar.Item
                                    as="div"
                                    icon={HeroIcon(ShoppingBagIcon)}
                                    className="hover:bg-gray-100 hover:text-blue-600 cursor-pointer"
                                >
                                    Đơn hàng
                                </Sidebar.Item>
                            </Link>
                            <Link href="/staff/customers" passHref>
                                <Sidebar.Item
                                    as="div"
                                    icon={HeroIcon(UsersIcon)}
                                    className="hover:bg-gray-100 hover:text-blue-600 cursor-pointer"
                                >
                                    Khách hàng
                                </Sidebar.Item>
                            </Link>
                            <Link href="/staff/settings" passHref>
                                <Sidebar.Item
                                    as="div"
                                    icon={HeroIcon(Cog6ToothIcon)}
                                    className="hover:bg-gray-100 hover:text-blue-600 cursor-pointer"
                                >
                                    Cài đặt
                                </Sidebar.Item>
                            </Link>
                            <Sidebar.Item
                                icon={HeroIcon(ArrowLeftOnRectangleIcon)}
                                onClick={logout}
                                className="cursor-pointer hover:bg-gray-100 hover:text-blue-600"
                            >
                                Đăng xuất
                            </Sidebar.Item>
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    {title}
                </h1>
                {children}
            </div>
        </div>
    );
};

// Helper function to make HeroIcons compatible with Flowbite
const HeroIcon = (Icon: React.ElementType) => {
    return function IconWrapper() {
        return <Icon className="h-5 w-5" />;
    };
};

export default StaffLayout;
