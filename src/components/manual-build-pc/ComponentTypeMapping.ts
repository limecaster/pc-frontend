import { COMPONENT_TYPE_MAPPING } from "@/api/pc-configuration";

/**
 * Converts a frontend component label to a standardized component type
 */
export function mapComponentLabelToType(label: string): string {
    // Use the existing mapping from pc-configuration.ts
    return COMPONENT_TYPE_MAPPING[label] || label;
}

/**
 * Gets the display name for a component type
 */
export function getComponentDisplayName(
    type: string,
    language: "en" | "vi" = "vi",
): string {
    // Vietnamese display names
    if (language === "vi") {
        const vietnameseNames: Record<string, string> = {
            CPU: "CPU",
            CPUCooler: "Tản nhiệt CPU",
            Motherboard: "Bo mạch chủ",
            GraphicsCard: "Card đồ họa",
            RAM: "RAM",
            InternalHardDrive: "Ổ cứng",
            SSD: "Ổ SSD",
            HDD: "Ổ HDD",
            Case: "Vỏ case",
            PowerSupply: "Nguồn",
            Monitor: "Màn hình",
            Keyboard: "Bàn phím",
            Mouse: "Chuột",
        };
        return vietnameseNames[type] || type;
    }

    // English display names
    const englishNames: Record<string, string> = {
        CPU: "CPU",
        CPUCooler: "CPU Cooler",
        Motherboard: "Motherboard",
        GraphicsCard: "Graphics Card",
        RAM: "RAM",
        InternalHardDrive: "Storage",
        SSD: "SSD",
        HDD: "HDD",
        Case: "Case",
        PowerSupply: "Power Supply",
        Monitor: "Monitor",
        Keyboard: "Keyboard",
        Mouse: "Mouse",
    };

    return englishNames[type] || type;
}

/**
 * List of component types in display order
 */
export const COMPONENT_ORDER = [
    "CPU",
    "CPUCooler",
    "Motherboard",
    "RAM",
    "GraphicsCard",
    "SSD",
    "HDD",
    "InternalHardDrive", // Fallback for general storage
    "Case",
    "PowerSupply",
    "Monitor",
    "Keyboard",
    "Mouse",
];

/**
 * Organizes components in a specific order
 */
export function organizeComponentsInOrder(
    components: Record<string, any>,
): Record<string, any> {
    const result: Record<string, any> = {};

    // Add components in the specified order
    COMPONENT_ORDER.forEach((type) => {
        if (components[type]) {
            result[type] = components[type];
        }
    });

    // Add any remaining components not in the order list
    Object.entries(components).forEach(([type, component]) => {
        if (!result[type]) {
            result[type] = component;
        }
    });

    return result;
}
