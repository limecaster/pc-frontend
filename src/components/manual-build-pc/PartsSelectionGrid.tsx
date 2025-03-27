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

// Updated component categories to match exact keys used in the system
export const itemData = [
    {
        label: "CPU", // English key
        vietnameseLabel: "CPU", // Vietnamese key - same for CPU
        originalKey: "CPU", // This is the key used in selectedProducts
        imageSrc: <CpuChipIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Motherboard",
        vietnameseLabel: "Bo mạch chủ",
        originalKey: "Bo mạch chủ", // Use Vietnamese key in selectedProducts
        imageSrc: <ServerIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "RAM",
        vietnameseLabel: "RAM",
        originalKey: "RAM",
        imageSrc: <DeviceTabletIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "HDD",
        vietnameseLabel: "HDD",
        originalKey: "HDD",
        imageSrc: <CircleStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "SSD",
        vietnameseLabel: "SSD",
        originalKey: "SSD",
        imageSrc: <SquaresPlusIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "GraphicsCard",
        vietnameseLabel: "Card đồ họa",
        originalKey: "Card đồ họa",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "PowerSupply",
        vietnameseLabel: "Nguồn",
        originalKey: "Nguồn",
        imageSrc: <BoltIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Case",
        vietnameseLabel: "Vỏ case",
        originalKey: "Vỏ case",
        imageSrc: <CubeIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "CPUCooler",
        vietnameseLabel: "Quạt tản nhiệt",
        originalKey: "Quạt tản nhiệt",
        imageSrc: <ArrowPathIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Monitor",
        vietnameseLabel: "Màn hình",
        originalKey: "Màn hình",
        imageSrc: <ComputerDesktopIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Keyboard",
        vietnameseLabel: "Bàn phím",
        originalKey: "Bàn phím",
        imageSrc: <RectangleGroupIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "Mouse",
        vietnameseLabel: "Chuột",
        originalKey: "Chuột",
        imageSrc: <CursorArrowRaysIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "WiFiCard",
        vietnameseLabel: "Card mạng không dây",
        originalKey: "Card mạng không dây",
        imageSrc: <SignalIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "WiredNetworkCard",
        vietnameseLabel: "Card mạng có dây",
        originalKey: "Card mạng có dây",
        imageSrc: <ServerStackIcon className="w-12 h-12 text-gray-600" />,
    },
    {
        label: "ThermalPaste",
        vietnameseLabel: "Kem tản nhiệt",
        originalKey: "Kem tản nhiệt",
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
            {itemData.map(
                ({ label, imageSrc, vietnameseLabel, originalKey }) => {
                    // Check for component using both the original key and the label (for backwards compatibility)
                    const selectedItem =
                        selectedProducts[originalKey] ||
                        selectedProducts[label];

                    // Removed conditional rendering - show all component cards

                    return !selectedItem ? (
                        <ManualBuildPCItemCard
                            key={originalKey}
                            label={vietnameseLabel}
                            imageSrc={imageSrc}
                            description="Vui lòng chọn linh kiện"
                            buttonLabel="Chọn"
                            onButtonClick={() => onSelectClick(label)}
                        />
                    ) : (
                        <ProductCard
                            key={originalKey}
                            imageUrl={
                                selectedItem?.imageUrl ||
                                selectedItem?.image ||
                                "/images/image-placeholder.webp"
                            }
                            productName={selectedItem?.name || vietnameseLabel}
                            currentPrice={
                                selectedItem?.price?.toString() || "0"
                            }
                            originalPrice={
                                selectedItem?.originalPrice?.toString() ||
                                undefined
                            }
                            discountPercentage={
                                selectedItem?.discountPercentage
                                    ? Number(selectedItem.discountPercentage)
                                    : undefined
                            }
                            category={vietnameseLabel}
                            productUrl={
                                selectedItem?.id
                                    ? `/product/${selectedItem.id}`
                                    : "#"
                            }
                            buttonLabel="Sửa"
                            onButtonClick={() => onSelectClick(label)}
                            onRemoveClick={() => onRemovePart(originalKey)}
                        />
                    );
                },
            )}
        </div>
    );
};

export default PartsSelectionGrid;
