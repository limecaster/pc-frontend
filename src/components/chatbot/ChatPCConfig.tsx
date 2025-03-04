import React from "react";

export default function ChatbotPCConfig({ config }: { config: any }) {
  if (!config) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Cấu hình đề xuất
      </h3>
      <div className="space-y-2">
        {Object.entries(config).map(([partLabel, partData]: [string, any], index) => (
          <div key={index} className="flex justify-between border-b pb-1">
            <span className="text-gray-900 dark:text-white">{partData["name"]}</span>
            <span className="text-gray-900 dark:text-white">
              {partData["price"]?.toLocaleString("vi-VN")}đ
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
