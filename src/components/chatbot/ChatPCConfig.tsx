import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { addMultipleToCart } from "@/api/cart";
import { useRouter, usePathname } from "next/navigation";
import { validateTokenFormat } from "@/api/auth";
import {
    saveConfiguration,
    PCConfiguration,
    formatProductsForApi,
    standardizeComponentType,
} from "@/api/pc-configuration";

// Helper function to map PC component type to a standard category name
const mapComponentTypeToCategory = (componentType: string): string => {
    // Use standardizeComponentType to get a consistent mapping
    return standardizeComponentType(componentType);
};

// Helper function for identifying storage type
function identifyStorageType(product: any): string | null {
    if (!product) return null;

    // Check name for SSD patterns
    if (
        product.name &&
        (product.name.includes("SSD") ||
            product.name.includes("Solid State") ||
            /NVMe|M\.2/.test(product.name))
    ) {
        return "SSD";
    }

    // If it has a type property already
    if (product.type === "SSD") return "SSD";
    if (product.type === "HDD") return "HDD";

    // Check capacity and form factor heuristics
    if (product.formFactor === "M.2" || product.interface?.includes("NVMe")) {
        return "SSD";
    }

    return "HDD";
}

export default function ChatbotPCConfig({
    config,
    message,
}: {
    config: any;
    message?: string;
}) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    if (!config) return null;

    const totalPrice = Object.values(config).reduce(
        (sum: number, part: any) => sum + (part.price || 0),
        0,
    );

    // Format the configuration data for the API
    const formatConfigForApi = (): PCConfiguration => {
        // Ensure the config exists
        if (!config) {
            return {
                name: "Cấu hình từ Chat AI",
                purpose: message || "Cấu hình được đề xuất bởi chatbot",
                products: [],
                totalPrice: 0,
                wattage: 0,
            };
        }

        // Ensure each product has the required properties for proper database storage
        const enrichedConfig = { ...config };

        // Add category and ensure all required fields for each product
        Object.entries(enrichedConfig).forEach(
            ([componentType, productData]: [string, any]) => {
                if (!productData) {
                    console.warn(
                        `Product data for ${componentType} is undefined`,
                    );
                    return;
                }

                // Add proper category based on standardized component type
                productData.category =
                    mapComponentTypeToCategory(componentType);

                // Ensure we have a details object
                if (!productData.details) {
                    productData.details = {};
                }

                // Store original component type info
                productData.details.originalComponentType = componentType;
                productData.details.originalType = componentType;

                // Special handling for storage devices
                if (
                    componentType === "InternalHardDrive" ||
                    componentType === "Storage" ||
                    componentType.includes("HDD") ||
                    componentType.includes("SSD")
                ) {
                    // Identify storage type
                    const storageType = identifyStorageType(productData);

                    // Set the type in details
                    productData.details.type = storageType;
                    productData.details.storageType = storageType;
                }
            },
        );

        // Format the products for API using helper function
        const formattedProducts = formatProductsForApi(enrichedConfig);

        return {
            name: "Cấu hình từ Chat AI",
            purpose: message || "Cấu hình được đề xuất bởi chatbot",
            products: formattedProducts,
            totalPrice: totalPrice,
            wattage: Object.values(config).reduce(
                (sum: number, part: any) => sum + (part?.tdp || 0),
                0,
            ),
        };
    };

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

    // Modified function to handle saving the configuration
    const handleSaveConfiguration = async () => {
        setIsSaving(true);
        try {
            // Check if user is logged in
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để lưu cấu hình!");
                router.push(
                    `/authenticate?returnUrl=${encodeURIComponent(pathname)}`,
                );
                return;
            }

            // Validate token format
            const isValidFormat = validateTokenFormat();
            if (!isValidFormat) {
                console.error("Invalid token format detected");
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

            // Validate configuration data
            if (!config || Object.keys(config).length === 0) {
                toast.error("Không có cấu hình để lưu!");
                return;
            }

            // Format PC configuration data using our new helper function
            const configData = formatConfigForApi();

            // Save configuration using API
            const result = await saveConfiguration(configData);

            // Show success message
            toast.success("Đã lưu cấu hình thành công!", {
                duration: 3000,
            });
        } catch (error) {
            console.error("Error saving configuration:", error);
            toast.error("Không thể lưu cấu hình. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2">
                Cấu hình đề xuất
            </h3>
            <div className="space-y-3">
                {Object.entries(config).map(
                    ([partLabel, partData]: [string, any], index) => {
                        // Get display name for component type
                        const displayType = partLabel;

                        return (
                            <Link
                                href={`/product/${partData["id"]}`}
                                passHref
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="flex flex-col hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {partData["name"]}
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {partData["price"]?.toLocaleString(
                                                "vi-VN",
                                            )}
                                            đ
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {displayType}
                                    </div>
                                </div>
                            </Link>
                        );
                    },
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

                    {/* Update the button section to include save button */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveConfiguration}
                            disabled={isSaving}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
                        >
                            {isSaving ? (
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
                                    Đang lưu...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                        />
                                    </svg>
                                    Lưu cấu hình
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleAddAllToCart}
                            disabled={isAddingToCart}
                            className="flex-1 bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
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
        </div>
    );
}
