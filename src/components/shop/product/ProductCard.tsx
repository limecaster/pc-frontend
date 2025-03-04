import React, { useState } from "react";
import Image from "next/image";
import Heart from "@/assets/icon/shop/Heart.svg";
import Eye from "@/assets/icon/shop/Eye.svg";
import ShoppingCartSimple from "@/assets/icon/others/ShoppingCartSimple.svg";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
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
  const [isHovered, setIsHovered] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  
  return (
    <div 
      className="relative w-[234px] h-80 bg-gray-00 rounded-[3px] overflow-hidden border border-solid border-gray-100 transition-all duration-200 hover:border-gray-200 hover:shadow-[0px_8px_24px_#191c1e1f]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-[202px] h-[172px] top-4 left-4">
        {isHovered ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2">
            <button className="w-10 h-10 bg-gray-00 rounded-full flex items-center justify-center">
              <Image src={Heart} alt="Add to wishlist" width={24} height={24} />
            </button>
            <button className="w-10 h-10 bg-gray-00 rounded-full flex items-center justify-center">
             <Image src={ShoppingCartSimple} alt="Add to cart" width={24} height={24} />
            </button>
            <button className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Image src={Eye} alt="View details" width={24} height={24} />
            </button>
          </div>
        ) : null}
        <Image 
          src={imageUrl} 
          alt={name} 
          width={202} 
          height={172} 
          className="object-cover"
        />
      </div>

      <div className="inline-flex flex-col items-start gap-2 absolute top-[212px] left-4">
        <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
          <div className="inline-flex items-start relative flex-[0_0_auto]">
            {/* Star rating here */}
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>

          <div className="relative w-fit mt-[-1.00px] font-normal text-gray-500 text-xs tracking-[0] leading-4 whitespace-nowrap">
            ({reviewCount})
          </div>
        </div>

        <p className="relative w-[202px] h-10 font-normal text-gray-900 text-sm tracking-[0] leading-7 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {name}
        </p>

        <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] font-semibold text-primary-500 text-sm tracking-[0] leading-5 whitespace-nowrap">
            {formattedPrice}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
