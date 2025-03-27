"use client";

import React, { useEffect } from "react";
import { Card } from "flowbite-react";
import { ShoppingBagIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function StaffDashboard() {
    useEffect(() => {
        document.title = "Tổng quan";
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Tổng quan
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Dashboard Cards */}
                <Card>
                    <div className="flex justify-between">
                        <h5 className="text-sm font-medium text-gray-500">
                            Đơn hàng chờ xác nhận
                        </h5>
                        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-500">
                            Chờ xác nhận từ khách hàng
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between">
                        <h5 className="text-sm font-medium text-gray-500">
                            Đơn hàng đang xử lý
                        </h5>
                        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-500">
                            Đã xác nhận và đang trong quá trình xử lý
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between">
                        <h5 className="text-sm font-medium text-gray-500">
                            Tổng khách hàng
                        </h5>
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-500">
                            Tổng số khách hàng đã đăng ký
                        </p>
                    </div>
                </Card>
            </div>

            <Card className="mt-6">
                <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    Thông báo hệ thống
                </h5>
                <p className="text-gray-500 italic">
                    Không có thông báo nào để hiển thị.
                </p>
            </Card>
        </div>
    );
}
