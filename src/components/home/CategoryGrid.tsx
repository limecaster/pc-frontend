import React from "react";
import CategoryCard from "./CategoryCard";

// Categories data
const categories = [
  {
    id: "cpu",
    name: "CPU - Bộ vi xử lý",
    image: "/cpu.webp",
    href: "/products/cpu"
  },
  {
    id: "mainboard",
    name: "Mainboard - Bo mạch chủ",
    image: "/motherboard.jpeg",
    href: "/products/mainboard"
  },
  {
    id: "ram",
    name: "RAM - Bộ nhớ trong",
    image: "/ram.png",
    href: "/products/ram"
  },
  {
    id: "vga",
    name: "VGA - Card màn hình",
    image: "/vga.jpg",
    href: "/products/vga"
  },
  {
    id: "ssd",
    name: "SSD - Ổ cứng thể rắn",
    image: "/ssd.webp",
    href: "/products/ssd"
  },
  {
    id: "psu",
    name: "PSU - Nguồn máy tính",
    image: "/psu.jpg",
    href: "/products/psu"
  },
  {
    id: "case",
    name: "Case - Vỏ máy tính",
    image: "/case.jpg",
    href: "/products/case"
  },
  {
    id: "monitor",
    name: "Màn hình",
    image: "/monitor.webp",
    href: "/products/monitor"
  }
];

const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          name={category.name}
          image={category.image}
          href={category.href}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
