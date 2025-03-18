"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CustomArrowProps } from "react-slick";
import ProductGrid from "@/components/shop/product/ProductGrid";
import HeroSection from "@/components/home/HeroSection";
import PromotionSection from "@/components/home/PromotionSection";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function HomePage() {
    useEffect(() => {
        document.title = "B Store - Trang chủ";
    }, []);

    return (
        <main className="flex flex-col min-h-screen bg-gray-100">
            {/* First row: Navigation and Hero Banners */}
            <HeroSection />

            {/* Second row: Hot Sale Products */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white bg-rose-500 rounded-lg p-2">
                        Hot Sale
                    </h2>
                    <Link
                        href="/products/hot-sale"
                        className="text-primary hover:underline font-medium"
                    >
                        Xem tất cả
                    </Link>
                </div>

                <ProductGrid />
            </section>

            {/* Third row: Product Categories */}
            <section className="container mx-auto px-4 py-12 bg-gray-100">
                <div className="text-center mb-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Danh mục sản phẩm
                    </h2>
                    <p className="text-gray-600">
                        Khám phá các sản phẩm theo danh mục
                    </p>
                </div>

                <CategoryCarousel />
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Sản phẩm mới
                            </h2>
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
