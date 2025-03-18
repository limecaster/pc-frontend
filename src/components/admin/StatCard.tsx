import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    changeType = "neutral",
    icon,
    isLoading = false,
}) => {
    const changeColorClass =
        changeType === "positive"
            ? "text-green-600 bg-green-100"
            : changeType === "negative"
              ? "text-red-600 bg-red-100"
              : "text-gray-600 bg-gray-100";

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {icon && (
                    <div className="p-2 rounded-full bg-blue-100 text-primary">
                        {icon}
                    </div>
                )}
            </div>
            <div className="mt-2">
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {change && (
                    <div className="mt-1">
                        <span
                            className={`text-xs font-medium ${changeColorClass} px-2 py-0.5 rounded-full`}
                        >
                            {change}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
