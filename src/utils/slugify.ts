/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, removes special characters, and replaces spaces with dashes.
 */
// export function generateSlug(text: string): string {
//     return text
//         .toString()
//         .normalize("NFKD") // Normalize to decomposed form for handling accents
//         .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
//         .toLowerCase() // Convert to lowercase
//         .trim() // Trim whitespace
//         .replace(/\s+/g, "-") // Replace spaces with dashes
//         .replace(/[^\w\-]+/g, "") // Remove all non-word characters
//         .replace(/\-\-+/g, "-") // Replace multiple dashes with single dash
//         .replace(/^-+/, "") // Trim dashes from start
//         .replace(/-+$/, ""); // Trim dashes from end
// }
