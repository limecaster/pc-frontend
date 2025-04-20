import {
    useState,
    useEffect,
    useRef,
    useCallback,
    Dispatch,
    SetStateAction,
} from "react";
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
    isInitialized?: boolean;
    couponCode?: string;
    setCouponCode?: Dispatch<SetStateAction<string>>;
}

export function useDiscount({
    cartItems,
    subtotal,
    isAuthenticated,
    loading,
    isInitialized = false,
    couponCode: externalCouponCode = "",
    setCouponCode: externalSetCouponCode,
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
    const [couponCode, setCouponCode] = useState(externalCouponCode);
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [couponError, setCouponError] = useState("");
    const [appliedCouponAmount, setAppliedCouponAmount] = useState(0);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [isUsingManualDiscount, setIsUsingManualDiscount] = useState(false);

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingManualDiscount, setPendingManualDiscount] =
        useState<PendingDiscountData | null>(null);

    // State for cart items with discounts applied
    const [discountedCartItems, setDiscountedCartItems] = useState<CartItem[]>(
        [],
    );

    // Refs for optimization
    const isValidatingRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastRequestTimeRef = useRef<number>(0);
    const discountProcessingCompleteRef = useRef(false);

    // Add two new states: discountsLoading and manualDiscountReady
    const [discountsLoading, setDiscountsLoading] = useState(true);
    const [manualDiscountReady, setManualDiscountReady] = useState(false);

    // Sync external coupon code (from props) to internal state
    useEffect(() => {
        if (externalCouponCode && externalCouponCode !== couponCode) {
            setCouponCode(externalCouponCode);
        }
    }, [externalCouponCode]);

    // If parent provides setCouponCode, use it
    const setCouponCodeUnified: Dispatch<SetStateAction<string>> =
        externalSetCouponCode || setCouponCode;

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

    // Fetch and process automatic discounts
    useEffect(() => {
        const asyncFetchAndProcessAutomaticDiscounts = async () => {
            // Skip processing if cart isn't ready or we're already processing
            if (
                loading ||
                !isAuthenticated ||
                cartItems.length === 0 ||
                isValidatingRef.current
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
        };
        asyncFetchAndProcessAutomaticDiscounts();
    }, [loading, isAuthenticated, cartItems]);

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

    // --- Best Discount Calculation Helper ---
    function getBestDiscountForProduct(
        productId: string,
        productPrice: number,
        discounts: Discount[],
    ): { bestDiscount: Discount | null; discountAmount: number } {
        let bestDiscount: Discount | null = null;
        let maxDiscountAmount = 0;
        for (const discount of discounts) {
            let currentDiscount = 0;
            if (
                discount.targetType === "products" &&
                discount.productIds?.includes(productId)
            ) {
                if (discount.type === "percentage") {
                    currentDiscount =
                        (productPrice * discount.discountAmount) / 100;
                } else {
                    currentDiscount = Math.min(
                        discount.discountAmount,
                        productPrice,
                    );
                }
            } else if (
                discount.targetType === "categories" &&
                discount.categoryNames
            ) {
                // Category check will be handled in the main loop
                continue;
            } else if (discount.targetType === "all") {
                if (discount.type === "percentage") {
                    currentDiscount =
                        (productPrice * discount.discountAmount) / 100;
                } else {
                    currentDiscount = Math.min(
                        discount.discountAmount,
                        productPrice,
                    );
                }
            } else if (discount.targetType === "customers") {
                // Customer-specific handled elsewhere, skip for now
                continue;
            }
            if (currentDiscount > maxDiscountAmount) {
                maxDiscountAmount = currentDiscount;
                bestDiscount = discount;
            }
        }
        return { bestDiscount, discountAmount: maxDiscountAmount };
    }

    // --- Main Discounted Cart Items Calculation ---
    function calculateDiscountedCartItems(
        cartItems: CartItem[],
        discounts: Discount[],
        isUsingManualDiscount: boolean,
    ): CartItem[] {
        return cartItems.map((item) => {
            const basePrice = item.originalPrice ?? item.price;
            let best: Discount | null = null;
            let maxAmount = 0;
            let discountSource: "automatic" | "manual" | undefined = undefined;

            // Gather all applicable discounts (manual + automatic, but only if eligible)
            let allApplicableDiscounts: Discount[] = [...discounts];
            if (isUsingManualDiscount && discount) {
                // Only add manual discount if it applies to this product
                if (
                    (discount.targetType === "products" &&
                        discount.productIds?.includes(item.id)) ||
                    (discount.targetType === "categories" &&
                        discount.categoryNames &&
                        item.categoryNames?.some((cat) =>
                            discount.categoryNames?.includes(cat),
                        )) ||
                    discount.targetType === "all"
                ) {
                    allApplicableDiscounts = [discount, ...discounts];
                }
            }

            // For this product, find the best discount
            for (const d of allApplicableDiscounts) {
                let eligible = false;
                if (
                    d.targetType === "products" &&
                    d.productIds?.includes(item.id)
                )
                    eligible = true;
                if (
                    d.targetType === "categories" &&
                    d.categoryNames &&
                    item.categoryNames?.some((cat) =>
                        d.categoryNames?.includes(cat),
                    )
                )
                    eligible = true;
                if (d.targetType === "all") eligible = true;
                if (!eligible) continue;

                let amount = 0;
                if (d.type === "percentage") {
                    amount = (basePrice * d.discountAmount) / 100;
                } else {
                    amount = Math.min(d.discountAmount, basePrice);
                }
                if (amount > maxAmount) {
                    maxAmount = amount;
                    best = d;
                    discountSource = d.isAutomatic ? "automatic" : "manual";
                }
            }
            return {
                ...item,
                originalPrice: basePrice,
                price: basePrice - maxAmount,
                discountedPrice: basePrice - maxAmount,
                discountAmount: maxAmount,
                discountSource,
                discountType: best ? best.type : undefined,
            };
        });
    }

    // Add effect to recalculate discountedCartItems when discounts/cartItems change
    useEffect(() => {
        // Compose all discounts to consider
        let allDiscounts = automaticDiscounts;
        if (isUsingManualDiscount && discount) {
            allDiscounts = [discount, ...automaticDiscounts];
        }
        const newDiscountedCartItems = calculateDiscountedCartItems(
            cartItems,
            allDiscounts,
            isUsingManualDiscount,
        );
        setDiscountedCartItems(newDiscountedCartItems);
    }, [cartItems, automaticDiscounts, discount, isUsingManualDiscount]);

    // Implement the missing applyManualDiscount function
    const applyManualDiscount = useCallback(
        (
            manualDiscount: Discount,
            discountAmount: number,
            targetedProducts: CartItem[] = [],
        ) => {
            // Add targeted products information if applicable
            const discountWithTargets = {
                ...manualDiscount,
                targetedProducts:
                    targetedProducts.length > 0
                        ? targetedProducts.map((item) => item.name)
                        : undefined,
            };

            // Set the discount and amount
            setDiscount(discountWithTargets);
            setAppliedCouponAmount(Math.min(discountAmount, subtotal));
            setCouponCodeUnified(manualDiscount.discountCode);

            // Clean up auto discounts since we're using manual now
            setAppliedAutomaticDiscounts([]);
            setTotalAutoDiscountAmount(0);

            toast.success(
                `Đã áp dụng mã giảm giá: ${manualDiscount.discountName} ${
                    targetedProducts.length > 0
                        ? ` cho ${targetedProducts.length} sản phẩm`
                        : ""
                }`,
            );
        },
        [subtotal],
    );

    // Enhanced validation function for checking discount applicability
    const validateDiscountApplicability = useCallback(
        async (code: string) => {
            if (!code.trim()) {
                return {
                    valid: false,
                    errorMessage: "Vui lòng nhập mã giảm giá",
                };
            }

            try {
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
                const productPrices = getProductPricesMap();
                const customerId = await getCurrentCustomerId();
                const isFirstPurchase = await checkIfFirstPurchase();

                // Call the API to validate
                const validationResult = await validateDiscount(
                    code,
                    subtotal,
                    productIds,
                    productPrices,
                );

                // If already invalid, return early
                if (!validationResult.valid || !validationResult.discount) {
                    return validationResult;
                }

                const discount = validationResult.discount;

                // Additional client-side validations:

                // Check date validity
                const now = new Date();
                const startDate = new Date(discount.startDate);
                const endDate = new Date(discount.endDate);

                if (now < startDate) {
                    return {
                        valid: false,
                        errorMessage: `Mã giảm giá này chưa được kích hoạt. Bắt đầu vào ${startDate.toLocaleDateString()}`,
                    };
                }

                if (now > endDate) {
                    return {
                        valid: false,
                        errorMessage: "Mã giảm giá này đã hết hạn",
                    };
                }

                // Check minimum order amount
                if (
                    discount.minOrderAmount &&
                    subtotal < discount.minOrderAmount
                ) {
                    return {
                        valid: false,
                        errorMessage: `Tổng tiền mua hàng của bạn phải tối thiểu ${formatCurrency(discount.minOrderAmount)}`,
                    };
                }

                // Check product targeting
                if (
                    discount.targetType === "products" &&
                    discount.productIds &&
                    discount.productIds.length > 0
                ) {
                    const hasMatchingProduct = productIds.some((id) =>
                        discount.productIds?.includes(id),
                    );

                    if (!hasMatchingProduct) {
                        return {
                            valid: false,
                            errorMessage:
                                "Mã giảm giá này không áp dụng cho bất kỳ sản phẩm nào trong giỏ hàng của bạn",
                        };
                    }
                }

                // Check category targeting
                if (
                    discount.targetType === "categories" &&
                    discount.categoryNames &&
                    discount.categoryNames.length > 0
                ) {
                    const hasMatchingCategory = categoryNames.some((name) =>
                        discount.categoryNames?.includes(name),
                    );

                    if (!hasMatchingCategory) {
                        return {
                            valid: false,
                            errorMessage:
                                "Mã giảm giá này không áp dụng cho bất kỳ danh mục nào trong giỏ hàng của bạn",
                        };
                    }
                }

                // Check customer targeting
                if (
                    discount.targetType === "customers" &&
                    discount.customerIds &&
                    discount.customerIds.length > 0
                ) {
                    if (
                        !customerId ||
                        !discount.customerIds.includes(customerId)
                    ) {
                        return {
                            valid: false,
                            errorMessage:
                                "Mã giảm giá này chỉ áp dụng cho khách hàng mua hàng lần đầu",
                        };
                    }
                }

                // Check first purchase restriction
                if (discount.isFirstPurchaseOnly && !isFirstPurchase) {
                    return {
                        valid: false,
                        errorMessage:
                            "Mã giảm giá này chỉ áp dụng cho khách hàng mua hàng lần đầu",
                    };
                }

                // All checks passed
                return validationResult;
            } catch (error) {
                console.error("Error validating discount:", error);
                return {
                    valid: false,
                    errorMessage: "Lỗi khi kiểm tra mã giảm giá",
                };
            }
        },
        [cartItems, subtotal, getProductPricesMap],
    );

    // Update handleApplyCoupon to use the enhanced validation
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Vui lòng nhập mã giảm giá");
            return;
        }

        try {
            setApplyingCoupon(true);
            setCouponError("");

            // Use enhanced validation
            const validationResult =
                await validateDiscountApplicability(couponCode);

            if (!validationResult.valid || !validationResult.discount) {
                setCouponError(
                    validationResult.errorMessage ||
                        "Failed to validate discount code",
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
                        "No products in your cart are eligible for this discount",
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
            setCouponError("Failed to apply discount code");
            setDiscount(null);
            setAppliedCouponAmount(0);
        } finally {
            setApplyingCoupon(false);
        }
    };

    // Remove coupon function
    const removeCoupon = useCallback(() => {
        setDiscount(null);
        setCouponCodeUnified("");
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
                        You've chosen to use a manual discount with a lower
                        value than the automatic discount
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
                `Kept automatic discount with a higher value: ${formatCurrency(pendingManualDiscount.autoAmount)}`,
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

            const asyncFetchAndProcessAutomaticDiscounts = async () => {
                if (
                    loading ||
                    !isAuthenticated ||
                    cartItems.length === 0 ||
                    isValidatingRef.current
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
                                item.categoryNames &&
                                item.categoryNames.length > 0
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
            };
            asyncFetchAndProcessAutomaticDiscounts();
        });
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

    // --- Apply manual discount from coupon code in URL if present and valid ---
    useEffect(() => {
        // Only run if coupon code is present from props/URL
        if (externalCouponCode && externalCouponCode.trim()) {
            // If the coupon code changed, try to validate and apply it as a manual discount
            (async () => {
                setCouponError("");
                setApplyingCoupon(true);
                try {
                    const validationResult =
                        await validateDiscountApplicability(externalCouponCode);
                    if (validationResult.valid && validationResult.discount) {
                        // Apply the manual discount
                        applyManualDiscount(
                            validationResult.discount,
                            validationResult.discountAmount || 0,
                            cartItems.filter((item) =>
                                validationResult.discount?.productIds?.includes(
                                    item.id,
                                ),
                            ),
                        );
                        setIsUsingManualDiscount(true);
                    } else {
                        setDiscount(null);
                        setAppliedCouponAmount(0);
                        setIsUsingManualDiscount(false);
                        setCouponError(
                            validationResult.errorMessage ||
                                "Coupon code is not valid",
                        );
                    }
                } catch (err) {
                    setDiscount(null);
                    setAppliedCouponAmount(0);
                    setIsUsingManualDiscount(false);
                    setCouponError("Failed to apply discount code");
                } finally {
                    setApplyingCoupon(false);
                }
            })();
        } else {
            // No coupon code, clear manual discount
            setDiscount(null);
            setAppliedCouponAmount(0);
            setIsUsingManualDiscount(false);
            setCouponError("");
        }
        // Only run this effect when the coupon code from props/URL changes or cart changes
    }, [externalCouponCode, cartItems, subtotal]);

    // When automatic discounts are loaded, set discountsLoading to false
    useEffect(() => {
        if (automaticDiscounts) {
            setDiscountsLoading(false);
        }
    }, [automaticDiscounts]);

    // When manual discount is validated (or not in use), set manualDiscountReady
    useEffect(() => {
        if (!isUsingManualDiscount || !!discount) {
            setManualDiscountReady(true);
        } else {
            setManualDiscountReady(false);
        }
    }, [discount, isUsingManualDiscount]);

    // Return all necessary state and functions
    return {
        discount,
        automaticDiscounts,
        appliedAutomaticDiscounts,
        totalAutoDiscountAmount,
        couponCode,
        setCouponCode: setCouponCodeUnified,
        couponError,
        appliedCouponAmount,
        manualDiscountAmount: appliedCouponAmount,
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
        discountsLoading,
        manualDiscountReady,
    };
}
