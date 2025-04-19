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
    // Add state to track items being removed to prevent flickering
    const [removingItems, setRemovingItems] = React.useState<Set<string>>(new Set());

    // Handle removal with optimistic UI update
    const handleRemoveItem = async (id: string) => {
        // Track that this item is being removed
        setRemovingItems(prev => {
            const updated = new Set(prev);
            updated.add(id);
            return updated;
        });

        try {
            // Actually remove the item
            await removeItem(id);
        } catch (error) {
            // If removal fails, remove from tracking set
            setRemovingItems(prev => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        }
    };

    // Filter out items that are marked as being removed
    const visibleItems = cartItems.filter(item => !removingItems.has(item.id));

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
                    {visibleItems.length > 0 ? (
                        visibleItems.map((item) => (
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
                                onRemove={handleRemoveItem}
                                formatCurrency={formatCurrency}
                                originalPrice={item.originalPrice}
                                discountSource={item.discountSource}
                                discountType={item.discountType}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500">
                                Giỏ hàng trống
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CartItems;
