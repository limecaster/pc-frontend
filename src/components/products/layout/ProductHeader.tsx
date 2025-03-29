import React, { ReactNode } from "react";

interface ProductHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
    title,
    subtitle,
    icon,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center">
                {icon && <span className="text-xl mr-2">{icon}</span>}
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
    );
};

export default ProductHeader;
