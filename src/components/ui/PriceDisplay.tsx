import React from "react";

interface PriceDisplayProps {
    currentPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    discountSource?: "automatic" | "manual";
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    currentPrice,
    originalPrice,
    discountPercentage,
    discountSource,
}) => {
    // Format price with Vietnamese locale
    const formatPrice = (price?: number) => {
        if (price === undefined || price === 0) return "0đ";
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    const formattedCurrentPrice = formatPrice(currentPrice);
    const formattedOriginalPrice = formatPrice(originalPrice);

    // Determine if we should show discount
    const hasDiscount = originalPrice && originalPrice > currentPrice;

    // Calculate discount percentage if not provided
    const displayDiscount =
        discountPercentage ||
        (hasDiscount
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0);

    // If price is 0, show as unavailable
    if (currentPrice === 0) {
        return (
            <div className="text-rose-500 font-medium">Không kinh doanh</div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-primary font-medium">
                    {formattedCurrentPrice}
                </span>
                {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                        {formattedOriginalPrice}
                    </span>
                )}

                {/* Show badge for automatic discounts */}
                {discountSource === "automatic" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                        Tự động
                    </span>
                )}
            </div>
            {hasDiscount && displayDiscount > 0 && (
                <span className="text-xs text-rose-500 font-medium">
                    Tiết kiệm {displayDiscount}%
                </span>
            )}
        </div>
    );
};
