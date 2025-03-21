import React, { useState, useEffect } from "react";
import { Card, Table, Button, Select, Spinner, Alert } from "flowbite-react";
import Image from "next/image";
import { updateOrderStatus } from "@/api/staff";
import { formatPrice } from "@/utils/format";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import { toast } from "react-hot-toast";

// Updated interface to match actual backend response
interface OrderItem {
    id: number;
    quantity: number;
    subPrice: string; // Changed from price to subPrice and type to string
    product: {
        id: string;
        name: string;
        price: string; // Changed from number to string
        description?: string;
        stockQuantity?: number;
        status?: string;
        category?: string;
        // No imageUrl in the response, will use a default if needed
    };
}

interface OrderDetailsProps {
    order: {
        id: number;
        orderNumber: string;
        customerId: number; // Changed from string to number
        customer?: {
            id: number; // Changed from string to number
            firstname?: string; // Changed from firstName to firstname
            lastname?: string; // Changed from lastName to lastname
            email?: string;
            phoneNumber?: string;
        };
        guestEmail?: string;
        orderDate: string;
        total: string; // Changed from number to string
        status: string;
        paymentMethod: string;
        paymentStatus?: string;
        deliveryAddress: string;
        notes?: string;
        items?: OrderItem[];
        createdAt?: string;
        updatedAt?: string;
    };
    isLoading?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
    order,
    isLoading = false,
}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Set the status once the order is available
    useEffect(() => {
        if (order?.status) {
            setNewStatus(order.status);
        }
    }, [order?.status]);

    // Handle status update
    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === order.status) {
            return;
        }

        // Only allow changing between pending_approval and approved
        if (
            ![OrderStatus.PENDING_APPROVAL, OrderStatus.APPROVED].includes(
                newStatus,
            )
        ) {
            setError("Bạn chỉ có quyền phê duyệt đơn hàng");
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            const response = await updateOrderStatus(order.id, newStatus);
            if (response && response.success) {
                toast.success(
                    `Trạng thái đơn hàng đã được cập nhật thành ${getStatusText(newStatus)}`,
                );
                // You might want to refresh the order data here by calling a parent function
            } else {
                setError("Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
            console.error("Error updating order status:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle direct approval action
    const handleDirectApproval = async () => {
        if (order.status !== OrderStatus.PENDING_APPROVAL) {
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            const response = await updateOrderStatus(
                order.id,
                OrderStatus.APPROVED,
            );
            if (response && response.success) {
                toast.success("Đơn hàng đã được phê duyệt thành công!");
                // Use window.location.reload() to refresh the page and get updated order data
                window.location.reload();
            } else {
                setError("Không thể phê duyệt đơn hàng");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi khi phê duyệt đơn hàng");
            console.error("Error approving order:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusText = (statusCode: string): string => {
        const statusMap: Record<string, string> = {
            pending_approval: "Chờ xác nhận",
            approved: "Đã xác nhận",
            processing: "Đang xử lý",
            shipped: "Đang giao hàng",
            delivered: "Đã giao hàng",
            completed: "Hoàn thành",
            cancelled: "Đã hủy",
            refunded: "Đã hoàn tiền",
        };
        return statusMap[statusCode] || statusCode;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Spinner size="xl" />
                <span className="ml-2">Đang tải thông tin đơn hàng...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">
                    Không tìm thấy thông tin đơn hàng
                </p>
            </div>
        );
    }

    // Format customer name - with better fallback handling
    const customerName = order?.customer
        ? `${order.customer.firstname || ""} ${order.customer.lastname || ""}`.trim() ||
          "Không có tên"
        : "Khách hàng không đăng nhập";

    // Get price as number for calculations - with better error handling
    const getNumericPrice = (
        price: string | number | null | undefined,
    ): number => {
        if (typeof price === "string") return parseFloat(price) || 0;
        if (typeof price === "number") return price;
        return 0;
    };

    // Add description about incomplete data if needed with more specific feedback
    const missingFields = [];
    if (!order?.total || order?.total === "0") missingFields.push("tổng tiền");
    if (!order?.deliveryAddress) missingFields.push("địa chỉ giao hàng");
    if (!order?.paymentMethod) missingFields.push("phương thức thanh toán");
    if (!order?.items || order?.items?.length === 0)
        // Fixed: Added optional chaining
        missingFields.push("danh sách sản phẩm");

    const hasIncompleteData = missingFields.length > 0;
    const incompleteMessage = hasIncompleteData
        ? `Dữ liệu đơn hàng thiếu ${missingFields.join(", ")}. Một số thông tin có thể không hiển thị chính xác.`
        : "";

    // Define the OrderStatus enum at the top of the component
    const OrderStatus = {
        PENDING_APPROVAL: "pending_approval",
        APPROVED: "approved",
        PROCESSING: "processing",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        COMPLETED: "completed",
        CANCELLED: "cancelled",
        REFUNDED: "refunded",
    };

    return (
        <div className="space-y-6">
            {hasIncompleteData && (
                <Alert color="warning" onDismiss={() => {}}>
                    <div className="flex items-center gap-2">
                        <span>{incompleteMessage}</span>
                    </div>
                </Alert>
            )}

            {error && (
                <Alert color="failure" onDismiss={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold">
                        Đơn hàng #{order?.orderNumber || "N/A"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ngày đặt:{" "}
                        {order?.orderDate
                            ? new Date(order.orderDate).toLocaleDateString(
                                  "vi-VN",
                                  {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  },
                              )
                            : "N/A"}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="mr-2">Trạng thái:</span>
                    <OrderStatusBadge status={order?.status || "unknown"} />

                    {/* Add direct approval button when status is pending_approval */}
                    {order?.status === OrderStatus.PENDING_APPROVAL && (
                        <Button
                            color="success"
                            onClick={handleDirectApproval}
                            disabled={isUpdating}
                            className="ml-4 font-medium"
                        >
                            {isUpdating ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Đang phê duyệt...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Phê duyệt đơn hàng
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">
                        Thông tin khách hàng
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Tên:</span>{" "}
                            {customerName}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span>{" "}
                            {order?.customer?.email ||
                                order?.guestEmail ||
                                "Không có"}
                        </p>
                        <p>
                            <span className="font-medium">Số điện thoại:</span>{" "}
                            {order?.customer?.phoneNumber || "Không có"}
                        </p>
                    </div>
                </Card>

                {/* Delivery Information */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">
                        Thông tin giao hàng
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Địa chỉ:</span>{" "}
                            {order?.deliveryAddress || "Không có"}
                        </p>
                        <p>
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {order?.notes || "Không có"}
                        </p>
                    </div>
                </Card>

                {/* Payment Information */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">
                        Thông tin thanh toán
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Phương thức:</span>{" "}
                            {order?.paymentMethod || "Không có"}
                        </p>
                        <p>
                            <span className="font-medium">Trạng thái:</span>{" "}
                            {order?.paymentStatus || "Chưa thanh toán"}
                        </p>
                        <p>
                            <span className="font-medium">Tổng tiền:</span>{" "}
                            <span className="text-primary font-bold">
                                {formatPrice(getNumericPrice(order?.total))} đ
                            </span>
                        </p>
                    </div>
                </Card>

                {/* Status Management */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">
                        Quản lý trạng thái
                    </h2>
                    <div className="space-y-4">
                        {order?.status === OrderStatus.PENDING_APPROVAL && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-yellow-700">
                                            Đơn hàng đang chờ phê duyệt
                                        </p>
                                        <p className="text-sm text-yellow-600">
                                            Bạn có thể phê duyệt đơn hàng này
                                            bằng cách nhấn nút "Phê duyệt đơn
                                            hàng"
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    color="success"
                                    onClick={handleDirectApproval}
                                    disabled={isUpdating}
                                    className="mt-3 w-full md:w-auto"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Spinner
                                                size="sm"
                                                className="mr-2"
                                            />
                                            Đang phê duyệt...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Phê duyệt đơn hàng
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="status"
                                className="block mb-2 text-sm font-medium"
                            >
                                Cập nhật trạng thái
                            </label>
                            <Select
                                id="status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                disabled={isUpdating}
                            >
                                {/* Only show pending_approval and approved options */}
                                <option value={OrderStatus.PENDING_APPROVAL}>
                                    Chờ xác nhận
                                </option>
                                <option value={OrderStatus.APPROVED}>
                                    Đã xác nhận
                                </option>
                            </Select>
                            <p className="mt-2 text-xs text-gray-500">
                                Với vai trò nhân viên, bạn chỉ có thể phê duyệt
                                hoặc giữ đơn hàng ở trạng thái chờ xác nhận
                            </p>
                        </div>

                        <Button
                            color={
                                newStatus === OrderStatus.APPROVED &&
                                order.status === OrderStatus.PENDING_APPROVAL
                                    ? "success"
                                    : "primary"
                            }
                            onClick={handleStatusUpdate}
                            disabled={
                                isUpdating ||
                                newStatus === order.status ||
                                ![
                                    OrderStatus.PENDING_APPROVAL,
                                    OrderStatus.APPROVED,
                                ].includes(newStatus)
                            }
                        >
                            {isUpdating ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Đang cập nhật...
                                </>
                            ) : newStatus === OrderStatus.APPROVED &&
                              order.status === OrderStatus.PENDING_APPROVAL ? (
                                <>
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Phê duyệt đơn hàng
                                </>
                            ) : newStatus === OrderStatus.PENDING_APPROVAL &&
                              order.status === OrderStatus.APPROVED ? (
                                "Đưa về trạng thái chờ xác nhận"
                            ) : (
                                "Cập nhật trạng thái"
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
                {order?.items && order?.items?.length > 0 ? ( // Fixed: Added optional chaining
                    <Table hoverable>
                        <Table.Head>
                            <Table.HeadCell>Sản phẩm</Table.HeadCell>
                            <Table.HeadCell>Đơn giá</Table.HeadCell>
                            <Table.HeadCell>Số lượng</Table.HeadCell>
                            <Table.HeadCell>Thành tiền</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {order.items.map((item) => (
                                <Table.Row key={item.id}>
                                    <Table.Cell>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                                {/* Use a default image or placeholder */}
                                                <svg
                                                    className="h-6 w-6 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {item.product?.name ||
                                                        "Sản phẩm không có tên"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ID:{" "}
                                                    {item.product?.id || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatPrice(
                                            getNumericPrice(
                                                item.product?.price,
                                            ),
                                        )}{" "}
                                        đ
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.quantity || 0}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium">
                                        {formatPrice(
                                            getNumericPrice(item.subPrice),
                                        )}{" "}
                                        đ
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                ) : (
                    <p className="text-gray-500">Không có sản phẩm nào</p>
                )}

                {/* Order Summary */}
                <div className="mt-4 flex justify-end">
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between py-2">
                            <span>Tạm tính:</span>
                            <span>
                                {formatPrice(getNumericPrice(order?.total))} đ
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Phí vận chuyển:</span>
                            <span>0 đ</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold">
                            <span>Tổng cộng:</span>
                            <span className="text-primary">
                                {formatPrice(getNumericPrice(order?.total))} đ
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default OrderDetails;
