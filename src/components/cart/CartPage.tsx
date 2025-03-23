"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CartItem from "./CartItem";
import {
    getCart,
    addMultipleToCart,
    updateCartItemQuantity,
    removeCartItem,
} from "@/api/cart";
import { getProductsStockQuantities } from "@/api/product";
import VietQRLogo from "@/assets/VietQRLogo.png";
import { toast } from "react-hot-toast";
import {
    fetchAutomaticDiscounts,
    Discount,
    validateDiscount,
} from "@/api/discount"; // Added Discount type import
import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

// Helper functions for customer-related operations
const getCurrentCustomerId = async (): Promise<string | undefined> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        // Get user info from localStorage or you could make an API call
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        return userInfo.id?.toString();
    } catch (error) {
        console.error("Error getting customer ID:", error);
        return undefined;
    }
};

const checkIfFirstPurchase = async (): Promise<boolean | undefined> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        return false; // Default to false until we have a proper implementation
    } catch (error) {
        console.error("Error checking if first purchase:", error);
        return undefined;
    }
};

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    slug: string;
    stock_quantity?: number; // Add stock quantity to the interface
}

// Extract cart items section
const CartItems: React.FC<{
    cartItems: CartItem[];
    updateQuantity: (id: string, newQuantity: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
}> = ({ cartItems, updateQuantity, removeItem }) => {
    return (
        <>
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
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                                formatCurrency={(amount: number) =>
                                    new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        maximumFractionDigits: 0,
                                    }).format(amount)
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// Extract order summary section
const CartSummary: React.FC<{
    subtotal: number;
    shippingFee: number;
    totalDiscount: number;
    total: number;
    couponCode: string;
    couponError: string;
    applyingCoupon: boolean;
    handleApplyCoupon: () => void;
    removeCoupon: () => void;
    discount: Discount | null;
    formatCurrency: (amount: number) => string;
    appliedAutomaticDiscounts: Discount[];
    totalAutoDiscountAmount: number;
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    appliedCouponAmount: number;
    automaticDiscounts: Discount[];
    setCouponCode: React.Dispatch<React.SetStateAction<string>>;
    isUsingManualDiscount: boolean; // Add this prop to fix error
}> = ({
    subtotal,
    shippingFee,
    totalDiscount,
    total,
    couponCode,
    couponError,
    applyingCoupon,
    handleApplyCoupon,
    removeCoupon,
    discount,
    formatCurrency,
    appliedAutomaticDiscounts,
    totalAutoDiscountAmount,
    cartItems,
    setCartItems,
    appliedCouponAmount,
    automaticDiscounts,
    setCouponCode,
    isUsingManualDiscount, // Add this to props destructuring
}) => {
    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between text-base text-gray-900">
                    <p>Tạm tính ({cartItems.length} sản phẩm)</p>
                    <p className="text-primary font-medium">
                        {formatCurrency(subtotal)}
                    </p>
                </div>

                <div className="flex justify-between text-base text-gray-900">
                    <p>Phí vận chuyển</p>
                    <p className="text-secondary">
                        {shippingFee === 0
                            ? "Miễn phí"
                            : formatCurrency(shippingFee)}
                    </p>
                </div>

                {appliedAutomaticDiscounts.length > 0 && (
                    <div className="text-green-600 text-sm">
                        <p>Mã giảm giá tự áp dụng:</p>
                        <ul>
                            {appliedAutomaticDiscounts.map((d: Discount) => (
                                <li key={d.id}>- {d.discountCode}</li>
                            ))}
                        </ul>
                        <p>
                            Tổng khuyến mãi tự động:{" "}
                            {formatCurrency(totalAutoDiscountAmount)}
                        </p>
                    </div>
                )}

                {discount && (
                    <div className="flex flex-col text-green-600 text-sm">
                        <div className="flex justify-between">
                            <p>
                                Mã giảm giá: {discount.discountCode}
                                {discount.type === "percentage"
                                    ? ` (${discount.discountAmount}%)`
                                    : ""}
                            </p>
                            <p>- {formatCurrency(appliedCouponAmount)}</p>
                        </div>
                        {discount.targetType === "products" &&
                            discount.productIds && (
                                <p className="text-xs italic mt-1">
                                    Chỉ áp dụng cho sản phẩm:
                                    {discount.targetedProducts?.join(", ") ||
                                        cartItems
                                            .filter((item) =>
                                                discount.productIds?.includes(
                                                    item.id,
                                                ),
                                            )
                                            .map((item) => item.name)
                                            .join(", ")}
                                </p>
                            )}
                    </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-medium">
                    <p className="text-gray-900">Tổng cộng</p>
                    <p className="text-primary font-semibold">
                        {formatCurrency(total)}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <Link
                    href="/checkout"
                    className={`w-full bg-primary py-3 px-4 rounded-md text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center block transition-colors ${
                        cartItems.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                    onClick={(e) => {
                        if (cartItems.length === 0) {
                            e.preventDefault();
                        }
                        localStorage.setItem(
                            "appliedDiscounts",
                            JSON.stringify({
                                discount: isUsingManualDiscount
                                    ? discount
                                    : null,
                                appliedAutomaticDiscounts: isUsingManualDiscount
                                    ? []
                                    : appliedAutomaticDiscounts,
                                manualDiscountAmount: isUsingManualDiscount
                                    ? appliedCouponAmount
                                    : 0,
                                totalAutoDiscountAmount: isUsingManualDiscount
                                    ? 0
                                    : totalAutoDiscountAmount,
                                isUsingManualDiscount,
                            }),
                        );
                    }}
                >
                    Tiến hành thanh toán
                </Link>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Hoặc</p>
                <button
                    onClick={() => setCartItems([])}
                    className="font-medium text-red-600 hover:text-red-800 mt-1 transition-colors"
                >
                    Xóa giỏ hàng
                </button>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                    Sử dụng mã giảm giá
                </h2>

                {!discount ? (
                    <div className="flex flex-col space-y-3">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                className="w-full border border-gray-200 rounded-md p-2"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button
                                className={`bg-primary text-white font-medium px-4 py-2 rounded-md ${
                                    applyingCoupon ? "opacity-70" : ""
                                }`}
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                            >
                                {applyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
                            </button>
                        </div>
                        {couponError && (
                            <p className="text-red-500 text-sm">
                                {couponError}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                            <div>
                                <p className="font-medium text-green-800">
                                    {discount.discountName}
                                </p>
                                <p className="text-sm text-green-600">
                                    {discount.type === "percentage"
                                        ? `Giảm ${discount.discountAmount}%`
                                        : `Giảm ${formatCurrency(
                                              discount.discountAmount,
                                          )}`}
                                </p>
                            </div>
                            <button
                                onClick={removeCoupon}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
                {automaticDiscounts.length > 0 &&
                    automaticDiscounts.length !== 1 && (
                        <div className="mt-4 text-xs text-gray-500">
                            <p className="font-medium mb-1">
                                Các khuyến mãi tự động khác:
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                {automaticDiscounts
                                    .filter(
                                        (d) =>
                                            !appliedAutomaticDiscounts.some(
                                                (ad) => ad.id === d.id,
                                            ),
                                    )
                                    .map((d: Discount) => (
                                        <li key={d.id}>{d.discountName}</li>
                                    ))}
                            </ul>
                        </div>
                    )}
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                    Chúng tôi chấp nhận thanh toán qua
                </h2>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <Image src={VietQRLogo} alt="Visa" width={48} height={48} />
                </div>
            </div>
        </>
    );
};

// Main CartPage
const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [automaticDiscounts, setAutomaticDiscounts] = useState<Discount[]>(
        [],
    );
    const [appliedAutomaticDiscounts, setAppliedAutomaticDiscounts] = useState<
        Discount[]
    >([]);
    const [totalAutoDiscountAmount, setTotalAutoDiscountAmount] =
        useState<number>(0);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [couponError, setCouponError] = useState("");
    const [appliedCouponAmount, setAppliedCouponAmount] = useState(0);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    // Add this state variable to track which discount type is being used
    const [isUsingManualDiscount, setIsUsingManualDiscount] = useState(false);

    // Add this ref to track if an API call is in progress
    const isValidatingRef = React.useRef(false);
    // Add debounce timer ref
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Add state for the confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingManualDiscount, setPendingManualDiscount] = useState<{
        discount: Discount | null;
        discountAmount: number;
        autoAmount: number;
        targetedProducts: CartItem[];
    } | null>(null);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Vui lòng nhập mã giảm giá");
            return;
        }

        try {
            setApplyingCoupon(true);
            setCouponError("");

            // Get product IDs and prices for discount calculation
            const productIds = cartItems.map((item) => item.id);
            const productPrices = cartItems.reduce(
                (map, item) => {
                    map[item.id] = item.price * item.quantity;
                    return map;
                },
                {} as Record<string, number>,
            );

            const orderAmount = subtotal;
            const validationResult = await validateDiscount(
                couponCode,
                orderAmount,
                productIds,
                productPrices,
            );

            if (!validationResult.valid || !validationResult.discount) {
                setCouponError(
                    validationResult.errorMessage || "Mã giảm giá không hợp lệ",
                );
                return;
            }

            // Get discount values from validation result
            const manualDiscount = validationResult.discount;
            const manualDiscountAmount = validationResult.discountAmount || 0;
            const autoDiscountAmount =
                validationResult.automaticDiscountAmount || 0;

            // If the manual discount targets specific products, identify them
            const targetedProducts: CartItem[] = [];
            if (
                manualDiscount.targetType === "products" &&
                manualDiscount.productIds
            ) {
                cartItems.forEach((item) => {
                    if (manualDiscount.productIds?.includes(item.id)) {
                        targetedProducts.push(item);
                    }
                });

                // If no eligible products found, show error
                if (targetedProducts.length === 0) {
                    setCouponError(
                        "Không có sản phẩm nào trong giỏ hàng phù hợp với mã giảm giá này",
                    );
                    setApplyingCoupon(false);
                    return;
                }
            }

            // Check if automatic discount is better than manual discount
            if (autoDiscountAmount > manualDiscountAmount) {
                // Store the pending discount information and show confirmation modal instead of using window.confirm
                setPendingManualDiscount({
                    discount: manualDiscount,
                    discountAmount: manualDiscountAmount,
                    autoAmount: autoDiscountAmount,
                    targetedProducts,
                });
                setShowConfirmModal(true);
                setApplyingCoupon(false);
                return;
            }

            // Apply the manual discount directly if it's better than automatic
            applyManualDiscount(
                manualDiscount,
                manualDiscountAmount,
                targetedProducts,
            );
        } catch (err: any) {
            setCouponError(err.message || "Không thể áp dụng mã giảm giá");
            setDiscount(null);
            setAppliedCouponAmount(0);
        } finally {
            setApplyingCoupon(false);
        }
    };

    // New function to apply the manual discount (extracted from handleApplyCoupon)
    const applyManualDiscount = (
        manualDiscount: Discount,
        manualDiscountAmount: number,
        targetedProducts: CartItem[] = [],
    ) => {
        setDiscount({
            ...manualDiscount,
            targetedProducts:
                targetedProducts.length > 0
                    ? targetedProducts.map((p) => p.name)
                    : undefined,
        });
        setAppliedCouponAmount(manualDiscountAmount);
        setAppliedAutomaticDiscounts([]);
        setTotalAutoDiscountAmount(0);
        setIsUsingManualDiscount(true);

        // Show notification about product-specific discount if applicable
        if (
            targetedProducts.length > 0 &&
            cartItems.length > targetedProducts.length
        ) {
            toast.custom(
                (t) => (
                    <div className="bg-blue-500 p-3 rounded text-white">
                        Mã giảm giá chỉ áp dụng cho:{" "}
                        {targetedProducts.map((p) => p.name).join(", ")}
                    </div>
                ),
                { duration: 5000 },
            );
        } else {
            toast.success(
                `Đã áp dụng mã giảm giá: ${manualDiscount.discountName}`,
            );
        }
    };

    // Function to handle user confirmation from modal
    const handleConfirmManualDiscount = () => {
        if (pendingManualDiscount) {
            const { discount, discountAmount, targetedProducts } =
                pendingManualDiscount;

            // Fix type error: Check that discount is not null before calling applyManualDiscount
            if (discount) {
                applyManualDiscount(discount, discountAmount, targetedProducts);

                toast.custom(
                    (t) => (
                        <div className="bg-amber-500 p-3 rounded text-white">
                            Bạn đã chọn sử dụng mã giảm giá có giá trị thấp hơn
                            khuyến mãi tự động
                        </div>
                    ),
                    { duration: 5000 },
                );
            }
        }
        setShowConfirmModal(false);
        setPendingManualDiscount(null);
    };

    // Function to handle rejection from modal
    const handleKeepAutomaticDiscount = () => {
        if (pendingManualDiscount) {
            const { autoAmount } = pendingManualDiscount;
            toast.success(
                `Đã giữ lại khuyến mãi tự động với mức giảm: ${formatCurrency(autoAmount)}`,
            );
        }
        setShowConfirmModal(false);
        setPendingManualDiscount(null);
    };

    // Check if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    // Load cart items from both sources
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            setError(null);

            try {
                // Always load localStorage cart first for immediate display
                const localCart = loadLocalCart();
                setCartItems(localCart);

                // If authenticated, fetch server cart and merge
                if (isAuthenticated) {
                    const serverCart = await fetchServerCart();
                    if (serverCart && serverCart.length > 0) {
                        const mergedCart = mergeServerAndLocalCarts(
                            serverCart,
                            localCart,
                        );
                        setCartItems(mergedCart);
                        // Save merged cart back to localStorage
                        localStorage.setItem(
                            "cart",
                            JSON.stringify(mergedCart),
                        );
                    } else if (localCart.length > 0) {
                        // Sync local cart to server if server cart is empty
                        await syncLocalCartToServer(localCart);
                    }
                }

                // Fetch latest stock quantities regardless of authentication
                if (localCart.length > 0) {
                    await updateCartItemsStockQuantities(localCart);
                }
            } catch (err) {
                console.error("Error loading cart:", err);
                setError("Failed to load your cart. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [isAuthenticated]);

    // Load cart from localStorage
    const loadLocalCart = (): CartItem[] => {
        if (typeof window === "undefined") return [];
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    };

    // Fetch cart from server
    const fetchServerCart = async (): Promise<CartItem[]> => {
        try {
            const response = await getCart();
            console.log("Server cart response:", response);
            if (response.success && response.cart && response.cart.items) {
                // Transform backend cart format to frontend format
                return response.cart.items.map((item: any) => ({
                    id: item.productId,
                    name: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl, // Assuming this pattern for images
                    slug: item.productId,
                    stock_quantity: item.stock_quantity, // Make sure to include stock quantity
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching cart from server:", error);
            // If there's an authentication error, we'll just use the local cart
            if (
                error instanceof Error &&
                error.message.includes("Authentication")
            ) {
                setIsAuthenticated(false);
            }
            return [];
        }
    };

    // Merge server and local carts
    const mergeServerAndLocalCarts = (
        serverCart: CartItem[],
        localCart: CartItem[],
    ): CartItem[] => {
        const mergedCart = [...serverCart];

        // Add items from local cart that don't exist in server cart or update quantities
        localCart.forEach((localItem) => {
            const serverItemIndex = mergedCart.findIndex(
                (item) => item.id === localItem.id,
            );

            if (serverItemIndex === -1) {
                // Item exists only in local cart, add it
                mergedCart.push(localItem);
            } else {
                // Item exists in both, take the higher quantity
                mergedCart[serverItemIndex].quantity = Math.max(
                    mergedCart[serverItemIndex].quantity,
                    localItem.quantity,
                );
            }
        });

        return mergedCart;
    };

    // Sync local cart to server
    const syncLocalCartToServer = async (localCart: CartItem[]) => {
        if (!isAuthenticated || localCart.length === 0) return;

        try {
            // Extract product IDs from local cart, with duplicates for quantity
            const productIds: string[] = [];
            localCart.forEach((item) => {
                for (let i = 0; i < item.quantity; i++) {
                    productIds.push(item.id);
                }
            });

            await addMultipleToCart(productIds);
        } catch (error) {
            console.error("Error syncing local cart to server:", error);
        }
    };

    // Add this new function to update stock quantities
    const updateCartItemsStockQuantities = async (cartItems: CartItem[]) => {
        try {
            if (!cartItems || cartItems.length === 0) {
                return;
            }

            // Extract product IDs from cart
            const productIds = cartItems.map((item) => item.id);

            // Get latest stock quantities from backend
            const stockQuantities =
                await getProductsStockQuantities(productIds);

            // Only update if we got real data (avoid empty objects)
            if (Object.keys(stockQuantities).length === 0) {
                console.log(
                    "No stock quantity data received, skipping cart update",
                );
                return;
            }

            // Update cart items with latest stock quantities
            const updatedCart = cartItems.map((item) => {
                const latestStock = stockQuantities[item.id];

                // If we have stock info and current quantity exceeds stock
                if (latestStock !== undefined) {
                    const updatedItem = {
                        ...item,
                        stock_quantity: latestStock,
                    };

                    // If current quantity exceeds available stock, adjust it
                    if (item.quantity > latestStock) {
                        updatedItem.quantity = Math.max(1, latestStock);
                        toast.error(
                            `Số lượng sản phẩm "${item.name}" đã được điều chỉnh do hàng tồn kho không đủ.`,
                        );
                    }

                    return updatedItem;
                }

                return item;
            });

            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        } catch (error) {
            console.error("Error updating stock quantities:", error);
            // Don't show error to user, the cart will still work with potentially outdated stock info
        }
    };

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Add this function to recalculate the manual discount when cart changes - with debouncing
    const recalculateManualDiscount = async () => {
        if (!discount || isValidatingRef.current) return;

        try {
            isValidatingRef.current = true;

            // Get product IDs and updated prices with current quantities
            const productIds = cartItems.map((item) => item.id);
            const productPrices = cartItems.reduce(
                (map, item) => {
                    map[item.id] = item.price * item.quantity;
                    return map;
                },
                {} as Record<string, number>,
            );

            const orderAmount = cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            );

            // Re-validate the discount with current cart state
            const validationResult = await validateDiscount(
                discount.discountCode,
                orderAmount,
                productIds,
                productPrices,
            );

            if (
                validationResult.valid &&
                validationResult.discountAmount !== undefined
            ) {
                setAppliedCouponAmount(validationResult.discountAmount);

                // Update targeted products info if needed
                if (discount.targetType === "products" && discount.productIds) {
                    const targetedProducts = cartItems
                        .filter((item) =>
                            discount.productIds?.includes(item.id),
                        )
                        .map((item) => item.name);

                    setDiscount({
                        ...discount,
                        targetedProducts:
                            targetedProducts.length > 0
                                ? targetedProducts
                                : undefined,
                    });
                }
            }
        } catch (error) {
            console.error("Error recalculating manual discount:", error);
        } finally {
            isValidatingRef.current = false;
        }
    };

    // Handle quantity change - update to recalculate discounts
    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        // Find the item to get its stock quantity
        const item = cartItems.find((item) => item.id === id);
        if (!item) return;

        // Check against stock quantity if available
        if (item.stock_quantity !== undefined) {
            // If quantity exceeds stock, set it to either stock_quantity or 1
            if (newQuantity > item.stock_quantity) {
                newQuantity = Math.max(
                    1,
                    Math.min(newQuantity, item.stock_quantity),
                );
                toast.error(
                    `Số lượng tối đa có thể mua là ${item.stock_quantity}`,
                );
            }
        }

        // Update local state
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item,
            ),
        );

        // Sync with server if authenticated
        if (isAuthenticated) {
            try {
                await updateCartItemQuantity(id, newQuantity);
            } catch (error) {
                console.error("Failed to update quantity on server:", error);
                // Optionally show error to user
                toast.error(
                    "Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại sau.",
                );
            }
        }
    };

    // Handle item removal
    const removeItem = async (id: string) => {
        // Update local state
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

        // Sync with server if authenticated
        if (isAuthenticated) {
            try {
                await removeCartItem(id);
            } catch (error) {
                console.error("Failed to remove item from server cart:", error);
                // Optionally show error to user
            }
        }
    };

    // Check for automatic discounts when cart items change
    useEffect(() => {
        const checkForAutomaticDiscounts = async () => {
            // Skip checking if loading or validation in progress
            if (loading || isValidatingRef.current) {
                return;
            }

            // Skip checking automatic discounts if a manual discount is applied
            if (discount !== null) {
                // Instead of immediately recalculating, use debouncing
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                // Set a debounce timer to avoid too many API calls
                debounceTimerRef.current = setTimeout(() => {
                    recalculateManualDiscount();
                }, 500); // 500ms debounce

                return;
            }

            if (cartItems.length === 0) {
                setAutomaticDiscounts([]);
                setAppliedAutomaticDiscounts([]);
                setTotalAutoDiscountAmount(0);
                return;
            }

            // Get product IDs and categories from cart
            const productIds = cartItems.map((item) => item.id);

            // Get customer ID if logged in
            const customerId = isAuthenticated
                ? await getCurrentCustomerId()
                : undefined;

            // Check if this is first purchase
            const isFirstPurchase = isAuthenticated
                ? await checkIfFirstPurchase()
                : undefined;

            // Calculate initial subtotal
            const orderAmount = cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            );

            // Also pass product prices for more accurate discount calculation
            const productPrices = cartItems.reduce(
                (map, item) => {
                    map[item.id] = item.price * item.quantity;
                    return map;
                },
                {} as Record<string, number>,
            );

            // Fetch applicable automatic discounts with enhanced data
            const discountRequest = {
                productIds,
                customerId,
                isFirstPurchase,
                orderAmount,
                productPrices, // Add product prices for better targeting calculation
            };

            const discounts = await fetchAutomaticDiscounts(discountRequest);
            setAutomaticDiscounts(discounts);

            // Only apply automatic discounts if they target the products in the cart
            if (discounts.length > 0) {
                let eligibleDiscounts = discounts.filter((discount) => {
                    // Check if discount is targeted at specific products
                    if (
                        discount.targetType === "products" &&
                        discount.productIds
                    ) {
                        // Only include if at least one product in cart is targeted
                        return discount.productIds.some((id) =>
                            productIds.includes(id),
                        );
                    }
                    return true; // Include non-product targeted discounts
                });

                setAppliedAutomaticDiscounts(eligibleDiscounts);

                // Calculate the total discount amount for automatic discounts
                let sum = 0;
                for (const disc of eligibleDiscounts) {
                    if (disc.targetType === "products" && disc.productIds) {
                        // For product-specific discounts, only apply to matching products
                        const targetedProductIds = disc.productIds.filter(
                            (id) => productIds.includes(id),
                        );

                        // Calculate the subtotal of only the targeted products
                        const targetedSubtotal = cartItems
                            .filter((item) =>
                                targetedProductIds.includes(item.id),
                            )
                            .reduce(
                                (total, item) =>
                                    total + item.price * item.quantity,
                                0,
                            );

                        if (disc.type === "percentage") {
                            sum +=
                                (targetedSubtotal * disc.discountAmount) / 100;
                        } else {
                            sum += Math.min(
                                disc.discountAmount,
                                targetedSubtotal,
                            );
                        }
                    } else {
                        // For non-targeted discounts, apply to entire cart
                        if (disc.type === "percentage") {
                            sum += (orderAmount * disc.discountAmount) / 100;
                        } else {
                            sum += Math.min(disc.discountAmount, orderAmount);
                        }
                    }
                }

                setTotalAutoDiscountAmount(sum);
            } else {
                setAppliedAutomaticDiscounts([]);
                setTotalAutoDiscountAmount(0);
            }
        };

        checkForAutomaticDiscounts();

        // Cleanup function to clear any pending timers
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [cartItems, isAuthenticated, discount, loading]);

    // Calculate totals with the appropriate discount
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );
    const shippingFee = 0; // Free shipping

    // Always respect manual discount choice when present
    const isUsingManualDiscountValue = discount !== null;

    // Update state when the calculation changes
    useEffect(() => {
        setIsUsingManualDiscount(isUsingManualDiscountValue);
    }, [isUsingManualDiscountValue]);

    const totalDiscount = isUsingManualDiscount
        ? appliedCouponAmount
        : totalAutoDiscountAmount;
    const total = subtotal + shippingFee - totalDiscount;

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Empty cart
    const isCartEmpty = cartItems.length === 0;

    // Need to define the removeCoupon function
    const removeCoupon = () => {
        setDiscount(null);
        setCouponCode("");
        setAppliedCouponAmount(0);
        setCouponError("");
        setIsUsingManualDiscount(false);

        // If we have automatic discounts, reapply them after removing manual coupon
        if (automaticDiscounts.length > 0) {
            setAppliedAutomaticDiscounts(automaticDiscounts);
            // Recalculate automatic discount amount
            let sum = 0;
            for (const disc of automaticDiscounts) {
                let amount = 0;
                if (disc.type === "percentage") {
                    amount = (subtotal * disc.discountAmount) / 100;
                } else {
                    amount = Math.min(disc.discountAmount, subtotal);
                }
                sum += amount;
            }
            setTotalAutoDiscountAmount(sum);
        }
    };

    return (
        <div className="w-full bg-gray-100 py-8">
            <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    Giỏ hàng của bạn
                </h1>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">
                            Đang tải giỏ hàng...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-primary hover:underline"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : isCartEmpty ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow p-8">
                        <div className="text-gray-500 text-lg mb-6">
                            Giỏ hàng của bạn đang trống
                        </div>
                        <Link
                            href="/products"
                            className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart items section */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                <CartItems
                                    cartItems={cartItems}
                                    updateQuantity={updateQuantity}
                                    removeItem={removeItem}
                                />
                            </div>

                            {/* Continue Shopping Button */}
                            <div className="mt-6">
                                <Link
                                    href="/products"
                                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>

                        {/* Order summary section */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-lg shadow p-6 top-20 border border-gray-200">
                                <CartSummary
                                    subtotal={subtotal}
                                    shippingFee={shippingFee}
                                    totalDiscount={totalDiscount}
                                    total={total}
                                    couponCode={couponCode}
                                    couponError={couponError}
                                    applyingCoupon={applyingCoupon}
                                    handleApplyCoupon={handleApplyCoupon}
                                    removeCoupon={removeCoupon}
                                    discount={discount}
                                    formatCurrency={formatCurrency}
                                    appliedAutomaticDiscounts={
                                        appliedAutomaticDiscounts
                                    }
                                    totalAutoDiscountAmount={
                                        totalAutoDiscountAmount
                                    }
                                    cartItems={cartItems}
                                    setCartItems={setCartItems}
                                    appliedCouponAmount={appliedCouponAmount}
                                    automaticDiscounts={automaticDiscounts}
                                    setCouponCode={setCouponCode}
                                    isUsingManualDiscount={
                                        isUsingManualDiscount
                                    } // Pass the state variable
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Add the confirmation modal */}
            <Modal
                show={showConfirmModal}
                size="md"
                popup
                onClose={() => setShowConfirmModal(false)}
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
                        <h3 className="mb-5 text-lg font-normal text-gray-700">
                            Mã giảm giá tự động hiện tại giảm{" "}
                            {pendingManualDiscount &&
                                formatCurrency(
                                    pendingManualDiscount.autoAmount,
                                )}
                            , trong khi mã "{couponCode}" chỉ giảm{" "}
                            {pendingManualDiscount &&
                                formatCurrency(
                                    pendingManualDiscount.discountAmount,
                                )}
                            .
                        </h3>
                        <h4 className="mb-5 text-base font-medium text-gray-900">
                            Bạn có chắc chắn muốn áp dụng mã "{couponCode}"
                            không?
                        </h4>
                        <div className="flex justify-center gap-4">
                            <Button
                                color="blue"
                                onClick={handleKeepAutomaticDiscount}
                            >
                                Giữ khuyến mãi tự động
                            </Button>
                            <Button
                                color="warning"
                                onClick={handleConfirmManualDiscount}
                            >
                                Xác nhận dùng mã giảm giá
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CartPage;
