"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const OrderTrackingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    orderId: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    orderId: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { orderId: "", email: "" };

    if (!formData.orderId.trim()) {
      newErrors.orderId = "Vui lòng nhập mã đơn hàng";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // In a real app, you might want to validate this with your API first
      // For now, we'll just navigate to the order tracking page
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push(`/track-order/${formData.orderId}`);
    } catch (error) {
      console.error("Error tracking order:", error);
      setErrors({
        orderId: "Không thể tìm thấy đơn hàng với thông tin này",
        email: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Tra cứu đơn hàng
            </h1>
            
            <p className="text-gray-600 mb-6">
              Nhập mã đơn hàng và địa chỉ email của bạn để theo dõi trạng thái đơn hàng.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="orderId" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã đơn hàng
                </label>
                <input
                  type="text"
                  id="orderId"
                  name="orderId"
                  placeholder="Ví dụ: ORD-2023-11001"
                  value={formData.orderId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 text-gray-800 border rounded-md focus:ring-primary focus:border-primary ${
                    errors.orderId ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.orderId && (
                  <p className="mt-1 text-sm text-red-500">{errors.orderId}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email bạn đã sử dụng khi đặt hàng"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 text-gray-800 border rounded-md focus:ring-primary focus:border-primary ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary text-white font-medium py-3 px-4 rounded-md hover:bg-primary-dark transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Không tìm thấy mã đơn hàng trong email? 
                <Link 
                  href="/contact" 
                  className="text-primary hover:underline ml-1"
                >
                  Liên hệ hỗ trợ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingForm;
