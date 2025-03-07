import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Heart from "@/assets/icon/shop/Heart.svg";
import Eye from "@/assets/icon/shop/Eye.svg";
import Cart from "@/assets/icon/shop/Cart.svg";
import { Tooltip } from "@/components/ui/tooltip";
import { generateSlug } from "@/utils/slugify";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;  // Can be decimal now
  reviewCount: number;
  imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  rating,
  reviewCount,
  imageUrl,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  const productSlug = generateSlug(name);
  
  const handleProductClick = () => {
    router.push(`/product/${id}-${productSlug}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/product/${id}-${productSlug}`);
  };
  
  // Render stars with decimal support
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-secondary">★</span>
      );
    }
    
    // Render half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative inline-block">
          <span className="text-gray-300 absolute">★</span>
          <span className="text-secondary absolute" style={{ width: '50%', overflow: 'hidden' }}>★</span>
        </span>
      );
    }
    
    // Render remaining empty stars
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }
    
    return stars;
  };

  return (
    <div 
      className="relative w-full bg-white rounded-md overflow-hidden border border-solid border-gray-100 transition-all duration-200 hover:border-gray-200 hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Image section with hover overlay */}
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill
          className="object-cover object-center transition-transform duration-300 hover:scale-105"
        />
        
        {/* Dark overlay on hover */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'opacity-60' : 'opacity-0'
          }`}
        />
        
        {/* Action buttons - positioned on top of the overlay but only visible when hovered */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              hoveredButton === 'heart' ? 'bg-primary' : 'bg-white'
            }`}
            onMouseEnter={() => setHoveredButton('heart')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              console.log('Add to wishlist');
            }}
            aria-label="Add to wishlist"
          >
            <Image 
              src={Heart} 
              alt="Heart" 
              width={20} 
              height={20} 
              className={`${hoveredButton === 'heart' ? 'filter brightness-0 invert' : ''}`}
            />
          </button>
          
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              hoveredButton === 'cart' ? 'bg-primary' : 'bg-white'
            }`}
            onMouseEnter={() => setHoveredButton('cart')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              console.log('Add to cart');
            }}
            aria-label="Add to cart"
          >
            <Image 
              src={Cart} 
              alt="Cart" 
              width={20} 
              height={20} 
              className={`${hoveredButton === 'cart' ? 'filter brightness-0 invert' : ''}`}
            />
          </button>
          
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              hoveredButton === 'eye' ? 'bg-primary' : 'bg-white'
            }`}
            onMouseEnter={() => setHoveredButton('eye')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={handleQuickView}
            aria-label="Quick view"
          >
            <Image 
              src={Eye} 
              alt="Eye" 
              width={20} 
              height={20} 
              className={`${hoveredButton === 'eye' ? 'filter brightness-0 invert' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Product details */}
      <div className="p-4 flex flex-col gap-2">
        {/* Rating and reviews */}
        <div className="flex items-center gap-2">
          <div className="flex text-sm">
            {renderStars()}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>
        
        {/* Product name with tooltip for full name on hover */}
        <Tooltip content={name}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 cursor-default">
            {name}
          </h3>
        </Tooltip>
        
        {/* Price */}
        <div className="font-semibold text-sm text-primary">
          {formattedPrice}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
