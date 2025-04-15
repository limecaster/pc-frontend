import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};
// Format date for API requests using local time values,
// ensuring that the returned string can be parsed by Date()
const formatDateForAPI = (date: Date): string => {
    const pad = (n: number): string => (n < 10 ? "0" + n : n.toString());

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const formatted = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;

    return formatted;
};

/**
 * Get sales report data
 */
export async function getSalesReport(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/sales-report?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            // Extract more detailed error info if available
            let errorDetails = "";
            try {
                const errorJson = await response.json();
                errorDetails = errorJson.message || errorJson.error || "";
            } catch (e) {
                // Ignore JSON parsing errors
            }

            throw new Error(
                `Failed to fetch sales report: ${response.status} ${errorDetails}`,
            );
        }

        const data = await response.json();

        // Validate that we have a proper response with required properties
        if (!data || !data.summary) {
            console.warn(
                "Sales report data is missing expected properties",
                data,
            );
        }

        return data;
    } catch (error) {
        console.error("Error fetching sales report:", error);
        // Return mock data as fallback
        return {
            summary: {
                totalRevenue: 12560000,
                totalProfit: 3768000,
                totalTax: 1256000,
                orderCount: 48,
                averageOrderValue: 261667,
                revenueChange: 12.5,
                profitChange: 8.3,
                orderCountChange: 15.2,
            },
            timeSeries: [
                { date: "01/06", revenue: 1200000, profit: 360000 },
                { date: "02/06", revenue: 980000, profit: 294000 },
                { date: "03/06", revenue: 1100000, profit: 330000 },
                { date: "04/06", revenue: 1350000, profit: 405000 },
                { date: "05/06", revenue: 1500000, profit: 450000 },
                { date: "06/06", revenue: 1180000, profit: 354000 },
                { date: "07/06", revenue: 1450000, profit: 435000 },
                { date: "08/06", revenue: 1720000, profit: 516000 },
                { date: "09/06", revenue: 1080000, profit: 324000 },
                { date: "10/06", revenue: 2000000, profit: 600000 },
            ],
        };
    }
}

/**
 * Get best selling products
 */
export async function getBestSellingProducts(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/best-selling-products?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch best selling products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching best selling products:", error);
        // Return mock data as fallback
        return [
            {
                name: "Laptop Gaming Acer Nitro 5",
                quantity: 12,
                revenue: 336000000,
            },
            { name: "Màn hình Dell 27 inch", quantity: 8, revenue: 32000000 },
            { name: "Chuột Logitech G Pro X", quantity: 23, revenue: 11500000 },
            {
                name: "RAM Kingston HyperX 16GB",
                quantity: 15,
                revenue: 12000000,
            },
            {
                name: "Tai nghe SteelSeries Arctis 7",
                quantity: 9,
                revenue: 7200000,
            },
        ];
    }
}

/**
 * Get best selling categories
 */
export async function getBestSellingCategories(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/best-selling-categories?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch best selling categories: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching best selling categories:", error);
        // Return mock data as fallback
        return [
            { name: "Laptop", value: 436000000 },
            { name: "Màn hình", value: 52000000 },
            { name: "Linh kiện", value: 38000000 },
            { name: "Chuột & Bàn phím", value: 25000000 },
            { name: "Tai nghe", value: 15000000 },
        ];
    }
}

/**
 * Get user behavior report with proper typing
 */
