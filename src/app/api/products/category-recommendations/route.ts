import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/config/constants";

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Export the GET handler explicitly
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get("category");
        const customerId = searchParams.get("customerId");
        const sessionId = searchParams.get("sessionId");
        const limit = searchParams.get("limit") || "10";

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category parameter is required",
                },
                { status: 400 },
            );
        }

        const requestId = Math.random().toString(36).substring(2, 15);

        console.log(`[${requestId}] Category recommendations request`, {
            category,
            customerId,
            sessionId,
            limit,
            url: request.url,
        });

        const apiUrl = new URL(
            `${API_URL}/products/category-recommendations/${category}`,
        );

        if (customerId) {
            apiUrl.searchParams.append("customerId", customerId);
        }
        if (sessionId) {
            apiUrl.searchParams.append("sessionId", sessionId);
        }
        if (limit) {
            apiUrl.searchParams.append("limit", limit);
        }

        // Add cache-busting parameter
        apiUrl.searchParams.append("_nocache", Date.now().toString());

        const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-request-id": requestId,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(
                `[${requestId}] Error fetching category recommendations:`,
                response.status,
                response.statusText,
            );
            const errorData = await response.text();
            console.error(`[${requestId}] Error details:`, errorData);

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to fetch category recommendations",
                },
                {
                    status: response.status,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                        "x-request-id": requestId,
                    },
                },
            );
        }

        const data = await response.json();

        console.log(`[${requestId}] Category recommendations response`, {
            success: true,
            productsCount: data.products?.length || 0,
        });

        return NextResponse.json(
            { success: true, products: data.products || [] },
            {
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                    "x-request-id": requestId,
                },
            },
        );
    } catch (error) {
        console.error("Error in category recommendations route:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
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
