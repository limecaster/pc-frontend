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
 * Format a date string
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
