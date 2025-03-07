import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, href }) => {
  return (
    <Link 
      href={href}
      className="group block overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
      </div>
      
      <div className="bottom-0 left-0 right-0 p-4 bg-gray-100">
        <h3 className="text-center text-lg font-semibold text-gray-800">{name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
