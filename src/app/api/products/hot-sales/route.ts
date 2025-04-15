import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

export async function GET(request: NextRequest) {
    try {
        const url = `${API_URL}/products/hot-sales`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `Error from NestJS hot-sales service: ${response.status}`,
            );
            return NextResponse.json(
                { success: false, message: "Failed to get hot sales products" },
                { status: response.status },
            );
        }

        const products = await response.json();

        return NextResponse.json({
            success: true,
            products: products || [],
            count: products?.length || 0,
        });
    } catch (error) {
        console.error("Error in hot-sales API route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                products: [],
            },
            { status: 500 },
        );
    }
}
