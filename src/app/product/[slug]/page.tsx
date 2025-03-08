"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { HeartIcon } from "@radix-ui/react-icons";
import Cart from "@/assets/icon/shop/Cart.svg";
import ProductInformation from "@/components/product/ProductInformation";
import { toast } from "react-hot-toast"; // Add Toaster import
import { ProductDetails } from "@/types/ProductDetails"; // Corrected path

// Replace the mock data function with an actual API call
const fetchProduct = async (id: string): Promise<ProductDetails | null> => {
    try {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/products/${id}`,
        );
        console.log("Response:", response);

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

const ProductDetailPage = () => {
    useEffect(() => {
        document.title = "B Store - Chi tiết sản phẩm";
    }, []);
    const params = useParams();
    const slug = params?.slug
        ? Array.isArray(params.slug)
            ? params.slug[0]
            : params.slug
        : "";

    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState("");
    const [isWishlist, setIsWishlist] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const id = slug;
                const productData = await fetchProduct(id);
                setProduct(productData);
                if (productData?.imageUrl) {
                    setMainImage(productData.imageUrl);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error loading product:", error);
                setLoading(false);
            }
        };

        if (slug) {
            loadProduct();
        }

        // Load initial cart count
        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItemCount(
            cartItems.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0,
            ),
        );
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-white w-full">
                <div className="text-xl">Loading product details...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-white w-full">
                <div className="text-xl text-red-500">Product not found</div>
            </div>
        );
    }

    // Format prices with Vietnamese currency format
    const formattedPrice =
        new Intl.NumberFormat("vi-VN").format(product.price) + "đ";
    const formattedOriginalPrice = product.originalPrice
        ? new Intl.NumberFormat("vi-VN").format(product.originalPrice) + "đ"
        : "";

    // Handlers
    const handleAddToCart = () => {
        if (!product) return;

        try {
            // Get current cart from localStorage
            const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
            console.log("Current cart items:", cartItems);
            // Check if product already exists in cart
            const existingItemIndex = cartItems.findIndex(
                (item: any) => item.id === product.id,
            );

            if (existingItemIndex >= 0) {
                // Update quantity if product already exists
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Add new product to cart
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: quantity,
                });
            }

            // Save updated cart to localStorage
            localStorage.setItem("cart", JSON.stringify(cartItems));

            // Update cart item count
            const newCount = cartItems.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0,
            );
            setCartItemCount(newCount);

            // Show success notification
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
                duration: 3000,
            });
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        }
    };

    const handleBuyNow = () => {
        console.log(`Buying now: ${quantity} of product ${product.id}`);
    };

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist);
        console.log(
            `${isWishlist ? "Removing from" : "Adding to"} wishlist: ${
                product.id
            }`,
        );
    };

    return (
        <div className="w-full bg-gray-50">
            {/* Main product section */}
            <div className="container mx-auto py-8 px-4 bg-white">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Product Images Section */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        {/* Main image */}
                        <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                priority
                            />
                        </div>

                        {/* Thumbnail images */}
                        {product.additionalImages &&
                            product.additionalImages.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <div
                                        className={`w-20 h-20 cursor-pointer border-2 ${
                                            mainImage === product.imageUrl
                                                ? "border-primary"
                                                : "border-transparent"
                                        }`}
                                        onClick={() =>
                                            setMainImage(product.imageUrl)
                                        }
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>

                                    {product.additionalImages.map(
                                        (img, index) => (
                                            <div
                                                key={index}
                                                className={`w-20 h-20 cursor-pointer border-2 ${
                                                    mainImage === img
                                                        ? "border-primary"
                                                        : "border-transparent"
                                                }`}
                                                onClick={() =>
                                                    setMainImage(img)
                                                }
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={img}
                                                        alt={`${
                                                            product.name
                                                        } - view ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                    </div>

                    {/* Product Details Section */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        {/* Rating and title */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        // Handle partial stars for decimal ratings
                                        const starFill = Math.min(
                                            Math.max(product.rating - i, 0),
                                            1,
                                        );
                                        if (starFill === 1) {
                                            return (
                                                <span
                                                    key={i}
                                                    className="text-secondary"
                                                >
                                                    ★
                                                </span>
                                            );
                                        } else if (starFill > 0) {
                                            // Partial star
                                            return (
                                                <span
                                                    key={i}
                                                    className="relative inline-block"
                                                >
                                                    <span className="text-gray-300 absolute">
                                                        ★
                                                    </span>
                                                    <span
                                                        className="text-secondary absolute"
                                                        style={{
                                                            width: `${
                                                                starFill * 100
                                                            }%`,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                </span>
                                            );
                                        } else {
                                            return (
                                                <span
                                                    key={i}
                                                    className="text-gray-300"
                                                >
                                                    ★
                                                </span>
                                            );
                                        }
                                    })}
                                </div>
                                <span className="font-semibold text-sm text-gray-900 ml-2">
                                    {product.rating} sao
                                </span>
                                <span className="text-sm text-gray-600">
                                    (
                                    {product.reviewCount.toLocaleString(
                                        "vi-VN",
                                    )}{" "}
                                    phản hồi)
                                </span>
                            </div>

                            <h1 className="text-2xl font-medium text-gray-900">
                                {product.name}
                            </h1>
                        </div>

                        {/* Product info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p>
                                <span className="text-gray-600">SKU: </span>
                                <span className="font-semibold text-gray-900">
                                    {product.sku}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-600">
                                    Tình trạng:{" "}
                                </span>
                                <span className="font-semibold text-green-600">
                                    {product.stock}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-600">
                                    Thương hiệu:{" "}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {product.brand}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-600">
                                    Loại sản phẩm:{" "}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {product.category}
                                </span>
                            </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mt-2">
                            <div className="text-2xl font-bold text-primary">
                                {formattedPrice}
                            </div>
                            {formattedOriginalPrice && (
                                <div className="text-lg text-gray-500 line-through">
                                    {formattedOriginalPrice}
                                </div>
                            )}
                            {product.discount && (
                                <div className="bg-yellow-400 text-sm font-semibold px-2 py-1 rounded">
                                    {product.discount}% OFF
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-200" />

                        {/* Options (color, size, etc.) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Color selection if available */}
                            {product.color && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Color
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="p-1.5 rounded-full border-2 border-primary">
                                            <div className="w-8 h-8 rounded-full bg-black"></div>
                                        </div>
                                        <div className="p-1.5 rounded-full border border-gray-200">
                                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Size selection if available */}
                            {product.size && (
                                <div className="flex flex-col gap-2 text-gray-700">
                                    <label className="text-sm font-medium">
                                        Kích thước màn hình
                                    </label>
                                    <select className="w-full p-3 border border-gray-200 rounded text-sm">
                                        <option>{product.size}</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Quantity and Add to Cart */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            {/* Quantity selector */}
                            <div className="flex items-center justify-between px-5 py-4 w-[164px] border-2 border-gray-300 rounded">
                                <button
                                    onClick={() =>
                                        setQuantity(Math.max(1, quantity - 1))
                                    }
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    -
                                </button>
                                <span className="font-medium text-gray-900">
                                    {String(quantity).padStart(2, "0")}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to cart button */}
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded font-bold"
                            >
                                <Image
                                    src={Cart}
                                    alt="Add to cart"
                                    width={24}
                                    height={24}
                                    className="filter brightness-0 invert"
                                />
                                THÊM VÀO GIỎ HÀNG
                            </button>

                            {/* Buy now button */}
                            <button
                                onClick={handleBuyNow}
                                className="px-8 py-4 border-2 border-primary text-primary font-bold rounded"
                            >
                                MUA NGAY
                            </button>
                        </div>

                        {/* Wishlist and Compare */}
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-6">
                                <button
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                    onClick={toggleWishlist}
                                >
                                    <HeartIcon
                                        className={`${
                                            isWishlist
                                                ? "text-red-500 fill-current"
                                                : "text-gray-500"
                                        }`}
                                    />
                                    Thêm vào danh sách yêu thích
                                </button>
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700">
                                    Chia sẻ sản phẩm:
                                </span>
                                <div className="flex gap-3">
                                    <button className="text-gray-600 hover:text-gray-800">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z" />
                                            <path d="M11 7H13V9H11V7Z" />
                                            <path d="M11 11H13V17H11V11Z" />
                                        </svg>
                                    </button>
                                    <button className="text-gray-600 hover:text-blue-600">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M15 8C15 4.1 11.9 1 8 1C4.1 1 1 4.1 1 8C1 11.5 3.4 14.4 6.6 15V10.3H5V8H6.6V6.3C6.6 4.5 7.6 3.5 9.2 3.5C10 3.5 10.8 3.7 10.8 3.7V5.2H9.9C9.1 5.2 8.7 5.8 8.7 6.3V8H10.7L10.4 10.3H8.8V15.1C12 14.4 15 11.5 15 8Z" />
                                        </svg>
                                    </button>
                                    <button className="text-gray-600 hover:text-blue-400">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M15 3.3C14.4 3.6 13.8 3.8 13.1 3.9C13.8 3.5 14.3 2.8 14.5 2.1C13.9 2.5 13.2 2.7 12.4 2.9C11.8 2.2 10.9 1.8 10 1.8C8.3 1.8 6.8 3.3 6.8 5C6.8 5.3 6.9 5.5 6.9 5.8C4.2 5.7 1.7 4.4 0.3 2.4C0 2.9 -0.1 3.4 -0.1 4C-0.1 5.1 0.4 6.1 1.1 6.7C0.5 6.7 0 6.5 -0.5 6.3V6.4C-0.5 7.9 0.7 9.1 2.1 9.4C1.8 9.5 1.5 9.5 1.2 9.5C0.9 9.5 0.7 9.5 0.5 9.4C0.9 10.6 1.9 11.5 3.2 11.5C2.1 12.4 0.8 12.9 -0.6 12.9C-0.8 12.9 -1.1 12.9 -1.3 12.8C0 13.8 1.5 14.3 3.1 14.3C10 14.3 13.8 8.5 13.8 3.5C13.8 3.3 13.8 3.2 13.8 3.1C14.4 2.7 15 2.1 15 1.5"
                                                transform="translate(1 1)"
                                            />
                                        </svg>
                                    </button>
                                    <button className="text-gray-600 hover:text-red-600">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M8 0C3.6 0 0 3.6 0 8C0 11.4 2 14.2 5 15.2C5 14.6 5 13.8 5 13.2C5 13.2 3.1 13.7 2.7 12.3C2.7 12.3 2.4 11.4 2 11.2C2 11.2 1.4 10.7 2 10.7C2 10.7 2.7 10.8 3.1 11.5C3.7 12.7 4.7 12.3 5 12.1C5.1 11.6 5.3 11.2 5.5 10.9C4 10.7 2.5 10.4 2.5 7.4C2.5 6.5 2.7 6.2 3.1 5.6C3 5.4 2.8 4.6 3.2 3.4C3.8 3.2 5 4.1 5 4.1C5.5 3.9 6.1 3.8 6.7 3.8C7.3 3.8 7.9 3.9 8.4 4.1C8.4 4.1 9.6 3.2 10.2 3.4C10.6 4.6 10.4 5.4 10.3 5.6C10.7 6.2 11 6.6 11 7.4C11 10.4 9.4 10.7 7.9 10.9C8.2 11.2 8.4 11.7 8.4 12.5C8.4 13.6 8.4 14.5 8.4 15C11.3 14.2 13.4 11.3 13.4 8C13.5 3.6 9.9 0 8 0Z"
                                                transform="translate(1.25 0.5)"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="mt-4">
                            <h3 className="font-bold text-sm mb-2 text-gray-900">
                                Chính sách bán hàng
                            </h3>
                            <div className="flex flex-col gap-1 text-gray-600 text-sm">
                                <div className="flex items-center gap-2">
                                    <Image
                                        className="w-6 h-6"
                                        src="https://c.animaapp.com/vaaCW8Fs/img/image-11-1@2x.png"
                                        alt="Image"
                                        width={24}
                                        height={24}
                                    />
                                    <span className="text-sm">
                                        Miễn phí giao hàng cho đơn hàng từ 5
                                        triệu
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Image
                                        className="w-6 h-6"
                                        src="https://c.animaapp.com/vaaCW8Fs/img/image-13-1@2x.png"
                                        alt="Image"
                                        width={24}
                                        height={24}
                                    />
                                    <span className="text-sm">
                                        Đổi trả trong vòng 10 ngày
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information Section */}
                <div className="container mx-auto my-6 px-4">
                    <ProductInformation
                        description={product.description}
                        additionalInfo={product.additionalInfo}
                        specifications={product.specifications}
                        reviews={product.reviews}
                    />
                </div>

                {/* Related Products Section could go here */}
                <div className="container mx-auto mt-8 mb-12 px-4 bg-white py-6"></div>
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                    Sản phẩm tương tự
                </h2>
                {/* You could place a simplified version of the ProductGrid component here */}
            </div>
        </div>
    );
};

export default ProductDetailPage;
