import React from "react";
import Image from "next/image";
import Link from "next/link";

const PromotionSection: React.FC = () => {
    return (
        <div className="relative rounded-lg overflow-hidden h-full min-h-[500px]">
            <Image
                src="/images/promotion-banner-4.webp"
                alt="Khuyến mãi đặc biệt"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <span className="text-yellow-400 font-semibold mb-2">
                    Ưu đãi có thời hạn
                </span>
                <h2 className="text-white text-3xl font-bold mb-3">
                    Xây Dựng PC Chơi Game
                </h2>
                <p className="text-white text-lg mb-6">
                    Giảm giá lên đến 30% cho các linh kiện được chọn
                </p>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                            30%
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">
                                CPU & Bo mạch chủ
                            </h3>
                            <p className="text-gray-300 text-sm">Intel & AMD</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                            20%
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">
                                Card đồ họa
                            </h3>
                            <p className="text-gray-300 text-sm">
                                NVIDIA & AMD
                            </p>
                        </div>
                    </div>
                </div>
                <Link
                    href="/promotions/gaming-pc"
                    className="mt-6 bg-primary text-white px-6 py-3 rounded-md inline-block font-medium hover:bg-primary/90 transition-colors w-full md:w-auto text-center"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};

export default PromotionSection;
