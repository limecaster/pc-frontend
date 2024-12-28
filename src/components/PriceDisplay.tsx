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
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="flex gap-px self-stretch my-auto text-center whitespace-nowrap">
      <div className="flex flex-col">
        <div className="text-base font-semibold leading-none text-primary">
          {formatPrice(currentPrice)}
        </div>
        <div className="self-start mt-4 text-xs leading-loose text-slate-500">
          {formatPrice(originalPrice)}
        </div>
      </div>
      <div className="self-end mt-7 text-xs leading-loose text-cyan-300">
        {discountPercentage}
      </div>
    </div>
  );
}
