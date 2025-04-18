"use client";

import React, { useEffect } from "react";
import { Card } from "flowbite-react";
import { ShoppingBagIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { getPendingOrders } from "@/api/staff";
import Link from "next/link";

export default function StaffDashboard() {
    useEffect(() => {
        document.title = "Tổng quan";
    }, []);

    const [totalOrders, setTotalOrders] = React.useState(0);
    const [totalCustomers, setTotalCustomers] = React.useState(0);

    const prepareData = async () => {
        try {
            const pendingOrders = await getPendingOrders();

            if (!pendingOrders) {
                throw new Error("No pending orders found");
            }
            setTotalOrders(pendingOrders.orders.length);
            const totalCustomers = // Distinct customers from orders
                pendingOrders.orders.reduce((acc: any, order: any) => {
                    if (!acc.includes(order.customerId)) {
                        acc.push(order.customerId);
                    }
                    return acc;
                }, []).length;
            setTotalCustomers(totalCustomers);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setTotalOrders(0);
            setTotalCustomers(0);
        }
    };

    useEffect(() => {
        prepareData();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Tổng quan
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Dashboard Cards */}
                <Card>
                    <Link href="/staff/orders">
                        <div className="flex justify-between">
                            <h5 className="text-sm font-medium text-gray-500">
                                Đơn hàng chờ xác nhận
                            </h5>
                            <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-gray-900">
                                {totalOrders}
                            </p>
                            <p className="text-xs text-gray-500">
                                Chờ xác nhận từ khách hàng
                            </p>
                        </div>
                    </Link>
                </Card>

                <Card>
                    <Link href="/staff/orders">
                        <div className="flex justify-between">
                            <h5 className="text-sm font-medium text-gray-500">
                                Tổng khách hàng
                            </h5>
                            <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-gray-900">
                                {totalCustomers}
                            </p>
                            <p className="text-xs text-gray-500">
                                Tổng số khách hàng cần kiểm tra đơn hàng
                            </p>
                        </div>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
