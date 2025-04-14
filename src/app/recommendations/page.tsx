"use client";

import React, { useEffect, useState } from "react";
import {
    fetchAdvancedRecommendations,
    fetchCategoryRecommendations,
    fetchPreferredCategories,
} from "@/api/recommend-products";
import ProductCarousel from "@/components/products/product/ProductCarousel";
import { ProductDetailsDto } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryData {
    id: string;
    name: string;
    products: ProductDetailsDto[];
    loading: boolean;
}

const getCategoryDisplayName = (categoryId: string): string => {
    const displayNames: Record<string, string> = {
        CPU: "CPU được đề xuất",
        GraphicsCard: "Card đồ họa đề xuất",
        Motherboard: "Bo mạch chủ",
        RAM: "Bộ nhớ RAM",
        InternalHardDrive: "Ổ cứng SSD/HDD",
        PowerSupply: "Nguồn máy tính",
        Case: "Vỏ case máy tính",
        Monitor: "Màn hình",
        Keyboard: "Bàn phím",
        Mouse: "Chuột",
        Headphone: "Tai nghe",
    };

    return displayNames[categoryId] || categoryId;
};

const getCategorySubtitle = (categoryId: string): string => {
    const subtitles: Record<string, string> = {
        CPU: "Bộ vi xử lý hiệu năng cao",
        GraphicsCard: "Cho trải nghiệm gaming và đồ họa tuyệt vời",
        Motherboard: "Bo mạch chủ để kết nối và tương tác giữa các thiết bị",
        RAM: "Bộ nhớ tốc độ cao cho hệ thống của bạn",
        InternalHardDrive: "Lưu trữ nhanh và đáng tin cậy",
        PowerSupply: "Nguồn điện ổn định cho hệ thống",
        Case: "Vỏ case đẹp và tiện dụng",
        Monitor: "Màn hình độ phân giải cao",
        Keyboard: "Bàn phím cơ chất lượng cao",
        Mouse: "Chuột chơi game chính xác",
        Headphone: "Âm thanh chất lượng cho game và giải trí",
    };

    return subtitles[categoryId] || "Sản phẩm được đề xuất riêng cho bạn";
};

export default function RecommendationsPage() {
    const [personalRecommendations, setPersonalRecommendations] = useState<
        ProductDetailsDto[]
    >([]);
    const [categoryRecommendations, setCategoryRecommendations] = useState<
        CategoryData[]
    >([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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

                try {
                    const preferredCategories =
                        await fetchPreferredCategories(4);

                    const initialCategoryData = preferredCategories.map(
                        (category) => ({
                            id: category,
                            name: getCategoryDisplayName(category),
                            products: [],
                            loading: true,
                        }),
                    );
                    setCategoryRecommendations(initialCategoryData);

                    const categoryPromises = preferredCategories.map(
                        async (category) => {
                            try {
                                const categoryProducts =
                                    await fetchCategoryRecommendations(
                                        category,
                                        10,
                                    );
                                return {
                                    id: category,
                                    name: getCategoryDisplayName(category),
                                    products: categoryProducts,
                                    loading: false,
                                };
                            } catch (error) {
                                console.error(
                                    `Error fetching ${category} recommendations:`,
                                    error,
                                );
                                return {
                                    id: category,
                                    name: getCategoryDisplayName(category),
                                    products: [],
                                    loading: false,
                                };
                            }
                        },
                    );

                    const categoryResults = await Promise.all(categoryPromises);
                    setCategoryRecommendations(categoryResults);
                } catch (preferredCategoriesError) {
                    console.error(
                        "Error fetching preferred categories:",
                        preferredCategoriesError,
                    );
                    const defaultCategories = [
                        "CPU",
                        "GraphicsCard",
                        "Motherboard",
                        "RAM",
                    ];
                    const initialCategoryData = defaultCategories.map(
                        (category) => ({
                            id: category,
                            name: getCategoryDisplayName(category),
                            products: [],
                            loading: true,
                        }),
                    );
                    setCategoryRecommendations(initialCategoryData);

                    const categoryPromises = defaultCategories.map(
                        async (category) => {
                            try {
                                const categoryProducts =
                                    await fetchCategoryRecommendations(
                                        category,
                                        10,
                                    );
                                return {
                                    id: category,
                                    name: getCategoryDisplayName(category),
                                    products: categoryProducts,
                                    loading: false,
                                };
                            } catch (error) {
                                console.error(
                                    `Error fetching ${category} recommendations:`,
                                    error,
                                );
                                return {
                                    id: category,
                                    name: getCategoryDisplayName(category),
                                    products: [],
                                    loading: false,
                                };
                            }
                        },
                    );

                    const categoryResults = await Promise.all(categoryPromises);
                    setCategoryRecommendations(categoryResults);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendationProducts();
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <div className="container mx-auto px-4 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Sản phẩm được đề xuất cho bạn
                </h1>
                <p className="text-gray-600 mb-8">
                    Dựa trên lịch sử duyệt và mua sắm của bạn, chúng tôi đã chọn
                    ra những sản phẩm phù hợp nhất
                </p>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="personal">Cho bạn</TabsTrigger>
                        <TabsTrigger value="categories">
                            Theo danh mục
                        </TabsTrigger>
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

                    <TabsContent value="categories">
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
