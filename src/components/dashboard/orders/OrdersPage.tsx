"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { generateSlug } from "@/utils/slugify";
import { Tooltip } from "@/components/ui/tooltip";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-2023-11001",
      date: "15/11/2023",
      status: "delivered",
      total: 17990000,
      items: [
        {
          id: "1",
          name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
          price: 17990000,
          quantity: 1,
          image: "/products/rtx4070.jpg",
        },
      ],
    },
    {
      id: "2",
      orderNumber: "ORD-2023-10002",
      date: "22/10/2023",
      status: "shipped",
      total: 4380000,
      items: [
        {
          id: "2",
          name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
          price: 2190000,
          quantity: 2,
          image: "/products/keyboard.jpg",
        },
      ],
    },
    {
      id: "3",
      orderNumber: "ORD-2023-09003",
      date: "05/09/2023",
      status: "cancelled",
      total: 3490000,
      items: [
        {
          id: "3",
          name: "Chuột gaming Logitech G502 X PLUS LightForce",
          price: 3490000,
          quantity: 1,
          image: "/products/mouse.jpg",
        },
      ],
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Chờ xác nhận",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "processing":
        return {
          label: "Đang xử lý",
          className: "bg-blue-100 text-blue-800",
        };
      case "shipped":
        return {
          label: "Đang giao hàng",
          className: "bg-indigo-100 text-indigo-800",
        };
      case "delivered":
        return {
          label: "Đã giao hàng",
          className: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: "Không xác định",
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Đơn hàng của tôi
      </h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const { label, className } = getStatusLabel(order.status);
            
            return (
              <div 
                key={order.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="font-medium">{order.orderNumber}</span>
                    <span className="text-gray-500 text-sm ml-4">
                      Ngày đặt: {order.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
                      {label}
                    </span>
                    <Link 
                      href={`/track-order/${order.orderNumber}`} 
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Theo dõi đơn hàng
                    </Link>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <Tooltip content={item.name}>
                            <Link 
                              href={`/product/${item.id}-${generateSlug(item.name)}`} 
                              className="text-sm font-medium text-gray-900 hover:text-primary truncate block"
                            >
                              {item.name}
                            </Link>
                          </Tooltip>
                          <span className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      {order.items.length} sản phẩm
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Tổng tiền:</div>
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Chi tiết
                    </Link>
                    
                    {/* Only show for delivered orders */}
                    {order.status === "delivered" && (
                      <button
                        className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-50"
                      >
                        Đánh giá sản phẩm
                      </button>
                    )}
                    
                    {/* Only show for pending orders */}
                    {order.status === "pending" && (
                      <button
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
