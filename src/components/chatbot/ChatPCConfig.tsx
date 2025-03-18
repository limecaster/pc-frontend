import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { addMultipleToCart } from "@/api/cart";
import { useRouter, usePathname } from "next/navigation";
import { validateTokenFormat } from "@/api/auth";

export default function ChatbotPCConfig({
    config,
    message,
}: {
    config: any;
    message?: string;
}) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    if (!config) return null;

    const totalPrice = Object.values(config).reduce(
        (sum: number, part: any) => sum + (part.price || 0),
        0,
    );

    const handleAddAllToCart = async () => {
        setIsAddingToCart(true);
        try {
            // Check if user is logged in
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");

                // Redirect to login page with the current path as the returnUrl
                router.push(
                    `/authenticate?returnUrl=${encodeURIComponent(pathname)}`,
                );
                return;
            }

            // Validate token format
            const isValidFormat = validateTokenFormat();
            if (!isValidFormat) {
                console.error("Invalid token format detected");
                // Clear token if it's invalid format
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                toast.error(
                    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!",
                );
                router.push(
                    `/authenticate?returnUrl=${encodeURIComponent(pathname)}`,
                );
                return;
            }

            // Collect all product IDs from the configuration
            const productIds = Object.values(config)
                .filter((part: any) => part.id)
                .map((part: any) => part.id);

            console.log(`Adding ${productIds.length} products to cart`);

            if (productIds.length === 0) {
                throw new Error("No valid products found in the configuration");
            }

            try {
                // Use our API client function
                await addMultipleToCart(productIds);

                // Show success message
                toast.success(`Đã thêm tất cả sản phẩm vào giỏ hàng!`, {
                    duration: 3000,
                });

                // Store the recommended configuration if message is provided
                if (message) {
                    localStorage.setItem(
                        "lastPcConfigRecommendation",
                        JSON.stringify({
                            message,
                            config,
                            timestamp: new Date().toISOString(),
                        }),
                    );
                }

                // Redirect to cart page after successfully adding products
                router.push("/cart");
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Cart error details:", error.message);

                    if (
                        error.message === "Authentication required" ||
                        error.message ===
                            "Authentication failed. Please log in again."
                    ) {
                        // Clear token if it's invalid
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");

                        toast.error(
                            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
                        );

                        // Store current path as returnUrl
                        router.push(
                            `/authenticate?returnUrl=${encodeURIComponent(pathname)}`,
                        );
                    } else {
                        toast.error(
                            `Không thể thêm vào giỏ hàng: ${error.message}`,
                        );
                    }
                } else {
                    toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
                }
            }
        } catch (error) {
            console.error("Error adding products to cart:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2">
                Cấu hình đề xuất
            </h3>
            <div className="space-y-3">
                {Object.entries(config).map(
                    ([partLabel, partData]: [string, any], index) => (
                        <Link
                            href={`/product/${partData["id"]}`}
                            passHref
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {partData["name"]}
                                </span>
                                <span className="text-gray-900 dark:text-white font-semibold">
                                    {partData["price"]?.toLocaleString("vi-VN")}
                                    đ
                                </span>
                            </div>
                        </Link>
                    ),
                )}

                <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-900 dark:text-white font-bold">
                            Tổng
                        </span>
                        <span className="text-primary font-bold text-lg">
                            {totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                    </div>

                    <button
                        onClick={handleAddAllToCart}
                        disabled={isAddingToCart}
                        className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
                    >
                        {isAddingToCart ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Đang thêm...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Thêm vào giỏ hàng
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
