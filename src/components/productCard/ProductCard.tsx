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
  buttonLabel,
  onButtonClick,
  onRemoveClick,
}: ProductCardProps & {
  buttonLabel?: string;
  onButtonClick?: () => void;
  onRemoveClick?: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-md w-full max-w-full">
      <ProductInfo
        category={category}
        imageUrl={imageUrl || 'https://via.placeholder.com/150'}
        productName={productName}
      />
      <div className="flex items-center gap-4 mt-4 md:mt-0 ml-auto">
        <PriceDisplay
          currentPrice={currentPrice}
          originalPrice={originalPrice}
          discountPercentage={discountPercentage}
        />
        <button
          onClick={onButtonClick}
          className="flex overflow-hidden flex-col self-stretch my-auto text-sm leading-none text-center text-white whitespace-nowrap rounded"
          type="button"
        >
          <span className="ml-auto px-5 py-3 bg-primary text-white text-baseml-20 text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 rounded">
            {buttonLabel || "Sửa"}
          </span>
        </button>
        {onRemoveClick && (
          <button
            onClick={onRemoveClick}
            className="flex overflow-hidden flex-col self-stretch my-auto text-sm leading-none text-center text-white whitespace-nowrap rounded"
            type="button"
          >
            <span className="ml-auto px-5 py-3 bg-red-600 text-white text-baseml-20 text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 rounded">
              Xóa
            </span>
          </button>
        )}
      </div>
    </div>
  );
}