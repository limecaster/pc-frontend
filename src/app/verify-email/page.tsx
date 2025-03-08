"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  
  const email = searchParams?.get('email');
  const token = searchParams?.get('token');

  useEffect(() => {
    document.title = "B Store - Xác thực email";
    
    const verify = async () => {
      if (!email || !token) {
        setErrorMessage("Liên kết xác thực không hợp lệ hoặc đã hết hạn");
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail(email, token);
        setIsSuccess(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi khi xác thực email");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [email, token, verifyEmail]);

  // Redirect to login after successful verification
  useEffect(() => {
    if (isSuccess) {
      const redirectTimeout = setTimeout(() => {
        router.push('/authenticate?message=Email đã được xác thực thành công. Bạn có thể đăng nhập.');
      }, 3000); // Redirect after 3 seconds
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [isSuccess, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Đang xác thực email của bạn...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 text-green-700 rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực thành công!</h2>
            <p className="text-gray-600 mb-4">Email của bạn đã được xác thực thành công.</p>
            <p className="text-gray-500 mb-6">Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...</p>
            <Link
              href="/authenticate"
              className="bg-primary text-white py-2 px-6 rounded hover:bg-primary-dark transition duration-200"
            >
              Đi đến đăng nhập
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-red-100 text-red-700 rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực thất bại</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex flex-col space-y-3 w-full">
              <Link
                href="/authenticate"
                className="bg-primary text-white py-2 px-6 rounded hover:bg-primary-dark transition duration-200 text-center"
              >
                Đi đến đăng nhập
              </Link>
              <Link
                href="/"
                className="text-gray-600 py-2 px-6 rounded border border-gray-300 hover:bg-gray-50 transition duration-200 text-center"
              >
                Trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
