import React from "react";
import { Spinner } from "flowbite-react";
import { StatisticsCardProps } from "@/types/discount";

const StatisticsCards: React.FC<StatisticsCardProps> = ({
    totalUsage,
    totalSavings,
    mostUsedDiscounts,
    isLoading,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">
                    Tổng lượt sử dụng
                </div>
                <div className="text-2xl font-bold text-gray-900">
                    {isLoading ? (
                        <Spinner size="sm" />
                    ) : (
                        totalUsage.toLocaleString()
                    )}
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">
                    Tổng tiền giảm
                </div>
                <div className="text-2xl font-bold text-green-600">
                    {isLoading ? (
                        <Spinner size="sm" />
                    ) : (
                        `${totalSavings.toLocaleString()}₫`
                    )}
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">
                    Mã giảm giá được sử dụng nhiều nhất
                </div>
                <div className="text-lg font-bold text-blue-600">
                    {isLoading ? (
                        <Spinner size="sm" />
                    ) : mostUsedDiscounts.length > 0 ? (
                        mostUsedDiscounts[0].discountCode
                    ) : (
                        "Chưa có dữ liệu"
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsCards;
