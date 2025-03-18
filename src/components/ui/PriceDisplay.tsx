import * as React from "react";

interface PriceDisplayProps {
    currentPrice: string;
    originalPrice: string;
    discountPercentage: string;
}

export function PriceDisplay({
    currentPrice,
    originalPrice,
    discountPercentage,
}: PriceDisplayProps) {
    const formatPrice = (price: string) => {
        // round to 0 decimal places
        price = parseFloat(price).toFixed(0);
        price = price.toString();
        return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="flex gap-px self-stretch my-auto text-center whitespace-nowrap">
            <div className="flex flex-col">
                {currentPrice === "0" ? (
                    <div className="text-base font-semibold leading-none text-primary">
                        Liên hệ
                    </div>
                ) : (
                    <div className="text-base font-semibold leading-none text-primary">
                        {formatPrice(currentPrice) + "đ"}
                    </div>
                )}
                {originalPrice !== "0" ? (
                    <div className="self-start mt-4 text-xs leading-loose text-slate-500">
                        {formatPrice(originalPrice)}
                    </div>
                ) : null}
            </div>
            {discountPercentage === "0" ? (
                <div className="self-end mt-7 text-xs leading-loose text-cyan-300">
                    {discountPercentage}
                </div>
            ) : null}
        </div>
    );
}
