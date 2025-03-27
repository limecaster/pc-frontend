/**
 * Determines if a storage component is an SSD based on its properties
 */
export function isStorageComponentSSD(storageComponent: any): boolean {
    if (!storageComponent) return false;
    console.log("storageComponent", storageComponent);
    // 1. Check explicit type information
    if (
        storageComponent.type === "SSD" ||
        storageComponent.storageType === "SSD" ||
        (storageComponent.details &&
            (storageComponent.details.type === "SSD" ||
                storageComponent.details.storageType === "SSD"))
    ) {
        return true;
    }

    // 2. Check name for common SSD indicators (case insensitive)
    if (
        storageComponent.name &&
        /ssd|solid\s*state|nvme|m\.2|pcie/i.test(storageComponent.name)
    ) {
        return true;
    }

    // 3. Check form factor - 2.5" is typically SSD in modern systems
    if (storageComponent.formFactor === "2.5") {
        return true;
    }

    // 4. Check for M.2 form factor or NVMe interface
    if (
        storageComponent.formFactor === "M.2" ||
        (storageComponent.interface &&
            /nvme|pcie/i.test(storageComponent.interface))
    ) {
        return true;
    }

    // If none of the conditions are met, it's likely an HDD
    return false;
}
