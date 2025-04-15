import React, { useState, useEffect } from "react";
import SidebarMenu from "@/components/layout/SidebarMenu";
import Image from "next/image";
import Link from "next/link";
import {
    getHeroBanners,
    getPromoBanners,
    HeroBanner,
} from "@/api/hero-content";

const fallbackMainBanner = {
    id: 0,
    contentKey: "main-banner",
    title: "Xây dựng cấu hình PC của bạn",
    description: "Nhận thông báo mới nhất về sản phẩm và ưu đãi",
    imageUrl: "/images/promotion-banner-1.webp",
    link: "/products",
    displayOrder: 0,
};

const fallbackPromoBanners = [
    {
        id: 1,
        contentKey: "promo-banner-1",
        title: "Giảm giá vì ĐATN",
        description: "Giảm đến 20% cho tất cả sản phẩm",
        imageUrl: "/images/promotion-banner-2.webp",
        link: "/products/sale",
        displayOrder: 1,
    },
    {
        id: 2,
        contentKey: "promo-banner-2",
        title: "Hàng mới về",
        description: "Cập nhật sản phẩm mới hàng ngày",
        imageUrl: "/images/promotion-banner-3.webp",
        link: "/products/new",
        displayOrder: 2,
    },
];

const HeroSection: React.FC = () => {
    const [mainBanner, setMainBanner] = useState<HeroBanner | null>(null);
    const [promoBanners, setPromoBanners] = useState<HeroBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);

                const [heroBannersData, promoBannersData] = await Promise.all([
                    getHeroBanners(),
                    getPromoBanners(),
                ]);

                if (heroBannersData.length > 0) {
                    setMainBanner(heroBannersData[0]);
                } else {
                    setMainBanner(fallbackMainBanner);
                }

                if (promoBannersData.length > 0) {
                    setPromoBanners(promoBannersData.slice(0, 2));
                } else {
                    setPromoBanners(fallbackPromoBanners);
                }
            } catch (error) {
                console.error("Error fetching banner data:", error);

                setMainBanner(fallbackMainBanner);
                setPromoBanners(fallbackPromoBanners);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    return (
        <section className="bg-gray-100">
            {/* Hero Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-4">
                    {/* Left: Menu sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <SidebarMenu />
                    </div>

                    {/* Center: Main Banner */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="relative rounded-lg overflow-hidden h-[400px]">
                            {loading ? (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                            ) : (
                                <>
                                    <Image
                                        src={
                                            mainBanner?.imageUrl ||
                                            fallbackMainBanner.imageUrl
                                        }
                                        alt={
                                            mainBanner?.title ||
                                            "Main banner promotion"
                                        }
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 600px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-end p-8">
                                        <h1 className="text-white text-3xl font-bold mb-2">
                                            {mainBanner?.title ||
                                                fallbackMainBanner.title}
                                        </h1>
                                        <p className="text-white text-lg mb-4">
                                            {mainBanner?.description ||
                                                fallbackMainBanner.description}
                                        </p>
                                        <Link
                                            href={
                                                mainBanner?.link ||
                                                fallbackMainBanner.link
                                            }
                                            className="bg-primary text-white px-6 py-3 rounded-full inline-block font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Mua ngay
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Secondary Banners */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                        {loading ? (
                            <>
                                <div className="relative rounded-lg overflow-hidden h-[190px] bg-gray-200 animate-pulse"></div>
                                <div className="relative rounded-lg overflow-hidden h-[190px] bg-gray-200 animate-pulse"></div>
                            </>
                        ) : (
                            promoBanners.map((banner, index) => (
                                <Link
                                    href={banner.link}
                                    key={banner.id || index}
                                >
                                    <div className="relative rounded-lg overflow-hidden h-[190px]">
                                        <Image
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 300px"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                                            <h2 className="text-white text-xl font-bold">
                                                {banner.title}
                                            </h2>
                                            <p className="text-white text-sm">
                                                {banner.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
