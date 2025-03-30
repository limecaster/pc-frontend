"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Spinner, Alert } from "flowbite-react";
import { getStaffOrderDetails } from "@/api/staff";
import OrderDetails from "@/components/staff/OrderDetails";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Chi tiết đơn hàng";
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getStaffOrderDetails(orderId);

                // Improve response structure handling
                if (response && response.success) {
                    if (response.order) {
                        // Transform any necessary fields here
                        const orderData = {
                            ...response.order,
                            // If status is missing, set a default value
                            status: response.order.status || "pending_approval",
                            // If order items is undefined, set empty array
                            items: response.order.items || [],
                            // If dates are strings, convert to Date objects
                            orderDate: response.order.orderDate
                                ? new Date(response.order.orderDate)
                                : new Date(),
                            createdAt: response.order.createdAt
                                ? new Date(response.order.createdAt)
                                : undefined,
                            updatedAt: response.order.updatedAt
                                ? new Date(response.order.updatedAt)
                                : undefined,
                            // Ensure customer data is normalized
                            customer: response.order.customer || {
                                id: response.order.customerId,
                                // Use customerName directly rather than non-existent guestName
                                firstname: response.order.customerName
                                    ? response.order.customerName
                                          .split(" ")
                                          .slice(-1)
                                          .join(" ")
                                    : "",
                                lastname: response.order.customerName
                                    ? response.order.customerName
                                          .split(" ")
                                          .slice(0, -1)
                                          .join(" ")
                                    : "",
                                // Use customerEmail directly rather than guestEmail/email
                                email: response.order.customerEmail || "",
                                // Use customerPhone directly rather than guestPhone/phone
                                phoneNumber: response.order.customerPhone || "",
                            },
                        };

                        setOrder(orderData);
                        console.log("Order data loaded:", orderData);
                    } else {
                        console.error(
                            "Missing order property in response:",
                            response,
                        );
                        setError(
                            "Response missing expected order data structure",
                        );
                    }
                } else {
                    console.error("API error response:", response);
                    setError(response?.message || "Error fetching order data");
                }
            } catch (err) {
                console.error("Exception while fetching order details:", err);
                setError("Đã xảy ra lỗi khi tải thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="text-gray-800">
            <div className="mb-6 flex items-center">
                <Button color="light" onClick={handleGoBack} className="mr-4">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Chi tiết đơn hàng{" "}
                    {order?.orderNumber ? `#${order.orderNumber}` : ""}
                </h1>
            </div>

            {error && (
                <Alert color="failure" className="mb-4">
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="flex justify-center items-center p-10">
                    <Spinner size="xl" />
                    <span className="ml-3">Đang tải thông tin đơn hàng...</span>
                </div>
            ) : order ? (
                <OrderDetails order={order} />
            ) : (
                <div className="p-8 text-center bg-white rounded-lg shadow">
                    <p className="text-gray-500">
                        Không tìm thấy thông tin đơn hàng
                    </p>
                </div>
            )}
        </div>
    );
}
