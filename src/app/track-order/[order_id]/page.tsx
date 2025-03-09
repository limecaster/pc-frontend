"use client";

import React, { useEffect } from "react";
import { notFound } from "next/navigation";
import OrderStatusPage from "@/components/track-order/OrderStatusPage";
import { useParams } from "next/navigation";

// This would typically fetch data from your API
function getOrderData(orderId: string) {
    // For demonstration, we're using mock data
    // In a real application, you would fetch this from your API

    // Simulate API latency
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // Example data for a specific order
    return {
        orderId,
        orderDate: "15/11/2023, 14:30",
        status: "shipped" as const,
        estimatedDeliveryDate: "20/11/2023",
        activities: [
            {
                id: "1",
                status: "Đơn hàng đã được tạo",
                message: "Đơn hàng của bạn đã được đặt thành công.",
                timestamp: "15/11/2023, 14:30",
                isCompleted: true,
            },
            {
                id: "2",
                status: "Đã xác nhận đơn hàng",
                message:
                    "Đơn hàng của bạn đã được xác nhận và đang được xử lý.",
                timestamp: "15/11/2023, 16:45",
                isCompleted: true,
            },
            {
                id: "3",
                status: "Đang đóng gói",
                message:
                    "Đơn hàng của bạn đang được đóng gói chuẩn bị giao cho đơn vị vận chuyển.",
                timestamp: "16/11/2023, 09:20",
                isCompleted: true,
            },
            {
                id: "4",
                status: "Đang vận chuyển",
                message:
                    "Đơn hàng đã được bàn giao cho đơn vị vận chuyển và đang trên đường giao hàng.",
                timestamp: "17/11/2023, 11:30",
                isCompleted: true,
            },
            {
                id: "5",
                status: "Đã giao hàng",
                message: "Đơn hàng đã được giao thành công.",
                timestamp: "",
                isCompleted: false,
            },
        ],
        items: [
            {
                id: "1",
                name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
                price: 17990000,
                quantity: 1,
                image: "/products/rtx4070.jpg",
            },
            {
                id: "2",
                name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
                price: 2190000,
                quantity: 2,
                image: "/products/keyboard.jpg",
            },
        ],
        shippingAddress: {
            fullName: "Nguyễn Văn A",
            address: "123 Đường ABC, Phường XYZ",
            city: "Quận 1, TP. Hồ Chí Minh",
            phone: "0987654321",
        },
        paymentMethod: "VietQR",
        subtotal: 22370000,
        shippingFee: 0,
        total: 22370000,
    };
}

export default function OrderTrackingDetailPage() {
    const params = useParams();
    const orderId = params.order_id as string;

    useEffect(() => {
        document.title = `B Store - Theo dõi đơn hàng #${orderId}`;
    }, [orderId]);

    try {
        const orderData = getOrderData(orderId);
        return <OrderStatusPage {...orderData} />;
    } catch (error) {
        console.error("Error fetching order data:", error);
        notFound();
    }
}
