"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CustomArrowProps } from "react-slick";
import ProductGrid from "@/components/products/product/ProductGrid";
import HeroSection from "@/components/home/HeroSection";
import PromotionSection from "@/components/home/PromotionSection";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import BrandShowcase from "@/components/home/BrandShowcase";
import HotSalesSection from "@/components/home/HotSalesSection";

export default function HomePage() {
    useEffect(() => {
        document.title = "B Store - Trang chủ";
    }, []);

    return (
        <main className="flex flex-col min-h-screen bg-gray-100">
            {/* First row: Navigation and Hero Banners */}
            <HeroSection />

            {/* Featured PC Builds Section */}

            {/* Hot Sales Section - Add this section */}
            <HotSalesSection />

            {/* Second row: Hot Sale Products */}
            <section className="container mx-auto px-4 py-12 bg-gradient-to-r from-rose-50 to-rose-100 rounded-3xl my-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Hot Sale
                        </h2>
                        <p className="text-gray-600">
                            Sản phẩm giảm giá hot nhất hiện nay
                        </p>
                    </div>
                    <Link
                        href="/products/hot-sale"
                        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg inline-block font-medium transition-colors"
                    >
                        Xem tất cả
                    </Link>
                </div>

                <ProductGrid />
            </section>

            {/* Brand Showcase - Replace the static section with our new component */}
            <BrandShowcase />

            {/* Third row: Product Categories */}
            <section className="container mx-auto px-4 py-12 bg-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Danh mục sản phẩm
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Khám phá các sản phẩm theo danh mục
                    </p>
                </div>

                <CategoryCarousel />
            </section>

            {/* Why Choose Us Section */}
            <section className="container mx-auto px-4 py-12 bg-white rounded-3xl my-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Tại sao chọn B Store?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cung cấp trải nghiệm mua sắm tốt nhất cho
                        khách hàng
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                            Giao hàng nhanh chóng
                        </h3>
                        <p className="text-gray-600">
                            Giao hàng nhanh trong vòng 24h đối với nội thành
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                            Bảo hành chính hãng
                        </h3>
                        <p className="text-gray-600">
                            Tất cả sản phẩm đều được bảo hành chính hãng
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                            Thanh toán trực tuyến
                        </h3>
                        <p className="text-gray-600">
                            Hỗ trợ thanh toán trực tuyến bằng cách quét mã QR
                            hoặc chuyển khoản ngân hàng
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                        <p className="text-gray-600">
                            Đội ngũ hỗ trợ luôn sẵn sàng phục vụ
                        </p>
                    </div>
                </div>
            </section>

            {/* Fourth row: Promotion + Products */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column: Promotion banner */}
                    <div className="lg:col-span-1">
                        <PromotionSection />
                    </div>

                    {/* Right column: Products */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Sản phẩm mới
                                    </h2>
                                    <p className="text-gray-600">
                                        Cập nhật liên tục các sản phẩm mới nhất
                                    </p>
                                </div>
                                <Link
                                    href="/products/new"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Xem tất cả
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <ProductGrid />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="container mx-auto px-4 py-12 mb-6">
                <div className="bg-primary rounded-2xl p-8 md:p-12 text-white text-center">
                    <h2 className="text-3xl font-bold mb-3">
                        Đăng ký nhận thông tin khuyến mãi
                    </h2>
                    <p className="text-white/90 mb-8 max-w-xl mx-auto">
                        Nhận thông báo về sản phẩm mới và ưu đãi đặc biệt dành
                        riêng cho bạn.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="flex-1 px-5 py-3 rounded-lg text-gray-900 focus:outline-none"
                        />
                        <button className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors">
                            Đăng ký
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

// New Category Carousel component
function CategoryCarousel() {
    const getCategoryName = (categoryId: string): string => {
        const categoryMap: Record<string, string> = {
            CPU: "CPU",
            Motherboard: "Bo mạch chủ",
            RAM: "RAM",
            GraphicsCard: "GPU",
            InternalHardDrive: "SSD",
            Case: "Vỏ case",
            PowerSupply: "Nguồn máy tính",
            CPUCooler: "Tản nhiệt",
            Speaker: "Loa máy tính",
            Keyboard: "Bàn phím",
            Mouse: "Chuột",
            Monitor: "Màn hình",
            ThermalPaste: "Keo tản nhiệt",
            WiFiCard: "Card wifi",
            WiredNetworkCard: "Card mạng có dây",
        };

        return categoryMap[categoryId] || categoryId;
    };

    const categories = [
        { id: "CPU", name: getCategoryName("CPU"), image: "/images/cpu.webp" },
        {
            id: "GraphicsCard",
            name: getCategoryName("GraphicsCard"),
            image: "/images/vga.jpg",
        },
        {
            id: "Motherboard",
            name: getCategoryName("Motherboard"),
            image: "/images/motherboard.jpeg",
        },
        { id: "RAM", name: getCategoryName("RAM"), image: "/images/ram.png" },
        {
            id: "Monitor",
            name: getCategoryName("Monitor"),
            image: "/images/monitor.webp",
        },
        {
            id: "PowerSupply",
            name: getCategoryName("PowerSupply"),
            image: "/images/psu.jpg",
        },
        {
            id: "InternalHardDrive",
            name: getCategoryName("InternalHardDrive"),
            image: "/images/ssd.webp",
        },
        {
            id: "Case",
            name: getCategoryName("Case"),
            image: "/images/case.jpg",
        },
    ];

    const NextArrow = (props: CustomArrowProps) => {
        const { onClick } = props;
        return (
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-primary text-white rounded-full p-2 shadow-md hover:bg-white hover:text-gray-800"
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-primary text-white rounded-full p-2 shadow-md hover:bg-white hover:text-gray-800"
                onClick={onClick}
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </div>
        );
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="category-carousel px-8">
            <Slider {...settings}>
                {categories.map((category) => (
                    <div key={category.id} className="px-2">
                        <Link href={`/products?category=${category.id}`}>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-40">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-medium text-gray-900">
                                        {category.name}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
