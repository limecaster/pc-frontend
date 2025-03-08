"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

interface PayOSPaymentProps {
  paymentData: {
    checkoutUrl: string;
    paymentLinkId: string;
  } | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PayOSPayment: React.FC<PayOSPaymentProps> = ({
  paymentData,
  onSuccess,
  onError,
}) => {
  const [isPayOSLoaded, setIsPayOSLoaded] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  useEffect(() => {
    if (isPayOSLoaded && paymentData && !paymentInitialized) {
      try {
        console.log("Initializing PayOS with data:", paymentData);
        // @ts-ignore - PayOS is loaded from external script
        const payOS = new window.PayOS();
        payOS.init({
          paymentLinkId: paymentData.paymentLinkId,
          containerID: "payos-checkout",
          onSuccess: function (data: any) {
            console.log("Payment success:", data);
            onSuccess();
          },
          onError: function (error: any) {
            console.error("Payment error:", error);
            onError("Thanh toán thất bại. Vui lòng thử lại sau.");
          },
          onClose: function () {
            console.log("Payment closed");
          },
        });
        setPaymentInitialized(true);
      } catch (error) {
        console.error("Error initializing PayOS:", error);
        onError("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
      }
    }
  }, [isPayOSLoaded, paymentData, paymentInitialized, onSuccess, onError]);

  // If we have a direct checkout URL, we could also offer a direct link option
  const openPaymentPage = () => {
    if (paymentData?.checkoutUrl) {
      window.open(paymentData.checkoutUrl, "_blank");
    }
  };

  return (
    <>
      <Script
        src="https://cdn.payos.vn/checkout/1.0/payos-checkout.min.js"
        strategy="lazyOnload"
        onLoad={() => setIsPayOSLoaded(true)}
      />
      <div id="payos-checkout" className="w-full min-h-[400px]"></div>
      
      {/* Optional: Add a direct checkout link as fallback */}
      {paymentData?.checkoutUrl && (
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Nếu form thanh toán không hiển thị, hãy nhấn vào nút bên dưới:
          </p>
          <button
            onClick={openPaymentPage}
            className="text-primary hover:text-primary-dark underline"
          >
            Mở trang thanh toán
          </button>
        </div>
      )}
    </>
  );
};

export default PayOSPayment;
