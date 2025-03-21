export interface ProductCardProps {
    imageUrl?: string;
    productName: string;
    currentPrice?: string;
    originalPrice?: string;
    discountPercentage?: number;
    logoUrl?: string;
    category: string;
    productUrl?: string;
    buttonLabel?: string;
    onButtonClick?: () => void;
    onRemoveClick?: () => void;
}

export interface ManualBuildPCItemCardProps {
    label: string;
    // Update to allow React elements
    imageSrc: string | React.ReactNode;
    description: string;
    buttonLabel: string;
    onButtonClick: () => void;
}
