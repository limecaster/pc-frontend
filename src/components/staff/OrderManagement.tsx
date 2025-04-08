import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    TextInput,
    Card,
    Spinner,
    Select,
} from "flowbite-react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/utils/format";
import { getPendingOrders, updateOrderStatus } from "@/api/staff";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import Link from "next/link";

// Updated to match backend response format
interface OrderItem {
    id: number;
    productId: string;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    orderNumber: string;
    customerId: string;
    customer?: {
        id: string;
        firstname?: string;
        lastname?: string;
        email?: string;
        phonenumber?: string;
    };
    guestEmail?: string;
    orderDate: string;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus?: string;
    deliveryAddress: string;
    notes?: string;
    items?: OrderItem[];
    updatedAt?: string;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending_approval");
    const [searchTerm, setSearchTerm] = useState("");
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await getPendingOrders();
            if (response && response.success) {
                setOrders(response.orders || []);
            } else {
                console.error(
                    "Failed to load orders:",
                    response?.message || "Unknown error",
                );
                toast.error("Không thể tải danh sách đơn hàng");
            }
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Lỗi khi tải dữ liệu đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        setIsProcessing(orderId);
        try {
            const response = await updateOrderStatus(orderId, newStatus);
            if (response && response.success) {
                toast.success("Cập nhật trạng thái đơn hàng thành công");

                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order,
                    ),
                );
            } else {
                toast.error("Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Lỗi khi cập nhật trạng thái đơn hàng");
        } finally {
            setIsProcessing(null);
        }
    };

    // Filter orders based on search term and status
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            searchTerm === "" ||
            order.orderNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            String(order.id).includes(searchTerm);

        const matchesStatus =
            filterStatus === "" || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            {/* Search and filter controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-80">
                    <TextInput
                        placeholder="Tìm kiếm theo mã đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-72">
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending_approval">Chờ xác nhận</option>
                        <option value="approved">Đã xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="refunded">Đã hoàn tiền</option>
                    </Select>
                </div>
                <Button onClick={loadOrders} outline>
                    Làm mới
                </Button>
            </div>

            {/* Orders table */}
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <Spinner size="xl" />
                    </div>
                ) : (
                    <Table hoverable>
                        <Table.Head>
                            <Table.HeadCell>Mã đơn hàng</Table.HeadCell>
                            <Table.HeadCell>Ngày đặt</Table.HeadCell>
                            <Table.HeadCell>Khách hàng</Table.HeadCell>
                            <Table.HeadCell>Tổng tiền</Table.HeadCell>
                            <Table.HeadCell>Trạng thái</Table.HeadCell>
                            <Table.HeadCell>Hành động</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {filteredOrders.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell
                                        colSpan={6}
                                        className="text-center py-8"
                                    >
                                        Không có đơn hàng nào phù hợp
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                filteredOrders.map((order) => (
                                    <Table.Row key={order.id}>
                                        <Table.Cell className="font-medium">
                                            <Link
                                                href={`/staff/orders/${order.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                #{order.orderNumber}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {new Date(
                                                order.orderDate,
                                            ).toLocaleDateString("vi-VN")}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {order.customer
                                                ? `${order.customer.firstname || ""} ${order.customer.lastname || ""}`
                                                : order.guestEmail ||
                                                  `Khách hàng #${order.customerId}`}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {formatPrice(order.total)} đ
                                        </Table.Cell>
                                        <Table.Cell>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/staff/orders/${order.id}`}
                                                >
                                                    <Button
                                                        size="xs"
                                                        color="info"
                                                        className="mr-2"
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="xs"
                                                    outline
                                                    color="success"
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            order.id,
                                                            "approved",
                                                        )
                                                    }
                                                    disabled={
                                                        order.status !==
                                                            "pending_approval" ||
                                                        isProcessing ===
                                                            order.id
                                                    }
                                                >
                                                    {isProcessing ===
                                                    order.id ? (
                                                        <div className="mr-2">
                                                            <Spinner size="sm" />
                                                        </div>
                                                    ) : null}
                                                    Xác nhận
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default OrderManagement;
