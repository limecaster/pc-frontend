import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Heart from "@/assets/icon/shop/Heart.svg";
import Eye from "@/assets/icon/shop/Eye.svg";
import Cart from "@/assets/icon/shop/Cart.svg";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { addToCartAndSync } from "@/api/cart";
import { useWishlist } from "@/contexts/WishlistContext";
import { trackProductClick } from "@/api/events";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    isDiscounted?: boolean;
    discountSource?: "automatic" | "manual";
    discountType?: "fixed" | "percentage";
    rating: number;
    reviewCount: number;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    price,
    originalPrice,
    discountPercentage,
    isDiscounted,
    discountSource,
    discountType,
    rating,
    reviewCount,
    imageUrl,
}) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [localOriginalPrice, setLocalOriginalPrice] = useState<
        number | undefined
    >(originalPrice);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const inWishlist = isInWishlist(id);

    useEffect(() => {
        if (originalPrice !== undefined) {
            setLocalOriginalPrice(originalPrice);
            return;
        }

        if (name && name.includes(" VND")) {
            try {
                const priceMatch = name.match(/(\d+)\s+VND/);
                if (priceMatch && priceMatch[1]) {
                    const extractedPrice = parseInt(priceMatch[1], 10);
                    if (extractedPrice && price < extractedPrice) {
                        setLocalOriginalPrice(extractedPrice);
                    }
                }
            } catch (err) {
                console.error(`Error extracting price from name: ${err}`);
            }
        }
    }, [name, price, originalPrice]);

    const formattedPrice = new Intl.NumberFormat("vi-VN").format(price) + "đ";
    const effectiveOriginalPrice = originalPrice || localOriginalPrice;
    const effectiveDiscountPercentage = discountPercentage;
    const effectiveDiscountSource = discountSource;
    const isFixedDiscount = discountType === "fixed";

    const formattedOriginalPrice = effectiveOriginalPrice
        ? new Intl.NumberFormat("vi-VN").format(effectiveOriginalPrice) + "đ"
        : null;

    const priceDifference =
        effectiveOriginalPrice && effectiveOriginalPrice > price
            ? effectiveOriginalPrice - price
            : 0;

    const percentDifference =
        effectiveOriginalPrice && effectiveOriginalPrice > price
            ? (priceDifference / effectiveOriginalPrice) * 100
            : 0;

    const hasDiscount =
        isDiscounted ||
        (effectiveOriginalPrice !== undefined &&
            effectiveOriginalPrice > price);

    const showBadge =
        hasDiscount &&
        ((effectiveDiscountPercentage && effectiveDiscountPercentage > 0) ||
            percentDifference >= 0.1);

    const displayDiscount =
        effectiveDiscountPercentage ||
        (priceDifference > 0 ? Math.max(1, Math.round(percentDifference)) : 0);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inWishlist) {
            await removeFromWishlist(id);
        } else {
            await addToWishlist(id);
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await addToCartAndSync(id, 1);
            toast.success(`Đã thêm sản phẩm vào giỏ hàng!`, { duration: 3000 });
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        }
    };

    const handleProductClick = () => {
        trackProductClick(id, {
            name,
            price,
            originalPrice: effectiveOriginalPrice,
            discountPercentage: effectiveDiscountPercentage,
            isDiscounted: hasDiscount,
            discountSource: effectiveDiscountSource,
            discountType,
            rating,
            reviewCount,
        });
        router.push(`/product/${id}`);
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        trackProductClick(id, {
            name,
            price,
            originalPrice: effectiveOriginalPrice,
            discountPercentage: effectiveDiscountPercentage,
            isDiscounted: hasDiscount,
            discountSource: effectiveDiscountSource,
            discountType,
            rating,
            reviewCount,
            interactionType: "quick_view",
        });
        router.push(`/product/${id}`);
    };

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={`full-${i}`} className="text-secondary">
                    ★
                </span>,
            );
        }

        if (hasHalfStar) {
            stars.push(
                <span key="half" className="relative inline-block">
                    <span className="text-gray-300 absolute">★</span>
                    <span
                        className="text-secondary absolute"
                        style={{ width: "50%", overflow: "hidden" }}
                    >
                        ★
                    </span>
                </span>,
            );
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="text-gray-300">
                    ★
                </span>,
            );
        }

        return stars;
    };

    const priceDisplay = () => {
        if (price === 0) {
            return (
                <span className="text-rose-500 font-semibold text-sm">
                    Miễn phí
                </span>
            );
        }

        if (hasDiscount) {
            const discountBadge = () => {
                if (effectiveDiscountSource === "automatic") {
                    return (
                        <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-sm">
                            Khuyến mãi
                        </span>
                    );
                } else {
                    return (
                        <span className="bg-rose-100 text-rose-600 text-xs px-1.5 py-0.5 rounded-sm">
                            Giảm giá
                        </span>
                    );
                }
            };

            return (
                <>
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-base text-primary">
                            {formattedPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                            {formattedOriginalPrice}
                        </span>
                        {discountBadge()}
                    </div>
                    {priceDifference > 0 && (
                        <span className="text-xs text-rose-500 font-medium mt-1">
                            {isFixedDiscount ? (
                                <>
                                    Tiết kiệm{" "}
                                    {new Intl.NumberFormat("vi-VN").format(
                                        priceDifference,
                                    )}
                                    đ
                                </>
                            ) : (
                                <>
                                    Tiết kiệm {displayDiscount}%
                                    <span className="ml-1">
                                        (
                                        {new Intl.NumberFormat("vi-VN").format(
                                            priceDifference,
                                        )}
                                        đ)
                                    </span>
                                </>
                            )}
                        </span>
                    )}
                </>
            );
        }

        return (
            <span className="font-bold text-base text-primary">
                {formattedPrice}
            </span>
        );
    };

    return (
        <div
            className="relative w-full bg-white rounded-md overflow-hidden border border-solid border-gray-100 transition-all duration-200 hover:border-gray-200 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
        >
            <div className="relative aspect-square overflow-hidden">
                {showBadge && (
                    <div
                        className={`absolute top-2 right-2 z-10 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full`}
                    >
                        {isFixedDiscount || percentDifference < 1
                            ? `-${new Intl.NumberFormat("vi-VN").format(priceDifference)}đ`
                            : `-${displayDiscount}%`}
                    </div>
                )}

                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                />

                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                        isHovered ? "opacity-60" : "opacity-0"
                    }`}
                />

                <div
                    className={`absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-300 ${
                        isHovered
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                >
                    <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            hoveredButton === "heart" || inWishlist
                                ? "bg-rose-500"
                                : "bg-white"
                        }`}
                        onMouseEnter={() => setHoveredButton("heart")}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={handleWishlistToggle}
                        aria-label={
                            inWishlist
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }
                    >
                        <Image
                            src={Heart}
                            alt="Heart"
                            width={20}
                            height={20}
                            className={`${hoveredButton === "heart" || inWishlist ? "filter brightness-0 invert" : ""}`}
                        />
                    </button>

                    <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            hoveredButton === "cart" ? "bg-primary" : "bg-white"
                        }`}
                        onMouseEnter={() => setHoveredButton("cart")}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(e);
                        }}
                        aria-label="Add to cart"
                    >
                        <Image
                            src={Cart}
                            alt="Cart"
                            width={20}
                            height={20}
                            className={`${hoveredButton === "cart" ? "filter brightness-0 invert" : ""}`}
                        />
                    </button>

                    <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            hoveredButton === "eye" ? "bg-primary" : "bg-white"
                        }`}
                        onMouseEnter={() => setHoveredButton("eye")}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={handleQuickView}
                        aria-label="Quick view"
                    >
                        <Image
                            src={Eye}
                            alt="Eye"
                            width={20}
                            height={20}
                            className={`${hoveredButton === "eye" ? "filter brightness-0 invert" : ""}`}
                        />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex text-sm">{renderStars()}</div>
                    <span className="text-xs text-gray-500">
                        ({reviewCount})
                    </span>
                </div>

                <Tooltip content={name}>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 cursor-default">
                        {name}
                    </h3>
                </Tooltip>

                <div className="flex flex-col">{priceDisplay()}</div>
            </div>
        </div>
    );
};

export default ProductCard;
