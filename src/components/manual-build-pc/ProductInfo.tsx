import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductInfoProps } from "./types";

export function ProductInfo({
    category,
    imageUrl,
    productName,
    productUrl,
}: ProductInfoProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                    src={imageUrl}
                    alt={productName}
                    fill
                    className="object-cover rounded-md"
                    sizes="64px"
                />
            </div>
            <div>
                {category && (
                    <p className="text-xs text-gray-500">{category}</p>
                )}
                {productUrl ? (
                    <Link href={productUrl} className="hover:text-primary">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {productName}
                        </h3>
                    </Link>
                ) : (
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {productName}
                    </h3>
                )}
            </div>
        </div>
    );
}
