import React from "react";

export default function ChatbotPCConfig({ config }: { config: any }) {
  if (!config) return null;

  const totalPrice = Object.values(config).reduce(
    (sum: number, part: any) => sum + (part.price || 0),
    0
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2">
        Cấu hình đề xuất
      </h3>
      <div className="space-y-3">
        {Object.entries(config).map(([partLabel, partData]: [string, any], index) => (
          <div key={index} className="flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
            <span className="text-gray-900 dark:text-white font-medium">{partData["name"]}</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {partData["price"]?.toLocaleString("vi-VN")}đ
            </span>
          </div>
        ))}
        
        <div className="border-t pt-3 mt-2 flex justify-between items-center">
          <span className="text-gray-900 dark:text-white font-bold">Tổng</span>
          <span className="text-primary font-bold text-lg">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>
    </div>
  );
}
