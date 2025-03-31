/**
 * Format a number as Vietnamese currency
 * @param amount Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a number as VND currency
 */
export function formatPrice(price: string | number | undefined): string {
    if (price === undefined) return "0";

    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format a number as Vietnamese Dong (VND)
 * @param value Number to format
 * @returns Formatted string with ₫ symbol
 */
export function formatVND(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a date as a string
 * @param date Date to format
 * @param format Format style ('short', 'medium', 'long', or 'full')
 * @returns Formatted date string
 */
export function formatDate(
    date: Date,
    format: "short" | "medium" | "long" | "full" = "medium",
): string {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: format,
    }).format(date);
}

/**
 * Truncate text to a specific length and add ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
}
