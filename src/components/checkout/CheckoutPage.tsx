"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@radix-ui/react-icons";
import VietQRLogo from "@/assets/VietQRLogo.png";
import { Tooltip } from "../ui/tooltip";
import PayOSPayment from "./PayOSPayment";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getCart } from "@/api/cart";
import { useCheckout } from "@/contexts/CheckoutContext"; // Add this import
import VietnamAddressSelect from "@/components/common/VietnamAddressSelect"; // Import the component

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
    const { createCheckoutOrder } = useCheckout(); // Extract the function from context
    
    // Changed to avoid hydration mismatch - initialize with empty array
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    
    // Load cart data from both localStorage and API when component mounts
    useEffect(() => {
        const loadCart = async () => {
            setIsLoadingCart(true);
            try {
                // First try to load from API if user is logged in
                if (localStorage.getItem("token")) {
                    try {
                        const response = await getCart();
                        if (response.success && response.cart) {
                            console.log("Cart loaded from API:", response.cart);
                            
                            // Map cart items from API to the Product interface with safety checks
                            const apiCartItems = response.cart.items?.map((item: any) => {
                                console.log("Processing cart item:", item);
                                
                                // Handle both possible structures:
                                // 1. Item with nested product object: { product: { id, name, ... }, quantity, ... }
                                // 2. Item with flat structure: { id, productId, productName, quantity, ... }
                                
                                if (item.productId && item.productName) {
                                    // Flat structure
                                    return {
                                        id: item.productId,
                                        name: item.productName,
                                        price: parseFloat(item.price || item.subPrice / item.quantity) || 0,
                                        quantity: item.quantity || 1,
                                        imageUrl: item.imageUrl || '/images/placeholder.png'
                                    };
                                } else if (item.product) {
                                    // Nested structure
                                    return {
                                        id: item.product.id || `temp-${Date.now()}-${Math.random()}`,
                                        name: item.product.name || "Unknown Product",
                                        price: parseFloat(item.product.price) || 0,
                                        quantity: item.quantity || 1,
                                        imageUrl: item.product.imageUrl || 
                                                  (item.product.images && item.product.images[0]) || 
                                                  '/images/placeholder.png'
                                    };
                                } else {
                                    console.error("Unrecognized cart item structure:", item);
                                    return null;
                                }
                            }).filter(Boolean) || []; // Filter out any null items
                            
                            console.log("Processed cart items:", apiCartItems);
                            setCartItems(apiCartItems);
                            
                            // Also update localStorage for consistency
                            localStorage.setItem("cart", JSON.stringify(apiCartItems));
                            return;
                        }
                    } catch (error) {
                        console.error("Error loading cart from API:", error);
                        // Fall back to localStorage if API fails
                    }
                }
                
                // If API call fails or user is not logged in, try localStorage
                const storedCart = localStorage.getItem("cart");
                if (storedCart) {
                    try {
                        const parsedCart = JSON.parse(storedCart);
                        console.log("Cart loaded from localStorage:", parsedCart);
                        
                        // Ensure all cart items have necessary properties
                        const validCartItems = parsedCart.filter((item: any) => 
                            item && typeof item === 'object' && item.id);
                            
                        setCartItems(validCartItems);
                    } catch (error) {
                        console.error("Error parsing cart from localStorage:", error);
                        setCartItems([]);
                    }
                }
            } catch (error) {
                console.error("Error loading cart:", error);
                setCartItems([]);
            } finally {
                setIsLoadingCart(false);
            }
        };
        
        loadCart();
    }, []);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (!isLoadingCart) { // Only update localStorage after initial load
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems, isLoadingCart]);

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

    // Remove these effects as they're now handled by the VietnamAddressSelect component
    // useEffect for loading administrative data
    // useEffect for updating districts when province changes
    // useEffect for updating wards when district changes

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
            
            // Create order data
            const orderData = {
                items: cartItems,
                shippingInfo: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                },
                notes: formData.notes
            };

            // Use checkout context to create order
            const result = await createCheckoutOrder(
                orderData.items.map(item => ({ ...item, productId: item.id })),
                orderData.shippingInfo,
                orderData.notes
            );
            
            if (result && result.success) {
                // Clear cart
                setCartItems([]);
                localStorage.removeItem('cart');
                
                // Navigate to success page
                router.push('/checkout/success');
            } else {
                throw new Error("Failed to create order");
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setErrorMessage(`Có lỗi xảy ra khi đặt hàng: ${(error as Error).message}`);
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

    // If cart is loading, show a loading indicator
    if (isLoadingCart) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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

                                        {/* Replace the three select boxes with VietnamAddressSelect */}
                                        <VietnamAddressSelect
                                            selectedCity={formData.province}
                                            selectedDistrict={formData.district}
                                            selectedWard={formData.ward}
                                            onCityChange={(city) => setFormData(prev => ({ ...prev, province: city }))}
                                            onDistrictChange={(district) => setFormData(prev => ({ ...prev, district }))}
                                            onWardChange={(ward) => setFormData(prev => ({ ...prev, ward }))}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                            required={true}
                                            selectClassName="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                            labels={{
                                                city: "Tỉnh/Thành phố",
                                                district: "Quận/Huyện",
                                                ward: "Xã/Phường"
                                            }}
                                        />

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
                                        {cartItems && cartItems.length > 0 ? (
                                            cartItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center space-x-4"
                                                >
                                                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                                        <Image
                                                            src={item.imageUrl || '/images/placeholder.png'}
                                                            alt={item.name || 'Product'}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-grow w-0">
                                                        <Tooltip content={item.name}>
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                <Link 
                                                                    href={`/product/${item.id}`}
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
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Your cart is empty
                                            </div>
                                        )}
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
            </div>
        </div>
    );
};

export default CheckoutPage;
