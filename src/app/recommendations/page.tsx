"use client";

import React, { useEffect, useState } from "react";
import { fetchAdvancedRecommendations } from "@/api/recommend-products";
import ProductCarousel from "@/components/products/product/ProductCarousel";
import { ProductDetailsDto } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function RecommendationsPage() {
    const [personalRecommendations, setPersonalRecommendations] = useState<
        ProductDetailsDto[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        let currentSessionId = sessionStorage.getItem("sessionId");

        if (!currentSessionId) {
            currentSessionId = localStorage.getItem("sessionId");
        }

        setSessionId(currentSessionId);
    }, []);

    useEffect(() => {
        document.title = "B Store - Sản phẩm được đề xuất cho bạn";

        const fetchRecommendationProducts = async () => {
            setLoading(true);
            try {
                const personalData = await fetchAdvancedRecommendations(
                    undefined,
                    10,
                );
                setPersonalRecommendations(personalData);
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendationProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <div className="container mx-auto px-4 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Sản phẩm được đề xuất cho bạn
                </h1>
                <p className="text-gray-600 mb-2">
                    Dựa trên lịch sử duyệt và mua sắm của bạn, chúng tôi đã chọn
                    ra những sản phẩm phù hợp nhất
                </p>

                {/* Show user context information */}
                <div className="mb-6 text-sm text-gray-500">
                    {user ? (
                        <p>
                            Đề xuất cá nhân hóa cho:{" "}
                            <span className="font-medium text-primary">
                                {user.firstName || user.lastName
                                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                    : user.username}
                            </span>
                        </p>
                    ) : (
                        <p>Đề xuất dựa trên phiên làm việc hiện tại của bạn</p>
                    )}
                </div>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="personal">Cho bạn</TabsTrigger>
                        {/* <TabsTrigger value="categories">
                            Theo danh mục
                        </TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="personal">
                        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
                            <ProductCarousel
                                products={personalRecommendations}
                                isLoading={loading}
                                title="Sản phẩm dành cho bạn"
                                subtitle="Dựa trên lịch sử duyệt và mua sắm của bạn"
                                slidesToShow={5}
                            />
                        </div>
                    </TabsContent>

                    {/* <TabsContent value="categories">
                        {categoryRecommendations.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-xl p-6 shadow-md mb-8"
                            >
                                <ProductCarousel
                                    products={category.products}
                                    isLoading={category.loading}
                                    title={category.name}
                                    subtitle={getCategorySubtitle(category.id)}
                                    slidesToShow={5}
                                    viewAllLink={`/products?category=${category.id}`}
                                />
                            </div>
                        ))}
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    );
}
