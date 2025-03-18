import React, { useState, useEffect } from "react";
import { getUserOrderHistory } from "@/api/checkout";
import { initiateOrderPayment, cancelOrder } from "@/api/order";
import Link from "next/link";
import { useRouter } from "next/navigation";

const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await getUserOrderHistory();
                if (response.success) {
                    setOrders(response.orders);
                } else {
                    setError("Failed to load orders");
                }
            } catch (err) {
                setError("Error fetching orders");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Format currency using Intl.NumberFormat directly
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayment = async (orderId: number) => {
        try {
            // Convert orderId to string to match the API parameter type
            const response = await initiateOrderPayment(orderId.toString());
            if (response.success) {
                // Redirect to payment page
                router.push(
                    response.redirectUrl || `/checkout/payment/${orderId}`,
                );
            } else {
                setError(response.message || "Failed to initiate payment");
            }
        } catch (err) {
            setError("Error initiating payment");
            console.error(err);
        }
    };

    const handleCancel = async (orderId: number) => {
        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            try {
                const response = await cancelOrder(orderId.toString());
                if (response.success) {
                    // Update local orders list
                    setOrders((prev) =>
                        prev.map((order) =>
                            order.id === orderId
                                ? { ...order, status: "cancelled" }
                                : order,
                        ),
                    );
                } else {
                    setError(response.message || "Failed to cancel order");
                }
            } catch (err) {
                setError("Error cancelling order");
                console.error(err);
            }
        }
    };

    // Function to render status badge with Tailwind classes
    const renderStatusBadge = (status: string) => {
        let classes = "px-2 py-1 text-xs font-medium rounded-full";

        switch (status) {
            case "pending_approval":
                classes += " bg-gray-100 text-gray-800 border border-gray-300"; // Outline style
                return <span className={classes}>Chờ xác nhận</span>;
            case "approved":
                classes += " bg-blue-100 text-blue-800"; // Secondary style
                return <span className={classes}>Chờ thanh toán</span>;
            case "payment_success":
                classes += " bg-blue-100 text-blue-800"; // Secondary style
                return <span className={classes}>Đã thanh toán</span>;
            case "processing":
                classes += " bg-indigo-100 text-indigo-800"; // Default style
                return <span className={classes}>Đang xử lý</span>;
            case "shipping":
                classes += " bg-yellow-100 text-yellow-800"; // Default style
                return <span className={classes}>Đang giao hàng</span>;
            case "delivered":
                classes += " bg-green-100 text-green-800"; // Success style
                return <span className={classes}>Đã giao hàng</span>;
            case "cancelled":
                classes += " bg-red-100 text-red-800"; // Destructive style
                return <span className={classes}>Đã hủy</span>;
            default:
                return <span className={classes}>{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                <p className="font-medium">{error}</p>
                <button
                    className="mt-4 text-primary underline"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="py-10 text-center">
                <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
                <Link href="/products" className="text-primary hover:underline">
                    Mua sắm ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                Đơn hàng của bạn
            </h2>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">
                                Mã đơn hàng
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Ngày đặt
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Tổng tiền
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Trạng thái
                            </th>
                            <th scope="col" className="py-3 px-6 text-right">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="bg-white border-b hover:bg-gray-50"
                            >
                                <td className="py-4 px-6 font-medium text-gray-900">
                                    #{order.orderNumber || order.id}
                                </td>
                                <td className="py-4 px-6">
                                    {new Date(
                                        order.orderDate,
                                    ).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="py-4 px-6">
                                    {formatCurrency(order.total)}
                                </td>
                                <td className="py-4 px-6">
                                    {renderStatusBadge(order.status)}
                                </td>
                                <td className="py-4 px-6 text-right space-x-2">
                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        className="font-medium text-blue-600 hover:underline inline-flex items-center mr-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Chi tiết
                                    </Link>

                                    {order.status === "approved" && (
                                        <button
                                            onClick={() =>
                                                handlePayment(order.id)
                                            }
                                            className="font-medium text-green-600 hover:underline inline-flex items-center mr-2"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Thanh toán
                                        </button>
                                    )}

                                    {(order.status === "pending_approval" ||
                                        order.status === "approved") && (
                                        <button
                                            onClick={() =>
                                                handleCancel(order.id)
                                            }
                                            className="font-medium text-red-600 hover:underline inline-flex items-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Hủy
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersList;
