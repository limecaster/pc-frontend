import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBrands, BrandContent } from "@/api/brand";

// Fallback data in case CMS data is not available
const fallbackBrands = [
    {
        id: 1,
        contentKey: "asus",
        title: "ASUS",
        imageUrl: "/images/brands/asus.png",
        link: "/products?manufacturer=asus",
        displayOrder: 1,
    },
    {
        id: 2,
        contentKey: "msi",
        title: "MSI",
        imageUrl: "/images/brands/msi.png",
        link: "/products?manufacturer=msi",
        displayOrder: 2,
    },
    {
        id: 3,
        contentKey: "corsair",
        title: "Corsair",
        imageUrl: "/images/brands/corsair.png",
        link: "/products?manufacturer=corsair",
        displayOrder: 3,
    },
    {
        id: 4,
        contentKey: "amd",
        title: "AMD",
        imageUrl: "/images/brands/amd.png",
        link: "/products?manufacturer=amd",
        displayOrder: 4,
    },
    {
        id: 5,
        contentKey: "intel",
        title: "Intel",
        imageUrl: "/images/brands/intel.png",
        link: "/products?manufacturer=intel",
        displayOrder: 5,
    },
    {
        id: 6,
        contentKey: "nvidia",
        title: "NVIDIA",
        imageUrl: "/images/brands/nvidia.png",
        link: "/products?manufacturer=nvidia",
        displayOrder: 6,
    },
];

const BrandShowcase: React.FC = () => {
    const [brands, setBrands] = useState<BrandContent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                const brandsData = await getBrands();

                if (brandsData.length > 0) {
                    setBrands(brandsData);
                } else {
                    setBrands(fallbackBrands);
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
                setBrands(fallbackBrands);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Thương hiệu nổi bật
                </h2>
                <p className="text-gray-600">
                    Chúng tôi hợp tác với các thương hiệu hàng đầu
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {loading
                    ? // Loading state - show placeholders
                      Array(6)
                          .fill(0)
                          .map((_, index) => (
                              <div
                                  key={index}
                                  className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center"
                              >
                                  <div className="h-12 w-24 bg-gray-200 animate-pulse rounded"></div>
                              </div>
                          ))
                    : // Show actual brand data
                      brands.map((brand) => (
                          <Link href={brand.link} key={brand.id}>
                              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center h-full">
                                  <Image
                                      src={brand.imageUrl}
                                      alt={brand.title}
                                      width={120}
                                      height={60}
                                      className="object-contain h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                                  />
                              </div>
                          </Link>
                      ))}
            </div>
        </section>
    );
};

export default BrandShowcase;
