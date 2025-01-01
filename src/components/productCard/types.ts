export interface ProductCardProps {
  imageUrl: string;
  productName: string;
  currentPrice: string;
  originalPrice: string;
  discountPercentage: string;
  logoUrl: string;
  category: string;
}

export interface ManualBuildPCItemCardProps {
  label: string;
  imageSrc: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}