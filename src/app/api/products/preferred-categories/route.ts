import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

// Force dynamic rendering and disable caching
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const customerId = searchParams.get("customerId");
        const sessionId = searchParams.get("sessionId");
        const limit = searchParams.get("limit") || "5";

        // Generate a unique request ID for debugging
        const requestId = Math.random().toString(36).substring(2, 12);

        let url = `${API_URL}/products/preferred-categories?limit=${limit}&_nocache=${Date.now()}`;

        if (customerId) {
            url += `&customerId=${customerId}`;
        }

        if (sessionId) {
            url += `&sessionId=${encodeURIComponent(sessionId)}`;
        }

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "x-request-id": requestId,
            },
            cache: "no-store",
            next: { revalidate: 0 },
        });

        if (!response.ok) {
            console.error(
                `[${requestId}] Error from NestJS preferred categories service: ${response.status}`,
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to get preferred categories",
                    categories: [],
                    requestId,
                },
                {
                    status: response.status,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                },
            );
        }

        const data = await response.json();

        return NextResponse.json(
            {
                success: true,
                categories: data.categories || [],
                requestId,
            },
            {
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            },
        );
    } catch (error) {
        console.error("Error in preferred categories API route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                categories: [],
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            },
        );
    }
}
