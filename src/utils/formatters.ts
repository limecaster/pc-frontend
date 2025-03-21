/**
 * Format a number as currency (Vietnamese Dong)
 * @param value - Number to format
 * @param locale - Locale to use for formatting (default: 'vi-VN')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format date string to locale date
 * @param dateString - ISO date string
 * @param locale - Locale to use for formatting (default: 'vi-VN')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale = "vi-VN"): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @returns Formatted string with thousand separators
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(value);
}
