import React from "react";

interface OrderStatusBadgeProps {
    status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
    status,
}) => {
    // Map the order status to human-readable Vietnamese text and styling
    const getStatusInfo = (statusCode: string) => {
        const statusMap: Record<
            string,
            { text: string; color: string; bgColor: string }
        > = {
            pending_approval: {
                text: "Chờ xác nhận",
                color: "text-yellow-800",
                bgColor: "bg-yellow-100",
            },
            approved: {
                text: "Đã xác nhận",
                color: "text-blue-800",
                bgColor: "bg-blue-100",
            },
            payment_success: {
                text: "Đã thanh toán",
                color: "text-green-800",
                bgColor: "bg-green-100",
            },
            processing: {
                text: "Đang xử lý",
                color: "text-blue-800",
                bgColor: "bg-blue-100",
            },
            shipping: {
                text: "Đang giao hàng",
                color: "text-purple-800",
                bgColor: "bg-purple-100",
            },
            delivered: {
                text: "Đã giao hàng",
                color: "text-green-800",
                bgColor: "bg-green-100",
            },
            completed: {
                text: "Hoàn thành",
                color: "text-green-800",
                bgColor: "bg-green-100",
            },
            cancelled: {
                text: "Đã hủy",
                color: "text-red-800",
                bgColor: "bg-red-100",
            },
            refunded: {
                text: "Đã hoàn tiền",
                color: "text-orange-800",
                bgColor: "bg-orange-100",
            },
            return_requested: {
                text: "Yêu cầu trả hàng",
                color: "text-gray-800",
                bgColor: "bg-gray-200",
            },
        };

        return (
            statusMap[statusCode] || {
                text: statusCode || "Không xác định",
                color: "text-gray-800",
                bgColor: "bg-gray-100",
            }
        );
    };

    const statusInfo = getStatusInfo(status);

    return (
        <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
        >
            {statusInfo.text}
        </span>
    );
};

export default OrderStatusBadge;
