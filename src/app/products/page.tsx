"use client";

import React, { Suspense } from "react";
import ProductsContent from "./ProductsContent";

const ProductsPage: React.FC = () => {
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
