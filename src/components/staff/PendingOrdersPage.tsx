import React, { useEffect, useState } from "react";
import { getPendingApprovalOrders, approveOrder } from "@/api/staff";
import { formatCurrency } from "@/utils/format";
import { toast } from "react-hot-toast";

interface OrderItem {
    id: number;
    quantity: number;
    subPrice: number;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
}

interface Order {
    id: number;
    orderNumber: string;
    total: number;
    orderDate: string;
    deliveryAddress: string;
    status: string;
    customerId: number;
    items: OrderItem[];
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
    };
}

const PendingOrdersPage: React.FC = () => {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingOrderId, setProcessingOrderId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getPendingApprovalOrders();

                if (response.success) {
                    setPendingOrders(response.orders);
                } else {
                    setError("Failed to load pending orders");
                }
            } catch (err) {
                setError("Error fetching pending orders");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingOrders();
    }, []);

    const handleApproveOrder = async (orderId: number) => {
        try {
            setProcessingOrderId(orderId);
            const response = await approveOrder(orderId.toString());

            if (response.success) {
                toast.success("Order approved successfully");

                // Remove the approved order from the list of pending orders
                setPendingOrders((prev) =>
                    prev.filter((order) => order.id !== orderId),
                );
            } else {
                toast.error(response.message || "Failed to approve order");
            }
        } catch (error) {
            console.error("Error approving order:", error);
            toast.error("Error approving order");
        } finally {
            setProcessingOrderId(null);
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
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Pending Orders</h1>

            {pendingOrders.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-center text-gray-500">
                        No pending orders found.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white p-6 rounded-lg shadow"
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Order #{order.orderNumber || order.id}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            order.orderDate,
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        -{" "}
                                        {new Date(
                                            order.orderDate,
                                        ).toLocaleTimeString("vi-VN")}
                                    </p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending Approval
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h3 className="font-medium mb-2">
                                    Customer Information
                                </h3>
                                <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {order.customer?.firstName}{" "}
                                    {order.customer?.lastName}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {order.customer?.email}
                                </p>
                                {order.customer?.phoneNumber && (
                                    <p>
                                        <span className="font-medium">
                                            Phone:
                                        </span>{" "}
                                        {order.customer.phoneNumber}
                                    </p>
                                )}
                                <p>
                                    <span className="font-medium">
                                        Delivery Address:
                                    </span>{" "}
                                    {order.deliveryAddress}
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h3 className="font-medium mb-2">
                                    Order Items
                                </h3>
                                <div className="space-y-2">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between"
                                        >
                                            <span>
                                                {item.product.name} x{" "}
                                                {item.quantity}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(item.subPrice)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleApproveOrder(order.id)}
                                    disabled={processingOrderId === order.id}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {processingOrderId === order.id ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        "Approve Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingOrdersPage;
