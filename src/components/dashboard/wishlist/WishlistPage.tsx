"use client";

import React, { useState, useEffect } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import WishlistItem from "./WishlistItem";
import { Loader2 } from "lucide-react";
import { getProductById } from "@/api/product";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";

interface ProductDetails {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
    description: string;
    category: string;
    rating: number;
    stockQuantity: number;
}

const WishlistPage: React.FC = () => {
    const {
        wishlistItems,
        loading: wishlistLoading,
        removeFromWishlist,
    } = useWishlist();
    const [products, setProducts] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
        {},
    );
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const totalPages = Math.ceil(products.length / pageSize) || 1;

    // Fetch detailed product information for each wishlist item
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (wishlistItems.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const productPromises = wishlistItems.map((id) =>
                    getProductById(id),
                );
                const productsData = await Promise.all(productPromises);

                // Filter out any null results (products that couldn't be fetched)
                const validProducts = productsData.filter(
                    (product) => product !== null,
                ) as ProductDetails[];
                setProducts(validProducts);
            } catch (error) {
                console.error("Error fetching product details:", error);
                toast.error("Không thể tải thông tin sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        if (!wishlistLoading) {
            fetchProductDetails();
        }
    }, [wishlistItems, wishlistLoading]);

    const handleRemoveItem = async (productId: string) => {
        try {
            setLoadingStates((prev) => ({ ...prev, [productId]: true }));
            await removeFromWishlist(productId);
            // The WishlistContext will handle updating the wishlist items
        } catch (error) {
            console.error("Error removing item from wishlist:", error);
            toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
        } finally {
            setLoadingStates((prev) => ({ ...prev, [productId]: false }));
        }
    };

    if (wishlistLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-gray-600">
                    Đang tải danh sách yêu thích...
                </p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Danh sách yêu thích
                </h1>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">
                        Bạn chưa có sản phẩm nào trong danh sách yêu thích.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Danh sách yêu thích
            </h1>
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {products
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((product) => (
                            <WishlistItem
                                key={product.id}
                                product={product}
                                onRemove={() => handleRemoveItem(product.id)}
                                isRemoving={loadingStates[product.id] || false}
                            />
                        ))}
                </ul>
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
