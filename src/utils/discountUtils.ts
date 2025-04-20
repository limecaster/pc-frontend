import { CartItem } from "../components/cart/types";
import { Discount } from "@/api/discount";

/**
 * Returns a new array of CartItems with the best discount applied to each item.
 * This logic matches the robust calculation from useDiscount.calculateDiscountedCartItems.
 */
export function calculateDiscountedCartItems(
    cartItems: CartItem[],
    discounts: Discount[],
    manualDiscount: Discount | null,
    isUsingManualDiscount: boolean,
): CartItem[] {
    return cartItems.map((item) => {
        const basePrice = item.originalPrice ?? item.price;
        let eligibleDiscounts: Discount[] = [];
        // Only include manual discount if it actually applies to this product
        if (isUsingManualDiscount && manualDiscount) {
            if (
                (manualDiscount.targetType === "products" &&
                    manualDiscount.productIds?.includes(item.id)) ||
                (manualDiscount.targetType === "categories" &&
                    ((item.categoryNames &&
                        manualDiscount.categoryNames &&
                        manualDiscount.categoryNames.some((cat) =>
                            item.categoryNames?.includes(cat),
                        )) ||
                        (item.category &&
                            manualDiscount.categoryNames &&
                            manualDiscount.categoryNames.includes(
                                item.category,
                            )))) ||
                manualDiscount.targetType === "all"
            ) {
                eligibleDiscounts.push(manualDiscount);
            }
        }
        // Automatic discounts
        discounts.forEach((d) => {
            if (
                d.targetType === "products" &&
                d.productIds?.includes(item.id)
            ) {
                eligibleDiscounts.push(d);
            }
            if (d.targetType === "all") {
                eligibleDiscounts.push(d);
            }
            if (d.targetType === "categories") {
                if (
                    item.categoryNames &&
                    d.categoryNames &&
                    d.categoryNames.some((cat) =>
                        item.categoryNames?.includes(cat),
                    )
                ) {
                    eligibleDiscounts.push(d);
                } else if (
                    item.category &&
                    d.categoryNames &&
                    d.categoryNames.includes(item.category)
                ) {
                    eligibleDiscounts.push(d);
                }
            }
        });
        // Only keep unique discounts by id
        eligibleDiscounts = eligibleDiscounts.filter(
            (d, idx, arr) => arr.findIndex((x) => x.id === d.id) === idx,
        );
        // Select best discount
        let best: Discount | null = null;
        let maxAmount = 0;
        let discountSource: "automatic" | "manual" | undefined = undefined;
        let discountType: string | undefined = undefined;
        let discountName: string | undefined = undefined;
        let discountCode: string | undefined = undefined;
        let debugDiscounts: any[] = [];
        for (const d of eligibleDiscounts) {
            let amount = 0;
            if (d.type === "percentage") {
                amount = (basePrice * (d.discountAmount || 0)) / 100;
            } else {
                amount = Math.min(d.discountAmount || 0, basePrice);
            }
            debugDiscounts.push({
                id: d.id,
                name: d.discountName,
                code: d.discountCode,
                type: d.type,
                amount,
                isAutomatic: d.isAutomatic,
            });
            if (amount > maxAmount) {
                maxAmount = amount;
                best = d;
                discountSource = d.isAutomatic ? "automatic" : "manual";
                discountType = d.type;
                discountName = d.discountName;
                discountCode = d.discountCode;
            }
        }

        return {
            ...item,
            originalPrice: basePrice,
            discountedPrice: basePrice - maxAmount,
            discountAmount: maxAmount,
            discountSource,
            discountType: best ? best.type : undefined,
            discountName,
            discountCode,
        };
    });
}