export async function getUserBehaviorReport(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/user-behavior?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch user behavior report: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user behavior report:", error);
        // Return mock data as fallback
        return {
            summary: {
                totalVisitors: 2450,
                newVisitors: 1630,
                returningVisitors: 820,
                averageTimeOnSite: 245, // seconds
                bounceRate: 42.5, // percent
                conversionRate: 3.2, // percent
            },
            visitorData: [
                {
                    date: "01/06",
                    visitors: 220,
                    newVisitors: 150,
                    returningVisitors: 70,
                },
                {
                    date: "02/06",
                    visitors: 180,
                    newVisitors: 120,
                    returningVisitors: 60,
                },
                {
                    date: "03/06",
                    visitors: 210,
                    newVisitors: 140,
                    returningVisitors: 70,
                },
                {
                    date: "04/06",
                    visitors: 270,
                    newVisitors: 180,
                    returningVisitors: 90,
                },
                {
                    date: "05/06",
                    visitors: 310,
                    newVisitors: 210,
                    returningVisitors: 100,
                },
                {
                    date: "06/06",
                    visitors: 240,
                    newVisitors: 160,
                    returningVisitors: 80,
                },
                {
                    date: "07/06",
                    visitors: 280,
                    newVisitors: 190,
                    returningVisitors: 90,
                },
                {
                    date: "08/06",
                    visitors: 260,
                    newVisitors: 170,
                    returningVisitors: 90,
                },
                {
                    date: "09/06",
                    visitors: 230,
                    newVisitors: 150,
                    returningVisitors: 80,
                },
                {
                    date: "10/06",
                    visitors: 250,
                    newVisitors: 160,
                    returningVisitors: 90,
                },
            ],
        };
    }
}

/**
 * Get most viewed products
 */
export async function getMostViewedProducts(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/most-viewed-products?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch most viewed products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching most viewed products:", error);
        // Return mock data as fallback
        return [
            {
                name: "Laptop Gaming Acer Nitro 5",
                views: 1250,
                purchases: 18,
                conversionRate: 1.44,
            },
            {
                name: "Màn hình Dell 27 inch",
                views: 980,
                purchases: 12,
                conversionRate: 1.22,
            },
            {
                name: "Chuột Logitech G Pro X",
                views: 1450,
                purchases: 35,
                conversionRate: 2.41,
            },
            {
                name: "RAM Kingston HyperX 16GB",
                views: 780,
                purchases: 25,
                conversionRate: 3.21,
            },
            {
                name: "Tai nghe SteelSeries Arctis 7",
                views: 820,
                purchases: 17,
                conversionRate: 2.07,
            },
        ];
    }
}

/**
 * Get abandoned carts data
 */
export async function getAbandonedCarts(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/abandoned-carts?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch abandoned carts data: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching abandoned carts data:", error);
        // Return mock data as fallback
        return [
            { date: "01/06", totalCarts: 48, abandonedCarts: 32, rate: 66.7 },
            { date: "02/06", totalCarts: 42, abandonedCarts: 28, rate: 66.7 },
            { date: "03/06", totalCarts: 45, abandonedCarts: 30, rate: 66.7 },
            { date: "04/06", totalCarts: 56, abandonedCarts: 38, rate: 67.9 },
            { date: "05/06", totalCarts: 63, abandonedCarts: 42, rate: 66.7 },
            { date: "06/06", totalCarts: 50, abandonedCarts: 34, rate: 68.0 },
            { date: "07/06", totalCarts: 58, abandonedCarts: 38, rate: 65.5 },
            { date: "08/06", totalCarts: 54, abandonedCarts: 36, rate: 66.7 },
            { date: "09/06", totalCarts: 46, abandonedCarts: 30, rate: 65.2 },
            { date: "10/06", totalCarts: 52, abandonedCarts: 34, rate: 65.4 },
        ];
    }
}

/**
 * Get conversion rates
 */
export async function getConversionRates(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/conversion-rates?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch conversion rates: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching conversion rates:", error);
        // Return mock data as fallback
        return [
            { page: "Homepage", visits: 2450, conversions: 85, rate: 3.5 },
            {
                page: "Product Listing",
                visits: 1850,
                conversions: 62,
                rate: 3.4,
            },
            {
                page: "Product Detail",
                visits: 1380,
                conversions: 78,
                rate: 5.7,
            },
            { page: "Shopping Cart", visits: 680, conversions: 48, rate: 7.1 },
            { page: "Wishlist", visits: 420, conversions: 26, rate: 6.2 },
        ];
    }
}

