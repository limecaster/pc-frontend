import { API_URL } from "@/config/constants";

// Helper to include auth token in requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

// Format date for API requests
const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

/**
 * Get sales report data
 */
export async function getSalesReport(startDate: Date, endDate: Date) {
    try {
        // In a real app, this would be an API call
        // For now, return mock data
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
    } catch (error) {
        console.error("Error fetching sales report:", error);
        throw error;
    }
}

/**
 * Get best selling products
 */
export async function getBestSellingProducts(startDate: Date, endDate: Date) {
    try {
        // Mock data
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
    } catch (error) {
        console.error("Error fetching best selling products:", error);
        throw error;
    }
}

/**
 * Get best selling categories
 */
export async function getBestSellingCategories(startDate: Date, endDate: Date) {
    try {
        // Mock data
        return [
            { name: "Laptop", value: 436000000 },
            { name: "Màn hình", value: 52000000 },
            { name: "Linh kiện", value: 38000000 },
            { name: "Chuột & Bàn phím", value: 25000000 },
            { name: "Tai nghe", value: 15000000 },
        ];
    } catch (error) {
        console.error("Error fetching best selling categories:", error);
        throw error;
    }
}

/**
 * Get user behavior report
 */
export async function getUserBehaviorReport(startDate: Date, endDate: Date) {
    try {
        // Mock data
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
    } catch (error) {
        console.error("Error fetching user behavior report:", error);
        throw error;
    }
}

/**
 * Get most viewed products
 */
export async function getMostViewedProducts(startDate: Date, endDate: Date) {
    try {
        // Mock data
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
    } catch (error) {
        console.error("Error fetching most viewed products:", error);
        throw error;
    }
}

/**
 * Get abandoned carts data
 */
export async function getAbandonedCarts(startDate: Date, endDate: Date) {
    try {
        // Mock data
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
    } catch (error) {
        console.error("Error fetching abandoned carts data:", error);
        throw error;
    }
}

/**
 * Get conversion rates
 */
export async function getConversionRates(startDate: Date, endDate: Date) {
    try {
        // Mock data
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
    } catch (error) {
        console.error("Error fetching conversion rates:", error);
        throw error;
    }
}

/**
 * Get inventory report
 */
export async function getInventoryReport() {
    try {
        // Mock data
        return {
            summary: {
                totalProducts: 320,
                totalValue: 1250000000,
                outOfStock: 12,
                lowStock: 28,
                excessStock: 15,
            },
            categories: [
                { name: "Laptop", count: 45, value: 680000000 },
                { name: "Màn hình", count: 32, value: 180000000 },
                { name: "Linh kiện", count: 86, value: 220000000 },
                { name: "Chuột & Bàn phím", count: 74, value: 95000000 },
                { name: "Tai nghe", count: 38, value: 75000000 },
                { name: "Phụ kiện", count: 45, value: 60000000 },
            ],
            lowStockItems: [
                {
                    id: 1,
                    name: "Laptop Gaming MSI GF63",
                    sku: "LT-MSI-GF63",
                    stock: 2,
                    threshold: 5,
                },
                {
                    id: 2,
                    name: "Màn hình Dell UltraSharp 27",
                    sku: "MN-DELL-U27",
                    stock: 3,
                    threshold: 10,
                },
                {
                    id: 3,
                    name: "Chuột Logitech G502",
                    sku: "MS-LOG-G502",
                    stock: 4,
                    threshold: 15,
                },
                {
                    id: 4,
                    name: "RAM Kingston 32GB DDR4",
                    sku: "RM-KING-32",
                    stock: 3,
                    threshold: 8,
                },
                {
                    id: 5,
                    name: "SSD Samsung 970 EVO 1TB",
                    sku: "SSD-SAM-970",
                    stock: 5,
                    threshold: 10,
                },
            ],
            outOfStockItems: [
                {
                    id: 6,
                    name: "Bàn phím Corsair K95",
                    sku: "KB-COR-K95",
                    lastInStock: "12/05/2023",
                },
                {
                    id: 7,
                    name: "Tai nghe HyperX Cloud II",
                    sku: "HP-HYP-CLD2",
                    lastInStock: "26/05/2023",
                },
                {
                    id: 8,
                    name: "GPU NVIDIA RTX 3080",
                    sku: "GPU-RTX-3080",
                    lastInStock: "03/06/2023",
                },
                {
                    id: 9,
                    name: "Laptop Dell XPS 15",
                    sku: "LT-DELL-XPS15",
                    lastInStock: "08/06/2023",
                },
                {
                    id: 10,
                    name: "Apple Magic Mouse 2",
                    sku: "MS-APL-MM2",
                    lastInStock: "11/06/2023",
                },
            ],
        };
    } catch (error) {
        console.error("Error fetching inventory report:", error);
        throw error;
    }
}

/**
 * Get refund report
 */
export async function getRefundReport(startDate: Date, endDate: Date) {
    try {
        // Mock data
        return {
            summary: {
                totalRefunds: 28,
                refundRate: 2.4,
                totalRefundAmount: 24600000,
                refundToOrderRatio: 0.024,
            },
            timeSeries: [
                { date: "01/06", refunds: 3, amount: 2600000 },
                { date: "02/06", refunds: 2, amount: 1800000 },
                { date: "03/06", refunds: 4, amount: 3500000 },
                { date: "04/06", refunds: 2, amount: 1700000 },
                { date: "05/06", refunds: 3, amount: 2500000 },
                { date: "06/06", refunds: 3, amount: 2600000 },
                { date: "07/06", refunds: 5, amount: 4300000 },
                { date: "08/06", refunds: 2, amount: 1800000 },
                { date: "09/06", refunds: 1, amount: 900000 },
                { date: "10/06", refunds: 3, amount: 2900000 },
            ],
            reasons: [
                { reason: "Sản phẩm lỗi", count: 10, percentage: 35.7 },
                { reason: "Không đúng mô tả", count: 7, percentage: 25.0 },
                { reason: "Phát hiện lỗi sau mua", count: 5, percentage: 17.9 },
                { reason: "Thay đổi quyết định", count: 4, percentage: 14.3 },
                { reason: "Sản phẩm trễ hạn", count: 2, percentage: 7.1 },
            ],
            cancelReasons: [
                { reason: "Tìm thấy giá tốt hơn", count: 12, percentage: 30.0 },
                { reason: "Thay đổi quyết định", count: 10, percentage: 25.0 },
                { reason: "Lỗi thanh toán", count: 8, percentage: 20.0 },
                {
                    reason: "Thời gian giao hàng dài",
                    count: 6,
                    percentage: 15.0,
                },
                { reason: "Khác", count: 4, percentage: 10.0 },
            ],
        };
    } catch (error) {
        console.error("Error fetching refund report:", error);
        throw error;
    }
}
