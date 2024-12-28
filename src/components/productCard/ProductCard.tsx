'use client';

import * as React from 'react';
import { ProductInfo } from './ProductInfo';
import { PriceDisplay } from '../PriceDisplay';
import type { ProductCardProps } from './types';

export function ProductCard({
  imageUrl,
  productName,
  currentPrice,
  originalPrice,
  discountPercentage,
  logoUrl,
  category,
}: ProductCardProps) {
  return (
    <div className="flex overflow-hidden flex-wrap gap-10 items-center py-6 pr-8 bg-white rounded-md max-w-[833px] max-md:pr-5">
      <ProductInfo
        category={category}
        imageUrl={imageUrl}
        productName={productName}
        logoUrl={logoUrl}
      />
      <PriceDisplay
        currentPrice={currentPrice}
        originalPrice={originalPrice}
        discountPercentage={discountPercentage}
      />
      <button
        onClick={() => console.log('Edit product')}
        className="flex overflow-hidden flex-col self-stretch my-auto text-sm leading-none text-center text-white whitespace-nowrap rounded"
      >
        <span className="px-5 py-3 bg-primary">Sửa</span>
      </button>
    </div>
  );
}