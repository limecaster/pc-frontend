import React from "react";
import Image from "next/image";
import VietQRLogo from "@/assets/VietQRLogo.png";

interface PaymentSectionProps {
    notes: string;
    onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
    notes,
    onNotesChange,
}) => {
    return (
        <>
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Phương thức thanh toán
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center border rounded-md p-4">
                        <input
                            id="payos"
                            name="paymentMethod"
                            type="radio"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            checked
                            readOnly
                        />
                        <label
                            htmlFor="payos"
                            className="ml-3 flex items-center"
                        >
                            <span className="mr-2">Thanh toán qua PayOS</span>
                            <Image
                                src={VietQRLogo}
                                alt="PayOS"
                                width={32}
                                height={32}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">
                        Sau khi bấm Đặt hàng, bạn sẽ được chuyển đến trang thanh
                        toán an toàn để hoàn tất đơn hàng.
                    </p>
                </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Thông tin thêm về đơn hàng
                </h2>

                <div>
                    <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Ghi chú (tùy chọn)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={notes}
                        onChange={onNotesChange}
                        placeholder="Ghi chú đặc biệt cho đơn hàng của bạn"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>
        </>
    );
};

export default PaymentSection;
