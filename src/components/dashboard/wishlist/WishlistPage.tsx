"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import { Tooltip } from "@/components/ui/tooltip";
import { generateSlug } from "@/utils/slugify";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Card đồ họa MSI GeForce RTX 4070 GAMING X TRIO 12G",
      price: 17990000,
      image: "/products/rtx4070.jpg",
      inStock: true,
    },
    {
      id: "2",
      name: "Bàn phím cơ AKKO 3068B Plus World Tour Tokyo R2",
      price: 2190000,
      image: "/products/keyboard.jpg",
      inStock: true,
    },
    {
      id: "3",
      name: "Chuột gaming Logitech G502 X PLUS LightForce",
      price: 3490000,
      image: "/products/mouse.jpg",
      inStock: false,
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemove = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (id: string) => {
    // This would typically add the item to the cart
    console.log("Add to cart:", id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách yêu thích
      </h1>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full"
            >
              <div className="p-4 flex items-center h-24">
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden border border-gray-100 rounded-md mr-4">
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
                      className="font-medium text-gray-900 hover:text-primary text-sm line-clamp-2"
                    >
                      {item.name}
                    </Link>
                  </Tooltip>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-primary">
                    {formatCurrency(item.price)}
                  </div>
                  <div>
                    {item.inStock ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Hết hàng
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.inStock}
                    className="flex-grow py-1.5 bg-primary text-white text-sm rounded-md 
                    hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 border border-gray-200 text-gray-500 rounded-md hover:bg-gray-100"
                    aria-label="Xóa sản phẩm"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Danh sách yêu thích của bạn đang trống</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
