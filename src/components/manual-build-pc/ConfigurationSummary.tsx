import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { addToCartAndSync } from "@/api/cart";
import { standardizeComponentType } from "@/api/pc-configuration";

interface ConfigurationSummaryProps {
    selectedProducts: { [key: string]: any };
    totalPrice: number;
    totalWattage: number;
    isCompatible: boolean;
    onSaveConfiguration: () => void;
    onExportExcel: () => void;
    isEditMode?: boolean;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
    selectedProducts,
    totalPrice,
    totalWattage,
    isCompatible,
    onSaveConfiguration,
    onExportExcel,
    isEditMode = false, // Default to create mode
}) => {
    const router = useRouter();
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Add all configuration products to cart
    const handleAddToCart = async () => {
        if (Object.keys(selectedProducts).length === 0) {
            toast.error("Vui lòng chọn ít nhất một linh kiện!");
            return;
        }

        if (!isCompatible) {
            toast.error(
                "Không thể thêm cấu hình không tương thích vào giỏ hàng!",
            );
            return;
        }

        try {
            setIsAddingToCart(true);

            const normalizedProducts = Object.entries(selectedProducts).reduce(
                (result, [type, product]) => {
                    const standardType = standardizeComponentType(type);
                    return {
                        ...result,
                        [standardType]: {
                            ...product,
                            componentType: standardType,
                        },
                    };
                },
                {} as Record<string, any>,
            );

            for (const product of Object.values(normalizedProducts) as any[]) {
                if (!product.id) continue;
                await addToCartAndSync(product.id, 1);
            }

            const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
            const newCount = cartItems.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0,
            );

            toast.success(`Đã thêm tất cả linh kiện vào giỏ hàng!`, {
                duration: 3000,
            });
        } catch (error) {
            console.error("Error adding configuration to cart:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (Object.keys(selectedProducts).length === 0) {
            toast.error("Vui lòng chọn ít nhất một linh kiện!");
            return;
        }

        if (!isCompatible) {
            toast.error("Không thể mua cấu hình không tương thích!");
            return;
        }

        try {
            setIsAddingToCart(true);

            for (const product of Object.values(selectedProducts) as any[]) {
                if (!product.id) continue;
                await addToCartAndSync(product.id, 1);
            }

            toast.success(`Đã thêm tất cả linh kiện vào giỏ hàng!`, {
                duration: 1500,
            });

            setTimeout(() => {
                router.push("/cart");
            }, 500);
        } catch (error) {
            console.error("Error processing buy now:", error);
            toast.error("Không thể xử lý yêu cầu. Vui lòng thử lại!");
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <aside className="col-span-2 bg-white p-4 rounded-lg shadow-md sticky top-4 h-fit text-gray-800">
            <h2 className="text-xl font-bold mb-4">Tổng kết cấu hình</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Số linh kiện:</span>
                    <span className="font-medium">
                        {Object.keys(selectedProducts).length}
                    </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Tổng giá:</span>
                    <span className="font-medium text-primary">
                        {new Intl.NumberFormat("vi-VN").format(totalPrice)} đ
                    </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Công suất:</span>
                    <span className="font-medium">{totalWattage} W</span>
                </div>

                {!isCompatible && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        <p className="font-medium">
                            Cảnh báo: Một số linh kiện không tương thích
                        </p>
                        <p>
                            Vui lòng kiểm tra lại cấu hình trước khi tiếp tục.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <button
                        onClick={onSaveConfiguration}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {isEditMode ? "Cập nhật cấu hình" : "Lưu cấu hình"}
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={
                            isAddingToCart ||
                            isCompatible === false ||
                            Object.keys(selectedProducts).length === 0
                        }
                        className="w-full bg-white border border-primary text-primary py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAddingToCart ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary"
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
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Thêm vào giỏ hàng
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleBuyNow}
                        disabled={
                            isAddingToCart ||
                            isCompatible === false ||
                            Object.keys(selectedProducts).length === 0
                        }
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAddingToCart ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Mua ngay
                            </>
                        )}
                    </button>

                    <button
                        onClick={onExportExcel}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        disabled={Object.keys(selectedProducts).length === 0}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Xuất Excel
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ConfigurationSummary;
