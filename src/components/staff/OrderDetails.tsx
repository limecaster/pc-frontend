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
    imageUrl?: string; // Add optional imageUrl property
    product: {
        id: string;
        name: string;
        price: string; // Changed from number to string
        imageUrl?: string; // Add optional imageUrl property
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

    // Format customer name with improved empty data handling
    const customerName = React.useMemo(() => {
        // Handle completely missing customer object
        if (!order?.customer) {
            if (order?.guestEmail)
                return `Khách vãng lai (${order.guestEmail})`;
            return "Khách hàng không đăng nhập";
        }

        // Handle empty customer data
        const firstName = order.customer.firstname || "";
        const lastName = order.customer.lastname || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (!fullName) {
            if (order.customer.email)
                return `Khách hàng (${order.customer.email})`;
            if (order.customer.id) return `Khách hàng ID: ${order.customer.id}`;
            return "Không có thông tin khách hàng";
        }

        return fullName;
    }, [order?.customer, order?.guestEmail]);

    // Get more detailed missing data info
    const getMissingDataInfo = () => {
        const missing = [];

        // Check for missing customer info
        if (!customerName || customerName === "Không có thông tin khách hàng") {
            missing.push("thông tin khách hàng");
        }

        // Check for empty items
        if (!order?.items || order.items.length === 0) {
            missing.push("danh sách sản phẩm");
        }

        // Check for missing delivery info
        if (!order?.deliveryAddress) {
            missing.push("địa chỉ giao hàng");
        }

        // Check for missing payment info
        if (!order?.paymentMethod) {
            missing.push("phương thức thanh toán");
        }

        // Check for invalid or future date
        if (order?.orderDate) {
            const orderDate = new Date(order.orderDate);
            const now = new Date();
            if (orderDate > now) {
                missing.push("ngày đặt hàng (hiển thị ngày trong tương lai)");
            }
        } else {
            missing.push("ngày đặt hàng");
        }

        return missing;
    };

    const missingDataInfo = getMissingDataInfo();
    const hasIncompleteData = missingDataInfo.length > 0;
    const incompleteMessage = hasIncompleteData
        ? `Dữ liệu đơn hàng thiếu ${missingDataInfo.join(", ")}. Một số thông tin có thể không hiển thị chính xác.`
        : "";

    // Get price as number for calculations - with better error handling
    const getNumericPrice = (
        price: string | number | null | undefined,
    ): number => {
        if (typeof price === "string") return parseFloat(price) || 0;
        if (typeof price === "number") return price;
        return 0;
    };

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

    // Helper function to handle different item structures
    const getProductName = (item: any): string => {
        if (item.product && item.product.name) {
            return item.product.name;
        }
        return item.name || "Sản phẩm không có tên";
    };

    const getProductId = (item: any): string => {
        if (item.product && item.product.id) {
            return item.product.id;
        }
        return item.id || "N/A";
    };

    const getProductPrice = (item: any): string => {
        if (item.product && item.product.price) {
            return item.product.price;
        }
        return item.price || "0";
    };

    const getItemSubPrice = (item: any): string => {
        if (item.subPrice) {
            return item.subPrice;
        }

        // Calculate subPrice if not available
        const quantity = item.quantity || 1;
        const price = getNumericPrice(getProductPrice(item));
        return (price * quantity).toString();
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
                        {order?.customerId && (
                            <p>
                                <span className="font-medium">
                                    ID Khách hàng:
                                </span>{" "}
                                {order.customerId}
                            </p>
                        )}
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
                    <div className="space-y-2 flex flex-col justify-start">
                        <p>
                            <span className="font-medium">Phương thức: </span>
                            {order?.paymentMethod || "PayOS"}
                        </p>
                        <p>
                            <span className="font-medium">
                                Trạng thái đơn hàng:{" "}
                            </span>
                            <OrderStatusBadge
                                status={order?.status || "unknown"}
                            />
                        </p>
                        <p className="mt-2">
                            <span className="font-medium">Tổng tiền: </span>
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
                {order?.items && order?.items?.length > 0 ? (
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
                                                {/* Handle image with type safety */}
                                                {(item as any).imageUrl ||
                                                (item.product as any)
                                                    .imageUrl ? (
                                                    <Image
                                                        src={
                                                            (item as any)
                                                                .imageUrl ||
                                                            (
                                                                item.product as any
                                                            ).imageUrl
                                                        }
                                                        alt={getProductName(
                                                            item,
                                                        )}
                                                        width={48}
                                                        height={48}
                                                        className="h-10 w-10 object-contain"
                                                    />
                                                ) : (
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
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {getProductName(item)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ID: {getProductId(item)}
                                                </p>
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatPrice(
                                            getNumericPrice(
                                                getProductPrice(item),
                                            ),
                                        )}{" "}
                                        đ
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.quantity || 0}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium">
                                        {formatPrice(
                                            getNumericPrice(
                                                getItemSubPrice(item),
                                            ),
                                        )}{" "}
                                        đ
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-500 text-center">
                            Không có sản phẩm nào trong đơn hàng này
                        </p>
                        <p className="text-sm text-gray-400 text-center mt-2">
                            Đơn hàng có thể đang trong quá trình xử lý hoặc có
                            lỗi dữ liệu
                        </p>
                    </div>
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
