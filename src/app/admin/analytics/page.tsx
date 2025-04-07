"use client";

import React, { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartLine,
    faChartPie,
    faBox,
    faExchangeAlt,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import SalesReport from "@/components/admin/analytics/SalesReport";
import UserBehaviorReport from "@/components/admin/analytics/UserBehaviorReport";
import InventoryReport from "@/components/admin/analytics/InventoryReport";
import RefundReport from "@/components/admin/analytics/RefundReport";
import DateRangePicker from "@/components/admin/analytics/DateRangePicker";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function AnalyticsPage() {
    // Default date range: last 30 days with proper time values
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29); // 30 days includes today
    thirtyDaysAgo.setHours(23, 59, 59, 999); // End of that day

    const [dateRange, setDateRange] = useState<{
        startDate: Date;
        endDate: Date;
    }>({
        startDate: thirtyDaysAgo,
        endDate: today,
    });

    const tabs = [
        {
            name: "Báo cáo bán hàng",
            icon: faChartLine,
            component: <SalesReport dateRange={dateRange} />,
        },
        {
            name: "Hành vi người dùng",
            icon: faChartPie,
            component: <UserBehaviorReport dateRange={dateRange} />,
        },
        {
            name: "Kho",
            icon: faBox,
            component: <InventoryReport />,
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Báo cáo và phân tích
                        </h1>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="flex items-center bg-white rounded-lg shadow p-2">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="text-gray-500 mr-2"
                            />
                            <DateRangePicker
                                onChange={setDateRange}
                                value={dateRange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <TabGroup>
                    <TabList className="flex p-1 space-x-1 bg-blue-50 rounded-t-lg">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.name}
                                className={({ selected }) =>
                                    classNames(
                                        "w-full py-3 text-sm font-medium text-center rounded-lg",
                                        "focus:outline-none transition-all duration-200",
                                        selected
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-100",
                                    )
                                }
                            >
                                <div className="flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={tab.icon}
                                        className="mr-2"
                                    />
                                    <span className="hidden md:inline">
                                        {tab.name}
                                    </span>
                                </div>
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels className="p-4">
                        {tabs.map((tab, idx) => (
                            <TabPanel key={idx}>{tab.component}</TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
}
