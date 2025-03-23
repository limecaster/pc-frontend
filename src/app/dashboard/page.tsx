"use client";
import React, { useEffect } from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const Dashboard = () => {
    useEffect(() => {
        document.title = "Dashboard - B Store";
    }, []);

    return (
        <ProtectedRoute>
            <DashboardOverview />
        </ProtectedRoute>
    );
};

export default Dashboard;
