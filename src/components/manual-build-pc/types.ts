export interface ProductCardProps {
    imageUrl?: string;
    productName: string;
    currentPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    category?: string;
    buttonLabel?: string;
    productUrl?: string;
    onButtonClick: () => void;
    onRemoveClick?: () => void;
}

export interface ProductInfoProps {
    category?: string;
    imageUrl: string;
    productName: string;
    productUrl?: string;
}

export interface ManualBuildPCItemCardProps {
    label: string;
    // Update to allow React elements
    imageSrc: string | React.ReactNode;
    description: string;
    buttonLabel: string;
    onButtonClick: () => void;
}
