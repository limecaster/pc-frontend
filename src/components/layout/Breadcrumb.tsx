import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Import assets
import house from "@/assets/icon/others/House.svg";
import caretRight from "@/assets/icon/others/CaretRight.svg";

// Define a mapping of path segments to readable names
const pathNameMap: { [key: string]: string } = {
    "": "Home",
    "manual-build-pc": "Xây dựng cấu hình thủ công",
    "auto-build-pc": "Đề xuất cấu hình",
    products: "Sản phẩm",
    product: "Sản phẩm",
    profile: "Tài khoản",
    "track-order": "Theo dõi đơn hàng",
    cart: "Giỏ hàng",
    checkout: "Thanh toán",
    dashboard: "Bảng điều khiển",
    chatbot: "Chatbot",
    authenticate: "Xác thực",
    "404": "Không tìm thấy trang",
    "500": "Lỗi máy chủ",
    orders: "Đơn hàng",
    "viewed-products": "Sản phẩm đã xem",
    wishlist: "Danh sách yêu thích",
    account: "Thông tin tài khoản",
    faq: "Câu hỏi thường gặp",
    search: "Tìm kiếm",
    "pc-configurations": "Cấu hình PC",
    reviews: "Đánh giá",
    support: "Hỗ trợ khách hàng",
    "about-us": "Về chúng tôi",
    about: "Về chúng tôi",
    "hot-sales": "Khuyến mãi",
};

const Breadcrumb: React.FC = () => {
    const pathname = usePathname();
    const pathSegments = pathname
        .split("/")
        .filter((segment) => segment !== "");
    const isHome = pathSegments.length === 0;
    // Create breadcrumb items with paths
    const breadcrumbItems = pathSegments.map((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const name = pathNameMap[segment] || segment;
        return { path, name };
    });

    return (
        <>
            {!isHome && (
                <nav
                    className="flex flex-col justify-center items-start px-16 py-4 w-full text-sm leading-none bg-bgSecondary max-md:px-5 max-md:max-w-full max-md:py-2"
                    aria-label="Breadcrumb"
                >
                    <div className="flex gap-2 justify-center items-center">
                        <Image
                            src={house}
                            alt=""
                            className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                        />
                        <Link
                            href="/"
                            className="self-stretch my-auto text-gray-500 hover:text-gray-700"
                        >
                            Trang chủ
                        </Link>

                        {breadcrumbItems.map((item, index) => (
                            <React.Fragment key={item.path}>
                                <Image
                                    src={caretRight}
                                    alt=""
                                    className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                                />
                                {index === breadcrumbItems.length - 1 ? (
                                    <span className="self-stretch my-auto font-medium text-secondary hover:text-primary">
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.path}
                                        className="self-stretch my-auto text-gray-500 hover:text-gray-700"
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </nav>
            )}
        </>
    );
};

export default Breadcrumb;
