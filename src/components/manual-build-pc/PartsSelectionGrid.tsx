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

// Updated component categories with available Heroicons
export const itemData = [
    {
        label: "CPU",
        vietnameseLabel: "CPU",
        imageSrc: <CpuChipIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Motherboard",
        vietnameseLabel: "Bo mạch chủ",
        imageSrc: <ServerIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "RAM",
        vietnameseLabel: "RAM",
        imageSrc: <DeviceTabletIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "HDD",
        vietnameseLabel: "HDD",
        imageSrc: <CircleStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "SSD",
        vietnameseLabel: "SSD",
        imageSrc: <SquaresPlusIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "GraphicsCard",
        vietnameseLabel: "Card đồ họa",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "PowerSupply",
        vietnameseLabel: "Nguồn",
        imageSrc: <BoltIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Case",
        vietnameseLabel: "Vỏ case",
        imageSrc: <CubeIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "CPUCooler",
        vietnameseLabel: "Quạt tản nhiệt",
        imageSrc: <ArrowPathIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Monitor",
        vietnameseLabel: "Màn hình",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Keyboard",
        vietnameseLabel: "Bàn phím",
        imageSrc: <RectangleGroupIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Mouse",
        vietnameseLabel: "Chuột",
        imageSrc: <CursorArrowRaysIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "WiFiCard",
        vietnameseLabel: "Card mạng không dây",
        imageSrc: <SignalIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "WiredNetworkCard",
        vietnameseLabel: "Card mạng có dây",
        imageSrc: <ServerStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "ThermalPaste",
        vietnameseLabel: "Kem tản nhiệt",
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
            {itemData.map(({ label, imageSrc, vietnameseLabel }) => {
                const selectedItem = selectedProducts[label];
                return !selectedItem ? (
                    <ManualBuildPCItemCard
                        key={label}
                        label={vietnameseLabel}
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
                        // logoUrl={selectedItem?.logoUrl || ""}
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
