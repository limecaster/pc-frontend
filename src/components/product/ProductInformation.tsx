import React, { useState } from "react";
import Image from "next/image";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";

interface ProductSpec {
    name: string;
    value: string;
}

interface Review {
    id: string;
    username: string;
    rating: number;
    date: string;
    content: string;
    avatar: string;
}

interface ProductInformationProps {
    description: string;
    additionalInfo?: string;
    specifications: ProductSpec[];
    reviews?: Review[];
}

const ProductInformation: React.FC<ProductInformationProps> = ({
    description,
    additionalInfo,
    specifications,
    reviews = [],
}) => {
    const [activeTab, setActiveTab] = useState<
        "description" | "info" | "specs" | "reviews"
    >("description");

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={`full-${i}`} className="text-secondary">★</span>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <span key="half" className="relative inline-block">
                    <span className="text-gray-300 absolute">★</span>
                    <span
                        className="text-secondary absolute"
                        style={{ width: "50%", overflow: "hidden" }}
                    >
                        ★
                    </span>
                </span>
            );
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="text-gray-300">★</span>
            );
        }

        return stars;
    };

    // Calculate review statistics
    const calculateReviewStats = () => {
        if (!reviews.length) return { average: 0, total: 0, distribution: [] };

        const total = reviews.length;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;

        // Count reviews for each star rating (5 to 1)
        const starCounts = [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]

        reviews.forEach((review) => {
            const index = 5 - Math.floor(review.rating);
            if (index >= 0 && index < 5) {
                starCounts[index]++;
            }
        });

        // Calculate percentages and create distribution data
        const distribution = starCounts.map((count, index) => {
            const stars = 5 - index;
            const percentage =
                total > 0 ? Math.round((count / total) * 100) : 0;
            return { stars, count, percentage };
        });

        return { average, total, distribution };
    };

    const reviewStats = calculateReviewStats();

    return (
        <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
            {/* Tab Navigation */}
            <div className="flex border-b overflow-x-auto justify-center">
                <button
                    onClick={() => setActiveTab("description")}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                        activeTab === "description"
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                    Mô tả sản phẩm
                </button>
                <button
                    onClick={() => setActiveTab("info")}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                        activeTab === "info"
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                    Thông tin sản phẩm
                </button>
                <button
                    onClick={() => setActiveTab("specs")}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                        activeTab === "specs"
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                    Thông số chi tiết
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                        activeTab === "reviews"
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                    Đánh giá và nhận xét ({reviews.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {/* Description Tab */}
                {activeTab === "description" && (
                    <div className="prose max-w-none">
                        {description.split("\n").map((paragraph, idx) => (
                            <p key={idx} className="mb-4 text-gray-900">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                )}

                {/* Additional Information Tab */}
                {activeTab === "info" && (
                    <div className="prose max-w-none">
                        {additionalInfo ? (
                            additionalInfo.split("\n").map((paragraph, idx) => (
                                <p key={idx} className="mb-4 text-gray-900">
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <p className="text-gray-700">
                                Không có thông tin bổ sung.
                            </p>
                        )}
                    </div>
                )}

                {/* Specifications Tab */}
                {activeTab === "specs" && (
                    <div className="overflow-hidden border rounded-md">
                        {specifications.map((spec, index) => (
                            <div
                                key={index}
                                className={`flex border-b last:border-b-0 ${
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                            >
                                <div className="w-1/3 py-3 px-4 font-medium text-sm text-gray-900 border-r">
                                    {spec.name}
                                </div>
                                <div className="w-2/3 py-3 px-4 text-sm text-gray-600">
                                    {spec.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div>
                        {reviews && reviews.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {/* Review Summary */}
                                <div className="border-b pb-6 mb-4">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Average Rating */}
                                        <div className="flex flex-col items-center justify-center md:w-1/4 text-center">
                                            <div className="text-5xl font-bold text-gray-900">
                                                {reviewStats.average.toFixed(1)}
                                            </div>
                                            <div className="flex justify-center mt-2 mb-1">
                                                {renderStars(
                                                    reviewStats.average,
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {reviewStats.total} đánh giá
                                            </div>
                                        </div>

                                        {/* Rating Distribution */}
                                        <div className="flex-1">
                                            <div className="space-y-3">
                                                {reviewStats.distribution.map(
                                                    (item) => (
                                                        <div
                                                            key={`star-${item.stars}`}
                                                            className="flex items-center"
                                                        >
                                                            <span className="w-15 text-sm text-gray-700 flex items-center">
                                                                {Array.from({
                                                                    length: item.stars,
                                                                }).map(
                                                                    (
                                                                        _,
                                                                        index,
                                                                    ) => (
                                                                        <StarFilledIcon
                                                                            key={`filled-${index}`}
                                                                            className="text-secondary"
                                                                        />
                                                                    ),
                                                                )}
                                                                {Array.from({
                                                                    length:
                                                                        5 -
                                                                        item.stars,
                                                                }).map(
                                                                    (
                                                                        _,
                                                                        index,
                                                                    ) => (
                                                                        <StarIcon
                                                                            key={`empty-${index}`}
                                                                            className="text-gray-300"
                                                                        />
                                                                    ),
                                                                )}
                                                            </span>
                                                            <div className="w-full mx-4">
                                                                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-secondary"
                                                                        style={{
                                                                            width: `${item.percentage}%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <div className="w-16 text-xs text-gray-700">
                                                                {item.count} (
                                                                {
                                                                    item.percentage
                                                                }
                                                                %)
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Reviews */}
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border-b pb-6 last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-full overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={review.avatar}
                                                    alt={review.username}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {review.username}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex">
                                                        {renderStars(
                                                            review.rating,
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-700 ml-1">
                                                        {review.date}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {review.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Review pagination could go here */}
                                <div className="flex justify-center mt-6">
                                    <button className="px-4 py-2 bg-gray-100 rounded text-sm font-medium text-gray-900 hover:bg-gray-200">
                                        Xem thêm đánh giá
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-700">
                                    Chưa có đánh giá nào cho sản phẩm này.
                                </p>
                                <button className="mt-4 px-6 py-2 bg-primary text-white rounded font-medium text-sm">
                                    Viết đánh giá
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductInformation;
