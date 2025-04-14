"use client";

import React, { useState, useEffect } from "react";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import { getProductRatings, RatingComment } from "@/api/rating";
import RatingForm from "../products/RatingForm";
import StarRating from "./StarRating";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface ProductInformationProps {
    description: string;
    additionalInfo?: string;
    specifications?: any;
    productId: string;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

const ProductInformation: React.FC<ProductInformationProps> = ({
    description,
    additionalInfo,
    specifications,
    productId,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [reviews, setReviews] = useState<RatingComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const fetchedReviews = await getProductRatings(productId);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const formatSpecifications = () => {
        if (!specifications) return [];

        const excludedKeys = [
            "id",
            "name",
            "price",
            "imageUrl",
            "manufacturer",
            "availability",
            "url",
        ];

        return Object.entries(specifications)
            .filter(([key]) => !excludedKeys.includes(key))
            .map(([key, value]) => ({
                name: key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
                value: value as string,
            }));
    };

    // Calculate average rating
    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Count reviews by rating
    const ratingCounts = [0, 0, 0, 0, 0]; // 5 stars, 4 stars, 3 stars, 2 stars, 1 star
    reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[5 - review.rating]++;
        }
    });

    return (
        <div className="w-full bg-white p-2 sm:p-6">
            <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <TabList className="flex space-x-1 rounded-lg bg-blue-50 p-1 mb-6">
                    <Tab
                        className={({ selected }) =>
                            classNames(
                                "w-full rounded-lg py-3 text-base font-medium leading-5",
                                "focus:outline-none",
                                selected
                                    ? "bg-white text-primary shadow"
                                    : "text-gray-600 hover:bg-white hover:text-primary",
                            )
                        }
                    >
                        Mô tả sản phẩm
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            classNames(
                                "w-full rounded-lg py-3 text-base font-medium leading-5",
                                "focus:outline-none",
                                selected
                                    ? "bg-white text-primary shadow"
                                    : "text-gray-600 hover:bg-white hover:text-primary",
                            )
                        }
                    >
                        Thông số kỹ thuật
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            classNames(
                                "w-full rounded-lg py-3 text-base font-medium leading-5",
                                "focus:outline-none",
                                selected
                                    ? "bg-white text-primary shadow"
                                    : "text-gray-600 hover:bg-white hover:text-primary",
                            )
                        }
                    >
                        Đánh giá ({reviews.length})
                    </Tab>
                </TabList>
                <TabPanels className="mt-2">
                    {/* Description Panel */}
                    <TabPanel className="px-2 py-4 text-gray-700">
                        <div className="prose max-w-none">
                            <h3 className="text-xl font-semibold mb-4">
                                Mô tả sản phẩm
                            </h3>
                            <div>
                                {description ? description : "Không có mô tả"}
                            </div>
                            {additionalInfo && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-medium mb-2">
                                        Thông tin bổ sung
                                    </h4>
                                    <p>{additionalInfo}</p>
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    {/* Specifications Panel */}
                    <TabPanel className="px-2 py-4 text-gray-700">
                        <h3 className="text-xl font-semibold mb-4">
                            Thông số kỹ thuật
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <tbody>
                                    {formatSpecifications().map(
                                        (spec, index) => (
                                            <tr
                                                key={index}
                                                className={
                                                    index % 2 === 0
                                                        ? "bg-gray-50"
                                                        : "bg-white"
                                                }
                                            >
                                                <td className="py-3 px-4 text-gray-600">
                                                    {spec.name}
                                                </td>
                                                <td className="py-3 px-4 font-medium">
                                                    {spec.value}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>

                    {/* Reviews Panel */}
                    <TabPanel className="px-2 py-4 text-gray-700">
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold">
                                Đánh giá khách hàng
                            </h3>

                            {/* Rating Summary */}
                            <div className="flex flex-col md:flex-row gap-8 p-4 bg-gray-50 rounded-lg">
                                {/* Average Rating */}
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {averageRating.toFixed(1)}
                                    </span>
                                    <div className="mt-2">
                                        <StarRating rating={averageRating} />
                                    </div>
                                    <span className="text-sm text-gray-500 mt-1">
                                        ({reviews.length} đánh giá)
                                    </span>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="flex-1">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div
                                            key={star}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <div className="flex items-center min-w-[60px]">
                                                <span className="mr-1">
                                                    {star}
                                                </span>
                                                <span className="text-secondary">
                                                    ★
                                                </span>
                                            </div>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-secondary rounded-full"
                                                    style={{
                                                        width: reviews.length
                                                            ? `${(ratingCounts[5 - star] / reviews.length) * 100}%`
                                                            : "0%",
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-500 min-w-[30px]">
                                                {ratingCounts[5 - star]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Form */}
                            <RatingForm
                                productId={productId}
                                onRatingSubmitted={fetchReviews}
                            />

                            {/* Reviews List */}
                            <div className="mt-8">
                                <h4 className="text-lg font-medium mb-4">
                                    Tất cả đánh giá
                                </h4>
                                {isLoading ? (
                                    <div className="text-center py-4">
                                        Đang tải đánh giá...
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="border-b pb-6"
                                            >
                                                <div className="flex items-start">
                                                    <div className="mr-4">
                                                        {review.avatar ? (
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                                <Image
                                                                    src={
                                                                        review.avatar
                                                                    }
                                                                    alt={
                                                                        review.username
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <span className="text-gray-600">
                                                                    {review.username
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className="font-medium">
                                                                {
                                                                    review.username
                                                                }
                                                            </h5>
                                                            <span className="text-sm text-gray-500">
                                                                {review.date}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <StarRating
                                                                rating={
                                                                    review.rating
                                                                }
                                                                size="small"
                                                            />
                                                        </div>
                                                        <p className="text-gray-700">
                                                            {review.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        Chưa có đánh giá nào cho sản phẩm này
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default ProductInformation;
