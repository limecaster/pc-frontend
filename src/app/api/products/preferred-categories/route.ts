import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

// Force dynamic rendering and disable caching
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const customerId = searchParams.get("customerId");
        const sessionId = searchParams.get("sessionId");
        const limit = searchParams.get("limit") || "5";

        // Create URL for NestJS backend
        let url = `${API_URL}/products/preferred-categories?limit=${limit}`;

        if (customerId) {
            url += `&customerId=${customerId}`;
        }

        if (sessionId) {
            url += `&sessionId=${encodeURIComponent(sessionId)}`;
        }

        console.log(`Calling NestJS preferred categories API: ${url}`);

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `Error from NestJS preferred categories service: ${response.status}`,
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to get preferred categories",
                    categories: [],
                },
                { status: response.status },
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            categories: data.categories || [],
        });
    } catch (error) {
        console.error("Error in preferred categories API route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                categories: [],
            },
            { status: 500 },
        );
    }
}
