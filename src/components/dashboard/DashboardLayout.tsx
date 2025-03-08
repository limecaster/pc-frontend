"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountPage from "./account/AccountPage";
import OverviewPage from "./overview/OverviewPage";

const DashboardLayout = () => {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid grid-cols-2 mb-8">
                    <TabsTrigger value="overview" className="text-sm">
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="account" className="text-sm">
                        Tài khoản
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <OverviewPage />
                </TabsContent>

                <TabsContent value="account">
                    <AccountPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DashboardLayout;
