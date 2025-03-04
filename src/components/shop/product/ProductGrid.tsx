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
  // Add more products as needed
];

const ProductGrid: React.FC = () => {
  // Group products into rows of 4
  const rows = [];
  for (let i = 0; i < mockProducts.length; i += 4) {
    rows.push(mockProducts.slice(i, i + 4));
  }

  return (
    <div className="inline-flex flex-col items-start gap-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="gap-4 inline-flex items-start relative flex-[0_0_auto]">
          {row.map(product => (
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
      ))}
    </div>
  );
};

export default ProductGrid;
