import { NextResponse } from "next/server";
import { addToCart } from "@/api/cart";
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
        const { productId, quantity } = body;

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 },
            );
        }

        const response = await addToCart(productId, quantity || 1);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error adding product to cart:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Error adding product to cart";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 },
        );
    }
}
