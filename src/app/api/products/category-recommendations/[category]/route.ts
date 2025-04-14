import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

export const dynamic = "force-dynamic";

// Define a more compatible interface for Next.js 15+
interface Context {
    params: Promise<{
        category: string;
    }>;
}

export async function GET(request: NextRequest, context: Context) {
    try {
        const params = await context.params;
        const category = params.category;
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get("limit") || "10";

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category is required",
                    products: [],
                },
                { status: 400 },
            );
        }

        // Create URL for NestJS backend
        const url = `${API_URL}/products/category-recommendations/${encodeURIComponent(category)}?limit=${limit}`;

        console.log(`Calling NestJS category recommendations API: ${url}`);

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `Error from NestJS category recommendations service: ${response.status}`,
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to get category recommendations",
                },
                { status: response.status },
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            products: data.products || [],
            count: data.products?.length || 0,
        });
    } catch (error) {
        console.error("Error in category recommendations API route:", error);
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
