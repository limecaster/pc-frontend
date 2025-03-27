"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Pagination, Spinner } from "flowbite-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import { useAuth } from "@/contexts/AuthContext";
import { initiateOrderPayment, cancelOrder } from "@/api/order";
import { getUserOrderHistory } from "@/api/checkout";
import { toast } from "react-hot-toast";

interface Order {
    id: string | number;
    orderNumber: string;
    orderDate: string;
    total: number;
    status: string;
    paymentStatus?: string;
    customer?: {
        email: string;
        firstName: string;
        lastName: string;
    };
}

export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [processingPayment, setProcessingPayment] = useState<string | null>(
        null,
    );
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
        null,
    );
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            // Use getUserOrderHistory instead of trackOrder
            const result = await getUserOrderHistory();

            if (result) {
                // The API might return orders directly or nested in a data property
                const orderData = Array.isArray(result)
                    ? result
                    : result.orders || [];
                setOrders(orderData);
                setTotalPages(Math.ceil(orderData.length / 10) || 1);
            } else {
                throw new Error("Failed to load orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Có lỗi xảy ra khi tải danh sách đơn hàng");
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayOrder = async (orderId: string | number) => {
        // Show that we're processing the payment
        setProcessingPayment(orderId.toString());

        try {
            // Get payment data from API
            const result = await initiateOrderPayment(orderId);

            // Check if the response is successful
            if (result && result.success === true) {
                // Check for various response formats

                // Case 1: Complete format with data.checkoutUrl
                if (result.data && result.data.checkoutUrl) {
                    window.location.href = result.data.checkoutUrl;
                    return;
                }

                // Case 2: Direct format where checkoutUrl is at the root level (some APIs return this)
                else if (result.checkoutUrl) {
                    window.location.href = result.checkoutUrl;
                    return;
                }

                // Case 3: Success but need to call another API to get the URL
                else {
                    router.push(`/checkout/direct-pay?orderId=${orderId}`);
                    return;
                }
            } else {
                console.error("Invalid payment response:", result);
                throw new Error("Invalid payment response");
            }
        } catch (err) {
            console.error("Error initiating payment:", err);
            setError("Có lỗi xảy ra khi thanh toán đơn hàng");
            toast.error("Không thể khởi tạo thanh toán, vui lòng thử lại sau");
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleViewOrderDetails = (orderId: string | number) => {
        router.push(`/track-order/${orderId}`);
    };

    const openCancelModal = (order: Order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        const orderId = selectedOrder.id;
        setCancellingOrderId(orderId.toString());

        try {
            const result = await cancelOrder(orderId.toString());

            if (result.success) {
                toast.success("Đơn hàng đã được hủy thành công");
                setShowCancelModal(false);
                // Refresh the order list
                fetchOrders();
            } else {
                toast.error(result.message || "Không thể hủy đơn hàng");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error("Đã xảy ra lỗi khi hủy đơn hàng, vui lòng thử lại sau");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Spinner size="xl" />
                <span className="ml-3">Đang tải đơn hàng...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Đơn hàng của tôi
            </h1>

            {orders.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table hoverable>
                        <Table.Head>
                            <Table.HeadCell>Mã đơn hàng</Table.HeadCell>
                            <Table.HeadCell>Ngày đặt</Table.HeadCell>
                            <Table.HeadCell>Tổng tiền</Table.HeadCell>
                            <Table.HeadCell>Trạng thái</Table.HeadCell>
                            <Table.HeadCell>Thao tác</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {orders.map((order) => (
                                <Table.Row key={order.id} className="bg-white">
                                    <Table.Cell className="font-medium text-gray-900">
                                        {order.orderNumber}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatDate(order.orderDate)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatCurrency(order.total)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <OrderStatusBadge
                                            status={order.status}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleViewOrderDetails(
                                                        order.id,
                                                    )
                                                }
                                                className="text-blue-600 hover:underline font-medium text-sm"
                                            >
                                                Chi tiết
                                            </button>

                                            {order.status === "approved" &&
                                                !order.paymentStatus && (
                                                    <button
                                                        onClick={() =>
                                                            handlePayOrder(
                                                                order.id,
                                                            )
                                                        }
                                                        disabled={
                                                            processingPayment ===
                                                            order.id.toString()
                                                        }
                                                        className="text-green-600 hover:underline font-medium text-sm disabled:opacity-50"
                                                    >
                                                        {processingPayment ===
                                                        order.id.toString()
                                                            ? "Đang xử lý..."
                                                            : "Thanh toán"}
                                                    </button>
                                                )}

                                            {[
                                                "pending_approval",
                                                "approved",
                                            ].includes(order.status) && (
                                                <button
                                                    onClick={() =>
                                                        openCancelModal(order)
                                                    }
                                                    disabled={
                                                        cancellingOrderId ===
                                                        order.id.toString()
                                                    }
                                                    className="text-red-600 hover:underline font-medium text-sm disabled:opacity-50"
                                                >
                                                    {cancellingOrderId ===
                                                    order.id.toString()
                                                        ? "Đang hủy..."
                                                        : "Hủy"}
                                                </button>
                                            )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                showIcons={true}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Bạn chưa có đơn hàng nào</p>
                </div>
            )}

            {/* Cancel Order Modal */}
            {selectedOrder && (
                <CancelOrderModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelOrder}
                    orderNumber={selectedOrder.orderNumber}
                    isLoading={
                        cancellingOrderId === selectedOrder.id.toString()
                    }
                />
            )}
        </div>
    );
}
