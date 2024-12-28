import { ManualBuildPCItemCard } from "@/components/productCard/ManualBuildPCItemCard";
import { ProductCard } from "@/components/productCard/ProductCard";
import { ProductCardProps } from "@/components/productCard/types";

import cpuIcon from "@/assets/icon/pc-parts/cpu.svg";
import motherboardIcon from "@/assets/icon/pc-parts/motherboard.svg";
import ramIcon from "@/assets/icon/pc-parts/ram.svg";
import hddIcon from "@/assets/icon/pc-parts/hdd.svg";
import ssdIcon from "@/assets/icon/pc-parts/ssd.svg";
import gpuIcon from "@/assets/icon/pc-parts/gpu.svg";
import psuIcon from "@/assets/icon/pc-parts/psu.svg";
import caseIcon from "@/assets/icon/pc-parts/case.svg";
import cpucoolerIcon from "@/assets/icon/pc-parts/cpucooler.svg";
import monitorIcon from "@/assets/icon/pc-parts/monitor.svg";
import peripheralIcon from "@/assets/icon/pc-parts/peripheral.svg";
import extensibleCardIcon from "@/assets/icon/pc-parts/extensible-card.svg";
import accessoriesIcon from "@/assets/icon/pc-parts/other.svg";

const productCardProps: ProductCardProps = {
    imageUrl: "/images/product-card-image.jpg",
    productName: "Product Name",
    currentPrice: "1000000",
    originalPrice: "2000000",
    discountPercentage: "50%",
    logoUrl: "/images/product-card-logo.jpg",
    category: "CPU",
};

const itemData = [
    { label: "CPU", imageSrc: cpuIcon },
    { label: "Bo mạch chủ", imageSrc: motherboardIcon },
    { label: "RAM", imageSrc: ramIcon },
    { label: "HDD", imageSrc: hddIcon },
    { label: "SSD", imageSrc: ssdIcon },
    { label: "Card đồ họa", imageSrc: gpuIcon },
    { label: "Nguồn", imageSrc: psuIcon },
    { label: "Vỏ case", imageSrc: caseIcon },
    { label: "Quạt tản nhiệt", imageSrc: cpucoolerIcon },
    { label: "Màn hình", imageSrc: monitorIcon },
    { label: "Thiết bị ngoại vi", imageSrc: peripheralIcon },
    { label: "Card mở rộng", imageSrc: extensibleCardIcon },
    { label: "Phụ kiện khác", imageSrc: accessoriesIcon },
];

export default function ManualBuildPC() {
    return (
        <div className="grid grid-col-1 gap-4 justify-center py-4 w-full bg-bgSecondary">
            <ProductCard {...productCardProps} />
            {itemData.map(({ label, imageSrc }) => (
                <ManualBuildPCItemCard
                    key={label}
                    label={label}
                    imageSrc={imageSrc}
                    description="Vui lòng chọn linh kiện"
                />
            ))}
        </div>
    );
}
