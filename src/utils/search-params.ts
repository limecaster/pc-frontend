/**
 * Helper functions for working with search parameters in product filtering
 */

/**
 * Parse subcategory filters from URL search parameters
 * @param subcategoriesParam The raw subcategories parameter from URL
 * @returns Parsed subcategory filters as an object, or undefined if invalid
 */
export function parseSubcategoryFilters(
    subcategoriesParam: string | null,
): Record<string, string[]> | undefined {
    if (!subcategoriesParam) return undefined;

    try {
        const parsed = JSON.parse(decodeURIComponent(subcategoriesParam));
        if (typeof parsed !== "object" || parsed === null) {
            console.error("Invalid subcategory filter format");
            return undefined;
        }

        // Normalize values to ensure they're all arrays
        const normalized: Record<string, string[]> = {};
        Object.entries(parsed).forEach(([key, value]) => {
            if (!Array.isArray(value)) {
                normalized[key] = [String(value)];
            } else if (value.length === 0) {
                // Skip empty arrays
            } else {
                normalized[key] = value.map(String);
            }
        });

        return Object.keys(normalized).length > 0 ? normalized : undefined;
    } catch (e) {
        console.error("Error parsing subcategory filters:", e);
        return undefined;
    }
}

/**
 * Generate URL with subcategory filters
 * @param baseUrl The base URL to append parameters to
 * @param filters The subcategory filters object
 * @returns Complete URL with filters
 */
export function buildFilterUrl(
    baseUrl: string,
    filters: Record<string, string[]>,
): string {
    if (!filters || Object.keys(filters).length === 0) {
        return baseUrl;
    }

    const url = new URL(baseUrl, window.location.origin);

    // Add subcategories parameter
    url.searchParams.set(
        "subcategories",
        encodeURIComponent(JSON.stringify(filters)),
    );

    // Reset page to 1 when filters change
    url.searchParams.set("page", "1");

    return url.toString();
}
