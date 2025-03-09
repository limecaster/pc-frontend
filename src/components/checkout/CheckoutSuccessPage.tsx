"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircledIcon } from "@radix-ui/react-icons";
// import { generateSlug } from "@/utils/slugify";
import { getOrderDetails } from "@/api/checkout";
import { useSearchParams } from "next/navigation";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    imageUrl?: string;
}

interface CheckoutSuccessComponentProps {
    orderId?: string;
    orderDate?: string;
    orderItems?: OrderItem[];
    shippingAddress?: {
        fullName: string;
        address: string;
        city: string;
        phone: string;
    };
    paymentMethod?: string;
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    total?: number;
    orderNumber?: string;
}

const CheckoutSuccessComponentPage: React.FC<CheckoutSuccessComponentProps> = (props) => {
    const searchParams = useSearchParams();
    const [orderDetails, setOrderDetails] = useState<CheckoutSuccessComponentProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Function to load order details
        const loadOrderDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // First check if we have a saved order in localStorage
                const savedOrder = localStorage.getItem('latestOrder');
                if (savedOrder) {
                    try {
                        const parsedOrder = JSON.parse(savedOrder);
                        // Format the date
                        parsedOrder.orderDate = new Date(parsedOrder.orderDate).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        
                        // Process the order items to ensure they have image/imageUrl
                        const processedItems = parsedOrder.orderItems.map((item: OrderItem) => ({
                            ...item,
                            image: item.image || item.imageUrl || "/products/placeholder.jpg",
                        }));
                        
                        parsedOrder.orderItems = processedItems;
                        setOrderDetails(parsedOrder);
                        
                        // Clear the saved order after using it
                        localStorage.removeItem('latestOrder');
                        setLoading(false);
                        return;
                    } catch (e) {
                        console.error("Error parsing saved order:", e);
                        // Continue to fetch from server if parsing fails
                    }
                }
                
                // If no localStorage data, try to get order ID from URL
                const orderId = searchParams.get('orderId');
                
                if (!orderId) {
                    setError("Không tìm thấy thông tin đơn hàng");
                    setLoading(false);
                    return;
                }
                
                // Fetch order details from server
                const response = await getOrderDetails(orderId);
                
                if (response.success && response.order) {
                    // Transform server response to match expected format
                    const serverOrder: CheckoutSuccessComponentProps = {
                        orderId: response.order.id.toString(),
                        orderNumber: response.order.orderNumber ,
                        orderDate: new Date(response.order.orderDate).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        orderItems: response.order.items.map((item: any) => ({
                            id: item.product.id,
                            name: item.product.name,
                            price: item.subPrice / item.quantity, // Calculate unit price
                            quantity: item.quantity,
                            imageUrl: item.product.imageUrl || "/images/image-placeholer.webp",
                        })),
                        shippingAddress: {
                            fullName: response.order.customer?.fullName || "Khách hàng",
                            address: response.order.deliveryAddress.split(',')[0] || "",
                            city: response.order.deliveryAddress.split(',').slice(1).join(',') || "",
                            phone: response.order.customer?.phoneNumber || "",
                        },
                        paymentMethod: response.order.paymentMethod,
                        subtotal: response.order.total,
                        shippingFee: 0,
                        discount: 0,
                        total: response.order.total
                    };
                    
                    setOrderDetails(serverOrder);
                } else {
                    throw new Error("Invalid server response format");
                }
            } catch (error) {
                console.error("Failed to load order details:", error);
                setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetails();
    }, [searchParams, props]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };
    
    // Show loading state
    if (loading) {
        return (
            <div className="w-full bg-gray-100 py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Show error state
    if (error || !orderDetails) {
        return (
            <div className="w-full bg-gray-100 py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Có lỗi xảy ra
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error || "Không tìm thấy thông tin đơn hàng"}
                        </p>
                        <Link
                            href="/"
                            className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md font-medium"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // Destructure from orderDetails
    const {
        orderId,
        orderDate,
        orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingFee,
        discount,
        total
    } = orderDetails;

    return (
        <div className="w-full bg-gray-100 py-8 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Success Message */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircledIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-600 mb-4 text-center">
                        Cảm ơn bạn đã mua sắm tại B Store. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
                    </p>
                    <div className="bg-gray-200 px-4 py-2 rounded-md text-sm text-gray-900">
                        <span className="font-medium">Mã đơn hàng:</span> {orderId}
                    </div>
                </div>

                {/* Order Details Container */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column - Order Summary */}
                    <div className="w-full lg:w-2/3">
                        {/* Order Information */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin đơn hàng
                            </h2>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Ngày đặt hàng:</span>{" "}
                                    {orderDate}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Trạng thái:</span>{" "}
                                    <span className="text-green-600 font-medium">Đã thanh toán</span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Phương thức thanh toán:</span>{" "}
                                    {paymentMethod}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Thông tin giao hàng
                            </h2>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Người nhận:</span>{" "}
                                    {shippingAddress?.fullName}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Địa chỉ:</span>{" "}
                                    {shippingAddress?.address}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Thành phố:</span>{" "}
                                    {shippingAddress?.city}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Số điện thoại:</span>{" "}
                                    {shippingAddress?.phone}
                                </p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Các bước tiếp theo
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                <li>
                                    Chúng tôi sẽ kiểm tra và xác nhận đơn hàng của bạn.
                                </li>
                                <li>
                                    Bạn sẽ nhận được email xác nhận đơn hàng với các chi tiết.
                                </li>
                                <li>
                                    Đơn hàng sẽ được đóng gói và gửi đi trong vòng 1-2 ngày làm việc.
                                </li>
                                <li>
                                    Bạn sẽ nhận được thông báo khi đơn hàng được gửi đi.
                                </li>
                            </ol>
                        </div>

                        {/* Continue Shopping Button */}
                        <div className="flex justify-center mt-8">
                            <Link
                                href="/products"
                                className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md font-medium transition-colors"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* Right column - Order items and total */}
                    <div className="w-full lg:w-1/3">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Sản phẩm đã mua
                            </h2>
                            <div className="space-y-4">
                                {orderItems?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="w-16 h-16 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.imageUrl || "/products/placeholder.jpg"}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <Link
                                                href={`/product/${item.id}`}
                                                className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>
                                            <span className="mt-1 text-sm text-gray-500">
                                                {item.quantity} x 
                                            </span>
                                            <span className="mt-1 ml-1 text-sm font-medium text-primary">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính:</span>
                                    <span className="font-medium text-primary">{formatCurrency(subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">
                                        {shippingFee === 0
                                            ? "Miễn phí"
                                            : formatCurrency(shippingFee || 0)}
                                    </span>
                                </div>
                                {discount && discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="text-green-600">
                                            -{formatCurrency(discount || 0)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                                    <span className="font-medium text-gray-900">Tổng cộng:</span>
                                    <span className="font-bold text-primary">
                                        {formatCurrency(total || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Need Help */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Bạn cần giúp đỡ?
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi.
                            </p>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span>{" "}
                                    <a href="mailto:support@bstore.com" className="text-primary hover:underline">
                                        support@bstore.com
                                    </a>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Hotline:</span>{" "}
                                    <a href="tel:1900123456" className="text-primary hover:underline">
                                        1900 123 456
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessComponentPage;