/**
 * Get inventory report
 */
export async function getInventoryReport() {
    try {
        const response = await fetch(`${API_URL}/analytics/inventory-report`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch inventory report: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching inventory report:", error);
        // Return mock data as fallback
        return {
            summary: {
                totalProducts: 320,
                totalValue: 2614749951420, // Over 2.6 trillion VND
                outOfStock: 12,
                lowStock: 28,
                excessStock: 15,
            },
            categories: [
                { name: "Laptop", count: 45, value: 1680000000000 },
                { name: "Màn hình", count: 32, value: 380000000000 },
                { name: "Linh kiện", count: 86, value: 320000000000 },
                { name: "Chuột & Bàn phím", count: 74, value: 135000000000 },
                { name: "Tai nghe", count: 38, value: 75000000000 },
                { name: "Phụ kiện", count: 45, value: 60000000000 },
            ],
            lowStockItems: [
                {
                    id: "64f9a535c84ad8d6a87c3532",
                    name: "Laptop Gaming MSI GF63",
                    stock: 2,
                    threshold: 5,
                },
                {
                    id: "64f9a535c85ad8d6a87c9821",
                    name: "Màn hình Dell UltraSharp 27",
                    stock: 3,
                    threshold: 5,
                },
                {
                    id: "64f9a535c85ad8d6a87c6743",
                    name: "Chuột Logitech G502",
                    stock: 4,
                    threshold: 5,
                },
                {
                    id: "64f9a535c85ad8d6a87c1290",
                    name: "RAM Kingston 32GB DDR4",
                    stock: 3,
                    threshold: 5,
                },
                {
                    id: "64f9a535c85ad8d6a87c4589",
                    name: "SSD Samsung 970 EVO 1TB",
                    stock: 5,
                    threshold: 5,
                },
            ],
            outOfStockItems: [
                {
                    id: "64f9a535c85ad8d6a87c7743",
                    name: "Bàn phím Corsair K95",
                    lastInStock: "12/05/2023",
                },
                {
                    id: "64f9a535c85ad8d6a87c3388",
                    name: "Tai nghe HyperX Cloud II",
                    lastInStock: "26/05/2023",
                },
                {
                    id: "64f9a535c85ad8d6a87c5532",
                    name: "GPU NVIDIA RTX 3080",
                    lastInStock: "03/06/2023",
                },
                {
                    id: "64f9a535c85ad8d6a87c8921",
                    name: "Laptop Dell XPS 15",
                    lastInStock: "08/06/2023",
                },
                {
                    id: "64f9a535c85ad8d6a87c3366",
                    name: "Apple Magic Mouse 2",
                    lastInStock: "11/06/2023",
                },
            ],
        };
    }
}

/**
 * Get low stock products with pagination and search
 */
export async function getLowStockProducts(page = 1, limit = 10, search = "") {
    try {
        const response = await fetch(
            `${API_URL}/analytics/inventory/low-stock?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch low stock products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        // Return minimal fallback data
        return {
            items: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }
}

/**
 * Get out of stock products with pagination and search
 */
export async function getOutOfStockProducts(page = 1, limit = 10, search = "") {
    try {
        const response = await fetch(
            `${API_URL}/analytics/inventory/out-of-stock?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch out of stock products: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching out of stock products:", error);
        // Return minimal fallback data
        return {
            items: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }
}

/**
 * Get product categories for inventory analytics
 */
export async function getProductCategories() {
    try {
        const response = await fetch(
            `${API_URL}/analytics/inventory/categories`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch product categories: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product categories:", error);
        // Return empty array as fallback
        return [];
    }
}

/**
 * Get PC build analytics report
 */
export async function getPCBuildReport(startDate: Date, endDate: Date) {
    try {
        const response = await fetch(
            `${API_URL}/analytics/pc-build-analytics?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
            {
                headers: getAuthHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch PC build report: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching PC build report:", error);
        // Mock data will be returned in the component instead
        throw error;
    }
}
