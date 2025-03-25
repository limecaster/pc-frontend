import React from "react";
import Link from "next/link";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "./types";
import { formatCurrency } from "./utils/cartHelpers";

interface CartItemsProps {
    cartItems: CartItemType[];
    // IMPROVED: Make update function return a Promise for better control flow
    updateQuantity: (id: string, newQuantity: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
}

const CartItems: React.FC<CartItemsProps> = ({
    cartItems,
    updateQuantity,
    removeItem,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Sản phẩm
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Giá tiền
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Tổng
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            quantity={item.quantity}
                            image={item.imageUrl}
                            slug={item.id}
                            stock_quantity={item.stock_quantity}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                            formatCurrency={formatCurrency}
                            // Pass these additional props for price consistency
                            originalPrice={item.originalPrice}
                            discountSource={item.discountSource}
                            discountType={item.discountType}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CartItems;
