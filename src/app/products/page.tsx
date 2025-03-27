"use client";

import React, { Suspense, useEffect } from "react";
import ProductsContent from "./ProductsContent";

const ProductsPage: React.FC = () => {
    useEffect(() => {
        document.title = "Danh sách sản phẩm";
    }, []);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <ProductsContent />
        </Suspense>
    );
};

export default ProductsPage;
