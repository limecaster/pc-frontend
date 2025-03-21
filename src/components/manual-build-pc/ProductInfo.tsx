import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export interface ProductInfoProps {
    category: string;
    imageUrl: string;
    productName: string;
    productUrl?: string; // Make URL optional
}

export function ProductInfo({
    category,
    imageUrl,
    productName,
    productUrl,
}: ProductInfoProps) {
    // Create the content that will be displayed
    const content = (
        <div className="flex flex-wrap gap-px self-stretch text-sm leading-5 text-black max-md:max-w-full">
            <div className="flex overflow-hidden flex-auto gap-2.5 justify-center items-center px-1">
                <div className="self-stretch my-auto w-20 font-medium text-center">
                    {category}
                </div>
                <Image
                    src={imageUrl}
                    alt={`${productName}`}
                    width={85}
                    height={85}
                    className="object-contain shrink-0 self-stretch my-auto aspect-square w-[85px]"
                    loading="lazy"
                />
                <div
                    className="self-stretch my-auto w-full line-clamp-2 overflow-hidden text-ellipsis break-words font-medium hover:text-primary"
                    style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {productName}
                </div>
            </div>
        </div>
    );

    // If we have a URL, wrap in a Link, otherwise just return the content
    return productUrl ? (
        <Link href={productUrl} passHref>
            <div className="cursor-pointer">{content}</div>
        </Link>
    ) : (
        content
    );
}
