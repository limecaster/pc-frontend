import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatters";
import { ProductDetailsDto } from "@/types/product";

interface ProductGridProps {
    products: ProductDetailsDto[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-500">
                    No products found
                </h3>
                <p className="text-gray-400 mt-2">
                    Try adjusting your search or filter criteria
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <Link
                    href={`/product/${product.id}`}
                    key={product.id}
                    className="group"
                >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg p-4">
                        <div className="aspect-square relative mb-4 overflow-hidden">
                            <Image
                                src={product.imageUrl || "/placeholder.png"}
                                alt={product.name}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600">
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-2">
                            {/* Star rating */}
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < Math.round(product.rating)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                ({product.reviewCount || 0})
                            </span>
                        </div>

                        <div className="flex items-baseline mb-1">
                            <span className="text-lg font-bold text-primary-600">
                                {formatCurrency(product.price)}
                            </span>

                            {product.originalPrice &&
                                product.originalPrice > product.price && (
                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                        {formatCurrency(product.originalPrice)}
                                    </span>
                                )}
                        </div>

                        {product.brand && (
                            <div className="text-xs text-gray-500 mb-2">
                                Thương hiệu: {product.brand}
                            </div>
                        )}

                        <div className="mt-2">
                            <span
                                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                    product.stock === "Còn hàng"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {product.stock}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid;
