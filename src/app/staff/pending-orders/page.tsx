"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PendingOrdersPage from "@/components/staff/PendingOrdersPage";
import { useAuth } from "@/hooks/useAuth";

const StaffPendingOrdersPage: React.FC = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        document.title = "Đơn hàng đang chờ | Staff Dashboard";

        // Check if user is logged in and has staff role
        if (!loading && (!user || user.role !== "staff")) {
            router.push("/login?redirect=/staff/pending-orders");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Only render the page content if user is authenticated and has staff role
    if (!user || user.role !== "staff") {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="bg-red-100 p-6 rounded-lg text-center max-w-md">
                    <h1 className="text-red-600 font-bold text-xl mb-2">
                        Access Denied
                    </h1>
                    <p className="text-gray-700 mb-4">
                        You need staff authorization to access this page.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return <PendingOrdersPage />;
};

export default StaffPendingOrdersPage;
