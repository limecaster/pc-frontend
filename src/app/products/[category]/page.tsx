"use client";

import { Suspense } from "react";
import ProductsCategoryContent from "./ProductsCategoryContent";


const ProductsCategoryPage: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <ProductsCategoryContent />
        </Suspense>
    );
}
export default ProductsCategoryPage;
