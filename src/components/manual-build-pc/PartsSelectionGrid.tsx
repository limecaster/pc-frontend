import React from "react";
import { ManualBuildPCItemCard } from "./ManualBuildPCItemCard";
import { ProductCard } from "./ProductCard";

// Import Heroicons for PC components
import {
    ComputerDesktopIcon,
    ServerIcon,
    DeviceTabletIcon,
    CircleStackIcon,
    SquaresPlusIcon,
    CpuChipIcon,
    BoltIcon,
    CubeIcon,
    ArrowPathIcon,
    // Replace missing icons with available alternatives
    RectangleGroupIcon, // for Keyboard
    CursorArrowRaysIcon, // for Mouse
    SignalIcon,
    ServerStackIcon,
    BeakerIcon,
} from "@heroicons/react/24/outline";

interface PartsSelectionGridProps {
    selectedProducts: { [key: string]: any };
    onSelectClick: (category: string) => void;
    onRemovePart: (category: string) => void;
}

// Define formatPrice function locally
const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Updated component categories with available Heroicons
export const itemData = [
    {
        label: "CPU",
        imageSrc: <CpuChipIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Bo mạch chủ",
        imageSrc: <ServerIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "RAM",
        imageSrc: <DeviceTabletIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "HDD",
        imageSrc: <CircleStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "SSD",
        imageSrc: <SquaresPlusIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Card đồ họa",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Nguồn",
        imageSrc: <BoltIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Vỏ case",
        imageSrc: <CubeIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Quạt tản nhiệt",
        imageSrc: <ArrowPathIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Màn hình",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    // Fixed icons that were missing
    {
        label: "Bàn phím",
        imageSrc: <RectangleGroupIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Chuột",
        imageSrc: <CursorArrowRaysIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Card mạng không dây",
        imageSrc: <SignalIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Card mạng có dây",
        imageSrc: <ServerStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Kem tản nhiệt",
        imageSrc: <BeakerIcon className="w-12 h-12 text-gray-600" />,
    },
];

const PartsSelectionGrid: React.FC<PartsSelectionGridProps> = ({
    selectedProducts,
    onSelectClick,
    onRemovePart,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {itemData.map(({ label, imageSrc }) => {
                const selectedItem = selectedProducts[label];
                return !selectedItem ? (
                    <ManualBuildPCItemCard
                        key={label}
                        label={label}
                        imageSrc={imageSrc}
                        description="Vui lòng chọn linh kiện"
                        buttonLabel="Chọn"
                        onButtonClick={() => onSelectClick(label)}
                    />
                ) : (
                    <ProductCard
                        key={label}
                        imageUrl={
                            selectedItem?.imageUrl ||
                            "/images/image-placeholder.webp"
                        }
                        productName={selectedItem?.name || label}
                        currentPrice={selectedItem?.price?.toString() || "0"}
                        originalPrice={
                            selectedItem?.originalPrice?.toString() || undefined
                        }
                        discountPercentage={
                            selectedItem?.discountPercentage
                                ? Number(selectedItem.discountPercentage)
                                : undefined
                        }
                        logoUrl={selectedItem?.logoUrl || ""}
                        category={label}
                        productUrl={
                            selectedItem?.id
                                ? `/product/${selectedItem.id}`
                                : "#"
                        }
                        buttonLabel="Sửa"
                        onButtonClick={() => onSelectClick(label)}
                        onRemoveClick={() => onRemovePart(label)}
                    />
                );
            })}
        </div>
    );
};

export default PartsSelectionGrid;
