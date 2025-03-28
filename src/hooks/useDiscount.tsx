import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
    Discount,
    fetchAutomaticDiscounts,
    validateDiscount,
} from "@/api/discount";
import { CartItem, PendingDiscountData } from "../components/cart/types";
import {
    getCurrentCustomerId,
    checkIfFirstPurchase,
    formatCurrency,
} from "../components/cart/utils/cartHelpers";

interface UseDiscountProps {
    cartItems: CartItem[];
    subtotal: number;
    isAuthenticated: boolean;
    loading: boolean;
    isInitialized?: boolean; // New prop to check cart initialization
}

export function useDiscount({
    cartItems,
    subtotal,
    isAuthenticated,
    loading,
    isInitialized = false,
}: UseDiscountProps) {
    // State for automatic discounts
    const [automaticDiscounts, setAutomaticDiscounts] = useState<Discount[]>(
        [],
    );
    const [appliedAutomaticDiscounts, setAppliedAutomaticDiscounts] = useState<
        Discount[]
    >([]);
    const [totalAutoDiscountAmount, setTotalAutoDiscountAmount] =
        useState<number>(0);

    // State for manual discounts
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [couponError, setCouponError] = useState("");
    const [appliedCouponAmount, setAppliedCouponAmount] = useState(0);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [isUsingManualDiscount, setIsUsingManualDiscount] = useState(false);

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingManualDiscount, setPendingManualDiscount] =
        useState<PendingDiscountData | null>(null);

    // Refs for optimization
    const isValidatingRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastRequestTimeRef = useRef<number>(0);
    const discountProcessingCompleteRef = useRef(false);

    // New state for cart items with discounts applied
    const [discountedCartItems, setDiscountedCartItems] = useState<CartItem[]>(
        [],
    );

    // Calculate total discount based on which type is active
    const totalDiscount = isUsingManualDiscount
        ? appliedCouponAmount
        : totalAutoDiscountAmount;

    // Update isUsingManualDiscount based on discount state
    useEffect(() => {
        setIsUsingManualDiscount(discount !== null);
    }, [discount]);

    // Helper function to get product prices map
    const getProductPricesMap = useCallback(() => {
        return cartItems.reduce(
            (map, item) => {
                map[item.id] = item.price * item.quantity;
                return map;
            },
            {} as Record<string, number>,
        );
    }, [cartItems]);

    // Fetch and process automatic discounts with improved error handling
    const fetchAndProcessAutomaticDiscounts = useCallback(async () => {
        // Skip processing if cart isn't ready or we're already processing
        if (
            loading ||
            !isInitialized ||
            isValidatingRef.current ||
            cartItems.length === 0
        ) {
            return;
        }

        // Throttle requests to avoid too many API calls
        const now = Date.now();
        if (now - lastRequestTimeRef.current < 1000) {
            // No more than once per second
            return;
        }
        lastRequestTimeRef.current = now;

        try {
            isValidatingRef.current = true;

            // Get data needed for discount calculation
            const productIds = cartItems.map((item) => item.id);
            const categoryNames = Array.from(
                new Set(
                    cartItems.flatMap((item) =>
                        item.categoryNames && item.categoryNames.length > 0
                            ? item.categoryNames
                            : item.category
                              ? [item.category]
                              : [],
                    ),
                ),
            );

            const customerId = isAuthenticated
                ? await getCurrentCustomerId()
                : undefined;
            const isFirstPurchase = isAuthenticated
                ? await checkIfFirstPurchase()
                : undefined;
            const productPrices = getProductPricesMap();

            // Call API to get automatic discounts
            const response = await fetchAutomaticDiscounts({
                productIds,
                categoryNames,
                customerId,
                isFirstPurchase,
                orderAmount: subtotal,
                productPrices,
                timestamp: Date.now(),
            });

            const discounts = response.discounts || [];
            setAutomaticDiscounts(discounts);

            if (discounts.length > 0) {
                processAutomaticDiscounts(
                    discounts,
                    productIds,
                    productPrices,
                    subtotal,
                );
            } else {
                setAppliedAutomaticDiscounts([]);
                setTotalAutoDiscountAmount(0);
            }

            // Mark discount processing as complete
            discountProcessingCompleteRef.current = true;
        } catch (error) {
            console.error("Error fetching automatic discounts:", error);
        } finally {
            isValidatingRef.current = false;
        }
    }, [
        cartItems,
        isAuthenticated,
        subtotal,
        loading,
        isInitialized,
        getProductPricesMap,
    ]);

    // Process automatic discounts and calculate amounts
    const processAutomaticDiscounts = (
        discounts: Discount[],
        productIds: string[],
        productPrices: Record<string, number>,
        orderAmount: number,
    ) => {
        // Create a map of original product prices for reference
        const originalPrices = cartItems.reduce(
            (map, item) => {
                map[item.id] = item.originalPrice || item.price;
                return map;
            },
            {} as Record<string, number>,
        );

        // Process discounts to find eligible items and calculate amounts
        const discountsWithTargets = discounts.map((discount) => {
            let eligibleProductIds: string[] = [];
            let totalEligibleAmount = 0;

            // Determine eligible products based on discount target type
            if (discount.targetType === "all") {
                eligibleProductIds = productIds;
                totalEligibleAmount = orderAmount;
            } else if (
                discount.targetType === "products" &&
                discount.productIds
            ) {
                eligibleProductIds = cartItems
                    .filter((item) => discount.productIds?.includes(item.id))
                    .map((item) => item.id);

                // Use original prices for eligible amount calculation
                totalEligibleAmount = cartItems
                    .filter((item) => discount.productIds?.includes(item.id))
                    .reduce(
                        (total, item) =>
                            total +
                            (originalPrices[item.id] || item.price) *
                                item.quantity,
                        0,
                    );
            } else if (
                discount.targetType === "categories" &&
                discount.categoryNames
            ) {
                eligibleProductIds = cartItems
                    .filter((item) => {
                        const itemCategories =
                            item.categoryNames && item.categoryNames.length > 0
                                ? item.categoryNames
                                : item.category
                                  ? [item.category]
                                  : [];

                        return itemCategories.some((cat) =>
                            discount.categoryNames?.some(
                                (discountCat) =>
                                    cat.toLowerCase() ===
                                    discountCat.toLowerCase(),
                            ),
                        );
                    })
                    .map((item) => item.id);

                // Use original prices for eligible amount calculation
                totalEligibleAmount = eligibleProductIds.reduce(
                    (sum, id) =>
                        sum +
                        (originalPrices[id] || 0) *
                            (cartItems.find((item) => item.id === id)
                                ?.quantity || 1),
                    0,
                );
            }

            // Calculate discount amount based on type, but ensure it doesn't exceed the eligible amount
            const calculatedDiscountAmount =
                discount.type === "percentage"
                    ? totalEligibleAmount * (discount.discountAmount / 100)
                    : // For fixed discounts, cap at the total eligible amount to prevent negative values
                      Math.min(discount.discountAmount, totalEligibleAmount);

            return {
                ...discount,
                eligibleProductIds,
                totalEligibleAmount,
                calculatedDiscountAmount,
            };
        });

        // Filter applicable discounts and sort by benefit
        const applicableDiscounts = discountsWithTargets
            .filter(
                (discount) =>
                    discount.eligibleProductIds.length > 0 &&
                    discount.calculatedDiscountAmount > 0,
            )
            .sort(
                (a, b) =>
                    b.calculatedDiscountAmount - a.calculatedDiscountAmount,
            );

        setAppliedAutomaticDiscounts(applicableDiscounts);

        // After calculating the total discount, distribute it among cart items
        distributeDiscountToItems(applicableDiscounts);
    };

    // Distribute discounts to cart items
    const distributeDiscountToItems = useCallback(
        (applicableDiscounts: any[]) => {
            if (!applicableDiscounts.length) return;

            // Create a mutable copy of cart items with original prices
            const updatedCartItems = cartItems.map((item) => ({
                ...item,
                price: item.originalPrice || item.price,
                originalPrice: item.originalPrice || item.price,
                // Clear any previous discount data
                discountAmount: 0,
                discountPercentage: 0,
            }));

            // Group discounts by target type for sequential application
            const orderWideDiscounts = applicableDiscounts.filter(
                (d) => d.targetType === "all",
            );
            const categoryDiscounts = applicableDiscounts.filter(
                (d) => d.targetType === "categories",
            );
            const productDiscounts = applicableDiscounts.filter(
                (d) => d.targetType === "products",
            );

            // Track which items have been processed to avoid double-discounting
            const processedItems = new Set<string>();

            // Process discounts in order of specificity (product → category → order-wide)
            if (productDiscounts.length > 0) {
                applyDiscountsByType(
                    productDiscounts,
                    updatedCartItems,
                    processedItems,
                );
            }

            if (categoryDiscounts.length > 0) {
                applyDiscountsByType(
                    categoryDiscounts,
                    updatedCartItems,
                    processedItems,
                );
            }

            if (orderWideDiscounts.length > 0) {
                applyDiscountsByType(
                    orderWideDiscounts,
                    updatedCartItems,
                    processedItems,
                );
            }

            // Log results for debugging
            const totalDiscount = updatedCartItems.reduce((sum, item) => {
                const originalPrice = item.originalPrice || item.price;
                const discount = (originalPrice - item.price) * item.quantity;
                return sum + discount;
            }, 0);

            updatedCartItems.forEach((item) => {
                const originalPrice = item.originalPrice || item.price;
                const discount = (originalPrice - item.price) * item.quantity;
                const percentOff =
                    originalPrice > 0
                        ? ((originalPrice - item.price) / originalPrice) * 100
                        : 0;
            });

            // Update cart items with the new discounted prices
            setDiscountedCartItems(updatedCartItems);

            // Set this as a consistent discount amount
            setTotalAutoDiscountAmount(Math.round(totalDiscount));
        },
        [cartItems, formatCurrency],
    );

    // Apply discounts to items by type with proper handling for fixed discounts
    const applyDiscountsByType = (
        discounts: any[],
        items: CartItem[],
        processedItems: Set<string>,
    ) => {
        discounts.forEach((discount) => {
            // Calculate which products are eligible for this discount
            let eligibleItems: CartItem[] = [];
            let totalDiscountAmount = 0;

            if (discount.targetType === "all") {
                // All items that haven't been processed yet
                eligibleItems = items.filter(
                    (item) => !processedItems.has(item.id),
                );
            } else if (
                discount.targetType === "products" &&
                discount.productIds
            ) {
                // Only specific products that haven't been processed
                eligibleItems = items.filter(
                    (item) =>
                        discount.productIds.includes(item.id) &&
                        !processedItems.has(item.id),
                );
            } else if (
                discount.targetType === "categories" &&
                discount.categoryNames
            ) {
                // Items in specific categories that haven't been processed
                eligibleItems = items.filter((item) => {
                    if (processedItems.has(item.id)) return false;

                    const itemCategories =
                        item.categoryNames && item.categoryNames.length > 0
                            ? item.categoryNames
                            : item.category
                              ? [item.category]
                              : [];

                    return itemCategories.some(
                        (cat) =>
                            discount.categoryNames?.some(
                                (discountCat: string) =>
                                    cat.toLowerCase() ===
                                    discountCat.toLowerCase(),
                            ) || false,
                    );
                });
            }

            if (eligibleItems.length === 0) return;

            // Calculate total value of eligible items
            const totalEligibleValue = eligibleItems.reduce(
                (sum, item) =>
                    sum + (item.originalPrice || item.price) * item.quantity,
                0,
            );

            if (totalEligibleValue <= 0) return;

            // Calculate how much discount to apply
            if (discount.type === "percentage") {
                totalDiscountAmount =
                    totalEligibleValue * (discount.discountAmount / 100);
            } else {
                // For fixed amount, cap at the eligible amount
                totalDiscountAmount = Math.min(
                    discount.discountAmount,
                    totalEligibleValue,
                );
            }

            // Special handling for fixed amount discounts to distribute it correctly
            if (
                discount.type === "fixed" &&
                (discount.targetType === "categories" ||
                    discount.targetType === "products")
            ) {
                // For fixed category/product discounts, we want to limit how many times it can be applied
                // Here we'll track unique product IDs that should receive the discount
                const uniqueProductIds = new Set(
                    eligibleItems.map((item) => item.id),
                );

                let remainingDiscount = totalDiscountAmount;

                // Tracked applied discounts per item to log details
                const itemDiscounts: Record<string, number> = {};

                // IMPORTANT FIX: For fixed category discounts, apply the discount only once per product
                // regardless of quantity (or limit to a reasonable number)
                const processedProductIds = new Set<string>();

                // First pass: Process each unique product ID once
                uniqueProductIds.forEach((productId) => {
                    if (remainingDiscount <= 0) return;

                    // Find the corresponding item
                    const item = eligibleItems.find(
                        (item) => item.id === productId,
                    );
                    if (!item) return;

                    const itemIndex = items.findIndex(
                        (i) => i.id === productId,
                    );
                    if (itemIndex === -1) return;

                    const originalPrice = item.originalPrice || item.price;

                    // Apply discount to just a SINGLE UNIT, regardless of quantity
                    // This is the key fix - we limit the discount to being applied just once
                    // per unique product, not per quantity unit

                    // Decide how much discount to apply to this product (at most the product price)
                    const discountForThisProduct = Math.min(
                        remainingDiscount,
                        originalPrice,
                    );

                    // Calculate new price after discount
                    const newUnitPrice = Math.max(
                        0,
                        originalPrice - discountForThisProduct,
                    );

                    // Update the item
                    items[itemIndex].price = newUnitPrice;
                    items[itemIndex].originalPrice = originalPrice;
                    items[itemIndex].discountSource = "automatic";
                    items[itemIndex].discountType = "fixed";
                    items[itemIndex].discountAmount = discountForThisProduct;

                    // Track for logging
                    itemDiscounts[item.id] = discountForThisProduct;

                    remainingDiscount -= discountForThisProduct;
                    processedItems.add(item.id);
                    processedProductIds.add(productId);
                });
            }
            // Handle percentage discounts
            else if (discount.type === "percentage") {
                eligibleItems.forEach((item) => {
                    const itemIndex = items.findIndex((i) => i.id === item.id);
                    if (itemIndex === -1) return;

                    const originalPrice = item.originalPrice || item.price;
                    const discountPerUnit =
                        originalPrice * (discount.discountAmount / 100);
                    const newPrice = Math.max(
                        0,
                        originalPrice - discountPerUnit,
                    );

                    items[itemIndex].price = newPrice;
                    items[itemIndex].originalPrice = originalPrice;
                    items[itemIndex].discountSource = "automatic";
                    items[itemIndex].discountType = "percentage";
                    items[itemIndex].discountPercentage =
                        discount.discountAmount;

                    processedItems.add(item.id);
                });
            }
            // Handle order-wide fixed discounts
            else if (
                discount.type === "fixed" &&
                discount.targetType === "all"
            ) {
                const totalValue = eligibleItems.reduce(
                    (sum, item) =>
                        sum +
                        (item.originalPrice || item.price) * item.quantity,
                    0,
                );

                eligibleItems.forEach((item) => {
                    const itemIndex = items.findIndex((i) => i.id === item.id);
                    if (itemIndex === -1) return;

                    const originalPrice = item.originalPrice || item.price;
                    const itemTotalValue = originalPrice * item.quantity;

                    // Calculate proportional discount
                    const itemSharePercent = itemTotalValue / totalValue;
                    const itemDiscountAmount =
                        totalDiscountAmount * itemSharePercent;
                    const discountPerUnit = itemDiscountAmount / item.quantity;
                    const newPrice = Math.max(
                        0,
                        originalPrice - discountPerUnit,
                    );

                    items[itemIndex].price = newPrice;
                    items[itemIndex].originalPrice = originalPrice;
                    items[itemIndex].discountSource = "automatic";
                    items[itemIndex].discountType = "fixed";

                    processedItems.add(item.id);
                });
            }
        });
    };

    // Apply manual discount function
    const applyManualDiscount = useCallback(
        (
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

            // Show appropriate notification
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
        },
        [cartItems.length],
    );

    // Handle apply coupon
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Vui lòng nhập mã giảm giá");
            return;
        }

        try {
            setApplyingCoupon(true);
            setCouponError("");

            const productIds = cartItems.map((item) => item.id);
            const productPrices = getProductPricesMap();

            const validationResult = await validateDiscount(
                couponCode,
                subtotal,
                productIds,
                productPrices,
            );

            if (!validationResult.valid || !validationResult.discount) {
                setCouponError(
                    validationResult.errorMessage || "Mã giảm giá không hợp lệ",
                );
                return;
            }

            // Get discount values
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

            // Check if automatic discount is better
            if (autoDiscountAmount > manualDiscountAmount) {
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

            // Apply the manual discount directly if it's better
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

    // Remove coupon function
    const removeCoupon = useCallback(() => {
        setDiscount(null);
        setCouponCode("");
        setAppliedCouponAmount(0);
        setCouponError("");

        // If we have automatic discounts, reapply them
        if (automaticDiscounts.length > 0) {
            const productPrices = getProductPricesMap();
            processAutomaticDiscounts(
                automaticDiscounts,
                cartItems.map((item) => item.id),
                productPrices,
                subtotal,
            );
        }
    }, [automaticDiscounts, cartItems, subtotal, getProductPricesMap]);

    // Handle confirming manual discount when auto is better
    const handleConfirmManualDiscount = useCallback(() => {
        if (pendingManualDiscount && pendingManualDiscount.discount) {
            const { discount, discountAmount, targetedProducts } =
                pendingManualDiscount;
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
        setShowConfirmModal(false);
        setPendingManualDiscount(null);
    }, [pendingManualDiscount, applyManualDiscount]);

    // Handle keeping automatic discount
    const handleKeepAutomaticDiscount = useCallback(() => {
        if (pendingManualDiscount) {
            toast.success(
                `Đã giữ lại khuyến mãi tự động với mức giảm: ${formatCurrency(pendingManualDiscount.autoAmount)}`,
            );
        }
        setShowConfirmModal(false);
        setPendingManualDiscount(null);
    }, [pendingManualDiscount]);

    // Effect to check for automatic discounts or recalculate manual discount
    useEffect(() => {
        // Skip if cart is not fully initialized or if loading
        if (loading || !isInitialized) {
            return;
        }

        // Use requestAnimationFrame to ensure DOM is fully rendered
        if (typeof window === "undefined") return;

        const frameId = requestAnimationFrame(() => {
            // Skip checking automatic discounts if a manual discount is applied
            if (discount !== null) {
                // Use debouncing for manual discount recalculation
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    recalculateManualDiscount();
                }, 500);

                return;
            }

            fetchAndProcessAutomaticDiscounts();
        });

        // Cleanup function
        return () => {
            cancelAnimationFrame(frameId);

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [
        cartItems,
        isAuthenticated,
        discount,
        loading,
        subtotal,
        isInitialized,
        fetchAndProcessAutomaticDiscounts,
    ]);

    // Recalculate manual discount when cart changes
    const recalculateManualDiscount = async () => {
        if (!discount || isValidatingRef.current) return;

        try {
            isValidatingRef.current = true;

            // Create a copy of cart items for processing
            const workingCartItems = [...cartItems];

            // Identify any free products that need to be preserved
            const freeItems = workingCartItems.filter(
                (item) =>
                    item.price <= 0 &&
                    item.originalPrice &&
                    item.originalPrice > 0,
            );

            const productIds = workingCartItems.map((item) => item.id);
            const productPrices = getProductPricesMap();

            const validationResult = await validateDiscount(
                discount.discountCode,
                subtotal,
                productIds,
                productPrices,
            );

            if (
                validationResult.valid &&
                validationResult.discountAmount !== undefined
            ) {
                // Ensure discount doesn't exceed order total
                const safeDiscountAmount = Math.min(
                    validationResult.discountAmount,
                    subtotal,
                );
                setAppliedCouponAmount(safeDiscountAmount);

                // Update targeted products info if needed
                if (discount.targetType === "products" && discount.productIds) {
                    const targetedProducts = workingCartItems
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

    // Return all necessary state and functions
    return {
        discount,
        automaticDiscounts,
        appliedAutomaticDiscounts,
        totalAutoDiscountAmount,
        couponCode,
        setCouponCode,
        couponError,
        appliedCouponAmount,
        applyingCoupon,
        isUsingManualDiscount,
        totalDiscount,
        showConfirmModal,
        setShowConfirmModal,
        pendingManualDiscount,
        handleApplyCoupon,
        removeCoupon,
        handleConfirmManualDiscount,
        handleKeepAutomaticDiscount,
        formatCurrency,
        isDiscountProcessingComplete: discountProcessingCompleteRef.current,
        discountedCartItems,
    };
}
