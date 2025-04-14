import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CustomArrowProps } from "react-slick";
import ProductCard from "./ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { ProductDetailsDto } from "@/types/product";

interface ProductCarouselProps {
    products: ProductDetailsDto[];
    title?: string;
    subtitle?: string;
    slidesToShow?: number;
    isLoading?: boolean;
    viewAllLink?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
    products,
    title,
    subtitle,
    slidesToShow = 4,
    isLoading = false,
    viewAllLink,
}) => {
    // Custom arrow components
    const NextArrow = (props: CustomArrowProps) => {
        const { onClick } = props;
        return (
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary-dark transition-colors"
                onClick={onClick}
            >
                <ChevronRightIcon className="h-6 w-6" />
            </div>
        );
    };

    const PrevArrow = (props: CustomArrowProps) => {
        const { onClick } = props;
        return (
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary-dark transition-colors"
                onClick={onClick}
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </div>
        );
    };

    // Slider settings
    const settings = {
        dots: true,
        infinite: products.length > slidesToShow,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: Math.min(3, slidesToShow),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, slidesToShow),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="product-carousel">
            {/* Title section */}
            {(title || subtitle) && (
                <div className="flex justify-between items-end mb-6">
                    <div>
                        {title && (
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-gray-600">{subtitle}</p>
                        )}
                    </div>
                    {viewAllLink && (
                        <a
                            href={viewAllLink}
                            className="text-primary hover:underline font-medium"
                        >
                            Xem tất cả
                        </a>
                    )}
                </div>
            )}

            {/* Carousel */}
            {products.length > 0 ? (
                <div className="px-8">
                    <Slider {...settings}>
                        {products.map((product) => (
                            <div key={product.id} className="px-2">
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    discountPercentage={
                                        product.discountPercentage
                                    }
                                    isDiscounted={product.isDiscounted}
                                    discountSource={product.discountSource}
                                    discountType={product.discountType}
                                    rating={product.rating || 0}
                                    reviewCount={product.reviewCount || 0}
                                    imageUrl={
                                        product.imageUrl ||
                                        "/images/placeholder.png"
                                    }
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                </div>
            )}
        </div>
    );
};

export default ProductCarousel;
