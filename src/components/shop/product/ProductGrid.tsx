import React from "react";
import ProductCard from "./ProductCard";

// Mock data - this would typically come from an API
const mockProducts = [
  {
    id: "1",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 5,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-5@2x.png",
  },
  {
    id: "2",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 4,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-3@2x.png",
  },
  {
    id: "3",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 5,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-5@2x.png",
  },
  {
    id: "4",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 3,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-5@2x.png",
  },
  {
    id: "5",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 3,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-5@2x.png",
  },
  {
    id: "6",
    name: "Màn hình LCD ASUS 27\" ProArt Display PA279CV (3840 x 2160/IPS/60Hz/5 ms/Adaptive Sync)",
    price: 4000000,
    rating: 3,
    reviewCount: 738,
    imageUrl: "https://c.animaapp.com/OZxJqJj9/img/image-5@2x.png",
  },
  // Add more products as needed
];

interface ProductGridProps {
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ limit }) => {
  // If limit is provided, slice the array to that length
  const displayedProducts = limit ? mockProducts.slice(0, limit) : mockProducts;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayedProducts.map(product => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          rating={product.rating}
          reviewCount={product.reviewCount}
          imageUrl={product.imageUrl}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
