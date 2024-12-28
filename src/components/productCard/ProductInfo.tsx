import * as React from 'react';
import Image from 'next/image';
// import Link from 'next/link';

interface ProductInfoProps {
  category: string;
  imageUrl: string;
  productName: string;
  logoUrl: string;
}

export function ProductInfo({ category, imageUrl, productName, logoUrl }: ProductInfoProps) {
  return (
    <div className="flex flex-wrap gap-px self-stretch text-sm leading-5 text-black max-md:max-w-full">
      <div className="flex overflow-hidden flex-auto gap-2.5 justify-center items-center px-1">
        <div className="self-stretch my-auto w-20 font-medium text-center">
          {category}
        </div>
        <Image
          src={imageUrl}
          alt={`${productName} product image`}
          width={85}
          height={85}
          className="object-contain shrink-0 self-stretch my-auto aspect-square w-[85px]"
        />
        <div className="self-stretch my-auto w-[250px]">
          {productName}
        </div>
      </div>
      <Image
        src={logoUrl}
        alt=""
        width={97}
        height={33}
        className="object-contain shrink-0 my-auto aspect-[2.94] w-[97px]"
      />
    </div>
  );
}