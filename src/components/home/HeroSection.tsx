import React from "react";
import SidebarMenu from "@/components/layout/SidebarMenu";
import Image from "next/image";
import Link from "next/link";

const HeroSection: React.FC = () => {
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
                            <Image
                                src="/images/promotion-banner-1.webp"
                                alt="Main banner promotion"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-end p-8">
                                <h1 className="text-white text-3xl font-bold mb-2">
                                    Xây dựng cấu hình PC của bạn
                                </h1>
                                <p className="text-white text-lg mb-4">
                                    Nhận thông báo mới nhất về sản phẩm và ưu đãi
                                </p>
                                <Link
                                    href="/products"
                                    className="bg-primary text-white px-6 py-3 rounded-full inline-block font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Mua ngay
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right: Secondary Banners */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                        <div className="relative rounded-lg overflow-hidden h-[190px]">
                            <Image
                                src="/images/promotion-banner-2.webp"
                                alt="GPU promotion"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                                <h2 className="text-white text-xl font-bold">
                                    Giảm giá vì ĐATN
                                </h2>
                                <p className="text-white text-sm">
                                    Giảm đến 20% cho tất cả sản phẩm
                                </p>
                            </div>
                        </div>

                        <div className="relative rounded-lg overflow-hidden h-[190px]">
                            <Image
                                src="/images/promotion-banner-3.webp"
                                alt="New arrivals"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                                <h2 className="text-white text-xl font-bold">
                                    Hàng mới về
                                </h2>
                                <p className="text-white text-sm">
                                    Cập nhật sản phẩm mới hàng ngày
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
