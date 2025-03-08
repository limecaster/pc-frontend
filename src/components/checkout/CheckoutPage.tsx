"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import VietQRLogo from "@/assets/VietQRLogo.png";
import { Tooltip } from "../ui/tooltip";
import { generateSlug } from "@/utils/slugify";
import PayOSPayment from "./PayOSPayment";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Alert = dynamic(() => import("@/components/ui/alert").then(mod => mod.Alert), { ssr: false });
const AlertTitle = dynamic(() => import("@/components/ui/alert").then(mod => mod.AlertTitle), { ssr: false });
const AlertDescription = dynamic(() => import("@/components/ui/alert").then(mod => mod.AlertDescription), { ssr: false });

type Ward = {
    name_with_type: string;
    code: string;
};

type District = {
    name_with_type: string;
    code: string;
    "xa-phuong": Record<string, Ward>;
};

type Province = {
    name_with_type: string;
    code: string;
    "quan-huyen": Record<string, District>;
};

type VietNamAdministrative = Record<string, Province>;

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CheckoutFormData {
    fullName: string;
    houseNumber: string;
    streetName: string;
    province: string;
    district: string;
    ward: string;
    email: string;
    phone: string;
    notes: string;
}

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    
    const [cartItems, setCartItems] = useState<Product[]>(() => {
        if (typeof window !== "undefined") {
            const storedCart = localStorage.getItem("cart");
            return storedCart ? JSON.parse(storedCart) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Mock form data
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        houseNumber: "",
        streetName: "",
        province: "",
        district: "",
        ward: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Mock province, district, and ward data
    const [addressData, setAddressData] = useState<VietNamAdministrative>({});
    const [provinces, setProvinces] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [wards, setWards] = useState<string[]>([]);

    useEffect(() => {
        fetch("/data/hanh-chinh-vn.json")
            .then((res) => res.json())
            .then((data) => {
                setAddressData(data);
                setProvinces(Object.entries(data).map(([_, details]) => (details as Province).name_with_type));
            });
    }, []);

    // Update districts when province changes
    useEffect(() => {
        if (formData.province) {
            const provinceKey = Object.keys(addressData).find(
                (key) => addressData[key].name_with_type === formData.province
            );
            if (provinceKey) {
                setDistricts(
                    Object.values(addressData[provinceKey]["quan-huyen"]).map((d) => d.name_with_type)
                );
                setFormData((prev) => ({ ...prev, district: "", ward: "" })); // Reset district and ward
            }
        }
    }, [formData.province]);

    // Update wards when district changes
    useEffect(() => {
        if (formData.district && formData.province) {
            const provinceKey = Object.keys(addressData).find(
                (key) => addressData[key].name_with_type === formData.province
            );
            if (provinceKey) {
                const districtKey = Object.keys(addressData[provinceKey]["quan-huyen"]).find(
                    (key) =>
                        addressData[provinceKey]["quan-huyen"][key].name_with_type === formData.district
                );
                if (districtKey) {
                    setWards(
                        Object.values(addressData[provinceKey]["quan-huyen"][districtKey]["xa-phuong"]).map(
                            (w) => w.name_with_type
                        )
                    );
                    setFormData((prev) => ({ ...prev, ward: "" })); // Reset ward
                }
            }
        }
    }, [formData.district]);

    // Calculate order totals
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );
    const deliveryFee = 0; // Free shipping
    const discountAmount = 0; // No discount applied
    const total = subtotal + deliveryFee - discountAmount;

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const [paymentData, setPaymentData] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [displayOrderId, setDisplayOrderId] = useState<string>('');

    useEffect(() => {
        setDisplayOrderId(`ORDER-${Date.now()}`);
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.fullName || !formData.province || !formData.district || 
            !formData.ward || !formData.email || !formData.phone) {
            setErrorMessage("Vui lòng điền đầy đủ thông tin");
            return;
        }
        
        // Validate cart
        if (cartItems.length === 0) {
            setErrorMessage("Giỏ hàng của bạn đang trống");
            return;
        }

        setIsProcessingPayment(true);
        setErrorMessage(null);
        
        try {
            // Format the complete address
            const fullAddress = `${formData.houseNumber}, ${formData.streetName}, ${formData.ward}, ${formData.district}, ${formData.province}`;
            
            // Prepare order data for payment
            const orderData = {
                orderId: displayOrderId,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                customer: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                },
                total: total,
                subtotal: subtotal,
                shippingFee: deliveryFee,
                discount: discountAmount,
                notes: formData.notes,
                returnUrl: window.location.origin + "/checkout/success",
                cancelUrl: window.location.origin + "/checkout",
            };

            console.log('Sending order data:', orderData);

            // Call backend to create payment
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            console.log('Payment response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to create payment: ${errorText}`);
            }

            // Parse the response JSON
            const responseData = await response.json();
            console.log('Payment response data:', responseData);
            
            // Check if responseData has the expected structure based on PayOS API response
            if (responseData.success && responseData.data) {
                // Our API wrapper structure: { success: true, data: { paymentLinkId, checkoutUrl, ... } }
                setPaymentData({
                    paymentLinkId: responseData.data.paymentLinkId,
                    checkoutUrl: responseData.data.checkoutUrl
                });
                
                setPaymentStep('payment');
                
                // Save order details to localStorage for success page
                localStorage.setItem('latestOrder', JSON.stringify({
                    orderId: responseData.originalOrderId || displayOrderId, // Use original ID if available
                    orderDate: new Date().toISOString(),
                    orderItems: cartItems.map(item => ({
                        ...item,
                        image: item.imageUrl // Make sure image is properly set
                    })),
                    shippingAddress: {
                        fullName: formData.fullName,
                        address: `${formData.houseNumber}, ${formData.streetName}`,
                        city: `${formData.ward}, ${formData.district}, ${formData.province}`,
                        phone: formData.phone
                    },
                    paymentMethod: "PayOS",
                    subtotal,
                    shippingFee: deliveryFee,
                    discount: discountAmount,
                    total
                }));
            } else {
                throw new Error(`Payment initialization failed: ${responseData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            setErrorMessage(`Có lỗi xảy ra khi tạo thanh toán: ${(error as Error).message}`);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentSuccess = () => {
        // Clear cart after successful payment
        setCartItems([]);
        localStorage.removeItem('cart');
        
        // Redirect to success page
        router.push('/checkout/success');
    };

    const handlePaymentError = (error: string) => {
        setErrorMessage(error);
        setPaymentStep('details');
    };

    // Remove item from cart
    const removeItem = (id: string) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
    };

    return (
        <div className="w-full bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    {paymentStep === 'details' ? 'Thanh toán' : 'Xác nhận thanh toán'}
                </h1>

                {errorMessage && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {paymentStep === 'details' ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col lg:flex-row gap-8 text-gray-700">
                            {/* Left column - Checkout form */}
                            <div className="w-full lg:w-2/3">
                                {/* Billing Information */}
                                <div className="bg-white rounded-lg shadow p-6 mb-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin thanh toán
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Full Name */}
                                        <div>
                                            <label
                                                htmlFor="fullName"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Họ tên người nhận
                                            </label>
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>

                                        {/* House Number */}
                                        <div>
                                            <label
                                                htmlFor="houseNumber"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Số nhà
                                            </label>
                                            <input
                                                type="text"
                                                id="houseNumber"
                                                name="houseNumber"
                                                value={formData.houseNumber}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>

                                        {/* Street Name */}
                                        <div>
                                            <label
                                                htmlFor="streetName"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Tên đường
                                            </label>
                                            <input
                                                type="text"
                                                id="streetName"
                                                name="streetName"
                                                value={formData.streetName}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>

                                        {/* Province/City, District, Ward Selectors */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Province/City */}
                                            <div>
                                                <label
                                                    htmlFor="province"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Tỉnh/Thành phố
                                                </label>
                                                <select
                                                    id="province"
                                                    name="province"
                                                    value={formData.province}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                    required
                                                >
                                                    <option value="">
                                                        Chọn tỉnh/thành phố
                                                    </option>
                                                    {provinces.map((province) => (
                                                        <option
                                                            key={province}
                                                            value={province}
                                                        >
                                                            {province}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* District */}
                                            <div>
                                                <label
                                                    htmlFor="district"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Quận/Huyện
                                                </label>
                                                <select
                                                    id="district"
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                    required
                                                >
                                                    <option value="">
                                                        Chọn quận/huyện
                                                    </option>
                                                    {districts.map((district) => (
                                                        <option
                                                            key={district}
                                                            value={district}
                                                        >
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Ward */}
                                            <div>
                                                <label
                                                    htmlFor="ward"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Xã/Phường
                                                </label>
                                                <select
                                                    id="ward"
                                                    name="ward"
                                                    value={formData.ward}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                    required
                                                >
                                                    <option value="">
                                                        Chọn xã/phường
                                                    </option>
                                                    {wards.map((ward) => (
                                                        <option
                                                            key={ward}
                                                            value={ward}
                                                        >
                                                            {ward}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

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
                                                <span className="mr-2">
                                                    Thanh toán qua PayOS
                                                </span>
                                                <Image
                                                    src={VietQRLogo}
                                                    alt="PayOS"
                                                    width={32}
                                                    height={32}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Sau khi bấm Đặt hàng, bạn sẽ được chuyển đến
                                            trang thanh toán an toàn để hoàn tất đơn hàng.
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
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Ghi chú đặc biệt cho đơn hàng của bạn"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Order Summary */}
                            <div className="w-full lg:w-1/3">
                                <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                                        Chi tiết đơn hàng
                                    </h2>

                                    {/* Products */}
                                    <div className="mt-6 space-y-4">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center space-x-4"
                                            >
                                                <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-grow w-0">
                                                    <Tooltip content={item.name}>
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                            <Link 
                                                                href={`/product/${item.id}-${generateSlug(item.name)}`}
                                                                className="hover:text-primary transition-colors"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </h3>
                                                    </Tooltip>
                                                    <span className="text-sm text-gray-500">
                                                        {item.quantity} x{" "}
                                                    </span>
                                                    <span className="text-sm font-medium text-primary">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(item.id)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
                                        <div className="flex justify-between text-base text-gray-900">
                                            <p>Tạm tính</p>
                                            <p className="text-primary font-medium">
                                                {formatCurrency(subtotal)}
                                            </p>
                                        </div>

                                        <div className="flex justify-between text-base text-gray-900">
                                            <p>Phí vận chuyển</p>
                                            <p className="text-secondary">
                                                {deliveryFee === 0
                                                    ? "Miễn phí"
                                                    : formatCurrency(deliveryFee)}
                                            </p>
                                        </div>

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-base text-gray-900">
                                                <p>Giảm giá</p>
                                                <p className="text-green-600 font-medium">
                                                    -
                                                    {formatCurrency(discountAmount)}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-lg font-medium">
                                            <p className="text-gray-900">
                                                Tổng cộng
                                            </p>
                                            <p className="text-primary font-semibold">
                                                {formatCurrency(total)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isProcessingPayment}
                                            className="w-full bg-primary py-3 px-4 rounded-md text-white font-medium 
                                            hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 
                                            focus:ring-primary text-center block transition-colors disabled:opacity-70"
                                        >
                                            {isProcessingPayment ? "Đang xử lý..." : "Đặt hàng"}
                                        </button>
                                    </div>

                                    <div className="mt-4">
                                        <Link
                                            href="/cart"
                                            className="w-full border border-gray-300 py-3 px-4 rounded-md text-gray-700 font-medium 
                                            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                            focus:ring-gray-500 text-center block transition-colors"
                                        >
                                            Quay lại giỏ hàng
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
                            Hoàn tất thanh toán của bạn
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Vui lòng hoàn tất thanh toán để xác nhận đơn hàng.
                        </p>
                        <PayOSPayment 
                            paymentData={paymentData} 
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                        />
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setPaymentStep('details')}
                                className="text-primary hover:text-primary-dark font-medium"
                            >
                                Quay lại thông tin thanh toán
                            </button>
                        </div>
                    </div>
                )}
            </div>W
        </div>
    );
};

export default CheckoutPage;
