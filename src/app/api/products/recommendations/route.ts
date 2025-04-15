import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get("productId");
        const category = searchParams.get("category");
        const customerId = searchParams.get("customerId");
        const sessionId = searchParams.get("sessionId");
        const limit = searchParams.get("limit") || "4";

        let url = `${API_URL}/products/recommendations?limit=${limit}`;

        if (productId) {
            url += `&productId=${productId}`;
        }

        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }

        if (customerId) {
            url += `&customerId=${customerId}`;
        }

        if (sessionId) {
            url += `&sessionId=${encodeURIComponent(sessionId)}`;
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `Error from NestJS recommendation service: ${response.status}`,
            );
            return NextResponse.json(
                { success: false, message: "Failed to get recommendations" },
                { status: response.status },
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            products: data.products || [],
            recommendations: data.products?.map((p: any) => p.id) || [],
            count: data.products?.length || 0,
        });
    } catch (error) {
        console.error("Error in recommendations API route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                products: [],
                recommendations: [],
            },
            { status: 500 },
        );
    }
}
