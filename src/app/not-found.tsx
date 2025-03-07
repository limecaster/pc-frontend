"use client";
import Link from "next/link";
import Image from "next/image";

import NotFoundImage from "../assets/NotFoundImage.svg";
import { useEffect } from "react";

export default function NotFound() {
    useEffect(() => {
        document.title = "404 - Page Not Found";
    }
    , []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white">
            <Image src={NotFoundImage} alt="404" width={300} height={300} />
            <h1 className="text-4xl font-bold text-red-600">
                404 - Page Not Found
            </h1>
            <p className="mt-2 text-gray-500">
                Yêu cầu của bạn không được tìm thấy. Có lẽ nó đã bị xóa, hỏng
                hoặc không tồn tại
            </p>
            <Link
                href="/"
                className="mt-4 px-4 py-2 text-white bg-primary rounded-md"
            >
                Về trang chủ
            </Link>
        </div>
    );
}
