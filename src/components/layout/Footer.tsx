import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFooter } from "@/contexts/FooterContext";

// Import assets for fallback
import logoBlue from "@/assets/logo-blue.png";
import doubleCheck from "@/assets/icon/others/Checks.svg";
import { getLogo } from "@/api/logo";
import { ContentSection } from "@/api/cms";

const Footer: React.FC = () => {
    const { footerRef } = useFooter();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoLink, setLogoLink] = useState<string>("/");

    // Fetch logo from CMS
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const logoData = await getLogo(ContentSection.FOOTER);
                if (logoData && logoData.imageUrl) {
                    setLogoUrl(logoData.imageUrl);
                    if (logoData.link) {
                        setLogoLink(logoData.link);
                    }
                }
            } catch (error) {
                console.error("Error loading footer logo:", error);
                // Fallback logo will be used
            }
        };

        fetchLogo();
    }, []);

    return (
        <footer
            ref={footerRef}
            className="flex flex-col w-full max-md:max-w-full text-white"
        >
            <div className="flex flex-wrap gap-6 justify-between py-20 px-20 w-full bg-primary min-h-[400px] max-md:px-5 max-md:max-w-full">
                {/* Column 1: Logo and Contact Info */}
                <div className="flex flex-col my-auto font-medium min-w-[240px] max-w-[300px]">
                    {/* Use CMS logo if available, otherwise fallback to the import */}
                    {logoUrl ? (
                        <Link href={logoLink}>
                            <Image
                                src={logoUrl}
                                alt="Company logo"
                                width={100}
                                height={94}
                                className="object-contain max-w-full aspect-[1.06] w-[100px]"
                            />
                        </Link>
                    ) : (
                        <Image
                            src={logoBlue}
                            alt="Company logo"
                            className="object-contain max-w-full aspect-[1.06] w-[100px]"
                        />
                    )}
                    <div className="flex flex-col mt-6">
                        <div className="flex flex-col w-full">
                            <h2 className="text-2xl leading-none text-white">
                                Chăm sóc khách hàng:
                            </h2>
                            <p className="mt-1 text-lg leading-none text-white">
                                1900 123 456
                            </p>
                        </div>
                        <address className="mt-3 text-base text-white not-italic">
                            Thủ Đức, TP. Hồ Chí Minh
                        </address>
                        <p className="mt-3 text-base text-white">
                            <a href="mailto:bang.do38@hcmut.edu.vn">
                                bang.do38@hcmut.edu.vn
                            </a>
                        </p>
                    </div>
                </div>

                {/* Column 2: Project Description */}
                <div className="flex flex-col min-w-[240px] max-w-[400px]">
                    <h1 className="text-4xl font-semibold leading-10">
                        ĐỒ ÁN TỐT NGHIỆP <br /> HƯỚNG HỆ THỐNG THÔNG TIN
                    </h1>
                    <p className="mt-6 text-base leading-6">
                        Đây là ĐATN của Đỗ Văn Bâng. <br /> Đây là một trang web
                        thương mại điện tử, chuyên bán linh kiện máy tính và PC,
                        có hỗ trợ tính năng build-PC.
                    </p>

                    <ul className="flex flex-col text-base mt-4">
                        <li className="flex gap-3 items-start">
                            <Image
                                src={doubleCheck}
                                alt=""
                                className="object-contain shrink-0 w-6 aspect-square"
                            />
                            <span>Trang web thương mại điện tử</span>
                        </li>
                        <li className="flex gap-3 items-start mt-2">
                            <Image
                                src={doubleCheck}
                                alt=""
                                className="object-contain shrink-0 w-6 aspect-square"
                            />
                            <span>Chuyên bán linh kiện máy tính và PC</span>
                        </li>
                        <li className="flex gap-3 items-start mt-2">
                            <Image
                                src={doubleCheck}
                                alt=""
                                className="object-contain shrink-0 w-6 aspect-square"
                            />
                            <span>Hỗ trợ tính năng build-PC</span>
                        </li>
                        <li className="flex gap-3 items-start mt-2">
                            <Image
                                src={doubleCheck}
                                alt=""
                                className="object-contain shrink-0 w-6 aspect-square"
                            />
                            <span>Có hệ thống gợi ý</span>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Links */}
                <div className="flex flex-col min-w-[240px]">
                    <h2 className="text-2xl font-semibold mb-6">Liên kết</h2>
                    <nav className="flex flex-col space-y-3">
                        <Link
                            href="/about-us"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Về chúng tôi
                        </Link>
                        <Link
                            href="/faq"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Câu hỏi thường gặp
                        </Link>
                        <Link
                            href="/support"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Liên hệ hỗ trợ
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Chính sách bảo mật
                        </Link>
                        <Link
                            href="/terms"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Điều khoản sử dụng
                        </Link>
                        <Link
                            href="/shipping"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Chính sách vận chuyển
                        </Link>
                        <Link
                            href="/warranty"
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            Bảo hành & Đổi trả
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
