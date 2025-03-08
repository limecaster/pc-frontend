import { NextResponse } from "next/server";
import { addMultipleToCart } from "@/api/cart";
import { getSession } from "@/utils/session";

export async function POST(request: Request) {
    try {
        // Check if user is authenticated
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { productIds } = body;

        if (
            !productIds ||
            !Array.isArray(productIds) ||
            productIds.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid product IDs array is required",
                },
                { status: 400 },
            );
        }

        const response = await addMultipleToCart(productIds);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error adding multiple products to cart:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Error adding products to cart";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 },
        );
    }
}
