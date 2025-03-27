"use client";

import { Suspense, use, useEffect } from "react";
import ProductsCategoryContent from "./ProductsCategoryContent";

const ProductsCategoryPage: React.FC = () => {
    useEffect(() => {
        document.title = "Danh mục sản phẩm";
    }, []);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <ProductsCategoryContent />
        </Suspense>
    );
};
export default ProductsCategoryPage;
