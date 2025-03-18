"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { submitRating, hasUserRatedProduct } from "@/api/rating";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from "./StarRating";

interface RatingFormProps {
    productId: string;
    onRatingSubmitted: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
    productId,
    onRatingSubmitted,
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    // Check if user has already rated this product
    useEffect(() => {
        if (isAuthenticated && productId) {
            const checkRating = async () => {
                try {
                    const hasRated = await hasUserRatedProduct(productId);
                    setHasRated(hasRated);
                    // Removed toast message from here to avoid duplicate notifications
                } catch (error) {
                    console.error("Error checking rating status:", error);
                }
            };
            checkRating();
        }
    }, [isAuthenticated, productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
            router.push("/authenticate");
            return;
        }

        if (rating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá");
            return;
        }

        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setIsSubmitting(true);

        try {
            await submitRating({
                productId,
                stars: rating,
                comment,
            });

            toast.success(
                hasRated
                    ? "Đánh giá đã được cập nhật!"
                    : "Đánh giá đã được gửi thành công!",
            );
            setRating(0);
            setComment("");
            setHasRated(true);
            onRatingSubmitted();
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error(
                "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-sm"
        >
            <h3 className="text-lg font-medium mb-4">
                {hasRated ? "Cập nhật đánh giá của bạn" : "Viết đánh giá"}
            </h3>

            {/* Add notice message when user has already rated */}
            {hasRated && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                    <span className="text-lg mr-2">ℹ️</span>
                    <p className="text-sm">
                        Bạn đã đánh giá sản phẩm này trước đó. Gửi đánh giá mới
                        sẽ cập nhật đánh giá cũ.
                    </p>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đánh giá sao
                </label>
                <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    editable={true}
                    size="large"
                />
            </div>

            <div className="mb-4">
                <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Nội dung đánh giá
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary 
                    ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
                {isSubmitting
                    ? "Đang gửi..."
                    : hasRated
                      ? "Cập nhật đánh giá"
                      : "Gửi đánh giá"}
            </button>
        </form>
    );
};

export default RatingForm;
