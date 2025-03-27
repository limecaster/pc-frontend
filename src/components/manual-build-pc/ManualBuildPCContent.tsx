import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "flowbite";
import { getAllCompatibleParts } from "@/api/manual-build-pc";
import {
    saveConfiguration,
    getConfiguration,
    standardizeComponentType,
} from "@/api/pc-configuration";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

// Import custom components
import PartsSelectionGrid from "./PartsSelectionGrid";
import PartSelectionModal from "./PartSelectionModal";
import ConfigurationSummary from "./ConfigurationSummary";
import SaveConfigurationModal from "./SaveConfigurationModal";

const ManualBuildPCContent: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const searchParams = useSearchParams() as any;
    const configId = searchParams?.get("configId");
    const selectedProductsQuery = searchParams?.get("selectedProducts") || "{}";
    const initialSelectedProducts = selectedProductsQuery
        ? JSON.parse(selectedProductsQuery as string)
        : {};

    // State management
    const [selectedProducts, setSelectedProducts] = useState<{
        [key: string]: any;
    }>(initialSelectedProducts);
    const [showPopup, setShowPopup] = useState(false);
    const [popupItems, setPopupItems] = useState<any[]>([]);
    const [currentCategory, setCurrentCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<
        "name" | "price-asc" | "price-desc"
    >("price-asc");

    const [totalPrice, setTotalPrice] = useState(0);
    const [totalWattage, setTotalWattage] = useState(0);
    const [isCompatible, setIsCompatible] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [configName, setConfigName] = useState("");
    const [configPurpose, setConfigPurpose] = useState("");
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    // New state variables for client-side pagination
    const [allCompatibleParts, setAllCompatibleParts] = useState<any[]>([]);
    const [filteredParts, setFilteredParts] = useState<any[]>([]);

    // Add state to track if we're editing an existing configuration
    const isEditMode = Boolean(configId);

    // Load configuration if configId is provided
    useEffect(() => {
        if (configId) {
            setIsLoadingConfig(true);
            getConfiguration(configId)
                .then((config) => {
                    if (config && config.products) {
                        // Log original products before any processing
                        console.log(
                            "[ManualBuildPC] Original loaded components:",
                            config.products,
                        );

                        // Post-process any InternalHardDrive components
                        // Explicitly type as Record<string, any> to allow string indexing
                        const processedProducts: Record<string, any> = {
                            ...config.products,
                        };

                        // Look for storage components that need special handling
                        Object.entries(processedProducts).forEach(
                            ([key, comp]: [string, any]) => {
                                if (key === "InternalHardDrive") {
                                    // Determine if it's SSD or HDD
                                    const isSSD =
                                        comp.type === "SSD" ||
                                        comp.storageType === "SSD" ||
                                        (comp.name &&
                                            comp.name.includes("SSD")) ||
                                        (comp.name &&
                                            comp.name.includes("Solid State"));

                                    const storageType = isSSD ? "SSD" : "HDD";
                                    console.log(
                                        `[ManualBuildPC] Reclassifying storage '${comp.name || "Unknown"}' as ${storageType}`,
                                    );

                                    // Add this component with the correct type key
                                    processedProducts[storageType] = {
                                        ...comp,
                                        type: storageType,
                                        storageType: storageType,
                                    };

                                    // Delete with explicit indexing - this is now properly typed
                                    delete processedProducts[
                                        "InternalHardDrive"
                                    ];
                                }
                            },
                        );

                        console.log(
                            "[ManualBuildPC] Processed products for display:",
                            processedProducts,
                        );
                        setSelectedProducts(processedProducts);
                        setConfigName(config.name || "");
                        setConfigPurpose(config.purpose || "");
                    }
                })
                .catch((err) => {
                    console.error("Error loading configuration:", err);
                    toast.error("Không thể tải cấu hình. Vui lòng thử lại!");
                })
                .finally(() => {
                    setIsLoadingConfig(false);
                });
        }
    }, [configId]);

    // Calculate totals when selected products change
    useEffect(() => {
        calculateTotalPrice();
        calculateTotalWattage();
        setIsCompatible(true);
    }, [selectedProducts]);

    // Part selection handlers
    const handleSelectClick = async (
        category: string,
        page: number = 1,
        newSearchTerm?: string,
        newSortOption?: "name" | "price-asc" | "price-desc",
    ) => {
        setCurrentCategory(category);
        const selectedParts = Object.entries(selectedProducts).map(
            ([cat, product]) => ({
                name: product?.name || "",
                label: cat,
            }),
        );
        setLoading(true);
        setShowPopup(true);

        // Update state with any new values passed
        if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm);
        if (newSortOption !== undefined) setSortOption(newSortOption);

        try {
            // Fetch ALL compatible parts in one request
            const response = await getAllCompatibleParts(
                category,
                selectedParts,
                newSearchTerm !== undefined ? newSearchTerm : searchTerm,
                newSortOption !== undefined ? newSortOption : sortOption,
            );

            // Store all parts for client-side pagination
            setAllCompatibleParts(response.items);

            // Apply pagination, sorting, and filtering client-side
            applyPaginationAndFilters(
                response.items,
                page,
                newSearchTerm !== undefined ? newSearchTerm : searchTerm,
                newSortOption !== undefined ? newSortOption : sortOption,
            );

            // Set this to false as we'll handle pagination on the client side
            setLoading(false);
        } catch (error) {
            console.error("Error fetching compatible parts:", error);
            setAllCompatibleParts([]);
            setFilteredParts([]);
            setPopupItems([]);
            setTotalPages(1);
            setLoading(false);
        }
    };

    // Function to apply pagination, search, and sort filters
    const applyPaginationAndFilters = (
        items: any[] = allCompatibleParts,
        page: number = currentPage,
        searchFilter: string = searchTerm,
        sort: "name" | "price-asc" | "price-desc" = sortOption,
    ) => {
        // Apply search filter if needed
        let filtered = items;
        if (searchFilter) {
            filtered = items.filter((item) =>
                item.name.toLowerCase().includes(searchFilter.toLowerCase()),
            );
        }

        // Apply sorting
        if (sort) {
            filtered = [...filtered].sort((a, b) => {
                if (sort === "name") {
                    return a.name.localeCompare(b.name);
                } else if (sort === "price-asc") {
                    return (
                        parseFloat(a.price || "0") - parseFloat(b.price || "0")
                    );
                } else {
                    // price-desc
                    return (
                        parseFloat(b.price || "0") - parseFloat(a.price || "0")
                    );
                }
            });
        }

        // Store filtered results for pagination
        setFilteredParts(filtered);

        // Calculate pagination
        const totalFilteredItems = filtered.length;
        const totalPageCount = Math.max(
            1,
            Math.ceil(totalFilteredItems / itemsPerPage),
        );
        setTotalPages(totalPageCount);

        // Ensure page is within bounds
        const safePage = Math.min(Math.max(1, page), totalPageCount);

        // Always update the current page state
        setCurrentPage(safePage);

        // Get items for current page
        const startIndex = (safePage - 1) * itemsPerPage;
        const endIndex = Math.min(
            startIndex + itemsPerPage,
            totalFilteredItems,
        );
        setPopupItems(filtered.slice(startIndex, endIndex));
    };

    // Modified page change handler for client-side pagination
    const handlePageChange = (page: number) => {
        // Immediately update current page for UI responsiveness
        setCurrentPage(page);
        // Then apply pagination
        applyPaginationAndFilters(
            allCompatibleParts,
            page,
            searchTerm,
            sortOption,
        );
    };

    const handleItemSelect = (product: any) => {
        setSelectedProducts((prev) => ({
            ...prev,
            [currentCategory]: product,
        }));
        setShowPopup(false);
    };

    const handleRemovePart = (category: string) => {
        setSelectedProducts((prev) => {
            // Explicitly type as Record<string, any> to allow string indexing
            const newSelectedProducts: Record<string, any> = { ...prev };
            delete newSelectedProducts[category];
            return newSelectedProducts;
        });
    };

    // Calculation methods
    const calculateTotalPrice = () => {
        const price = Object.values(selectedProducts).reduce((sum, product) => {
            return sum + (parseFloat(product.price) || 0);
        }, 0);
        setTotalPrice(price);
    };

    const calculateTotalWattage = () => {
        let totalWattage = 0;
        for (const [key, product] of Object.entries(selectedProducts)) {
            console.log("Product key:", key);
            console.log("Product value:", product);
            if (key === "CPU" || key === "Card đồ họa") {
                totalWattage += parseFloat(product.tdp) || 0;
            }
            if (key === "Nguồn") {
                continue;
            }
            if (key === "Quạt tản nhiệt") {
                totalWattage += 15;
            }
            if (key === "Bo mạch chủ") {
                totalWattage += 80;
            }
            if (key === "HDD" || key === "SSD") {
                if (product.formFactor === "2.5") {
                    totalWattage += 5;
                } else {
                    totalWattage += 10;
                }
            }
            if (key === "Card đồ họa" || key === "GraphicsCard") {
                totalWattage += parseFloat(product.tdp) || 0;
            }
            if (key === "RAM") {
                //
                const moduleNumber = parseInt(product.moduleNumber);
                if (!isNaN(moduleNumber)) {
                    totalWattage += moduleNumber * 5;
                } else {
                    // Try to parse the module number from the name
                    // Find patterns like number + " x " + number + " GB"
                    const match = product.name.match(/(\d+) x (\d+) GB/);
                    if (match) {
                        totalWattage += parseInt(match[1]) * 5;
                    }
                }
            }
        }

        setTotalWattage(totalWattage);
    };

    // Action handlers
    const handleSaveToExcel = async () => {
        const data = Object.values(selectedProducts).map((product) => ({
            name: product.name,
            price: product.price,
            wattage: product.wattage || product.tdp || "N/A",
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Selected Parts");
        worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "Price", key: "price", width: 15 },
            { header: "Wattage", key: "wattage", width: 15 },
        ];

        data.forEach((item) => {
            worksheet.addRow(item);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "danh_sach_san_pham.xlsx");
    };

    const handleSaveConfiguration = async () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để lưu cấu hình!");
            router.push(
                `/authenticate?redirect=${encodeURIComponent(window.location.pathname)}`,
            );
            return;
        }

        if (Object.keys(selectedProducts).length === 0) {
            toast.error("Vui lòng chọn ít nhất một linh kiện để lưu cấu hình!");
            return;
        }

        // Pre-populate the config name if in edit mode
        if (isEditMode && configName && !showSaveModal) {
            handleSaveConfigurationConfirm();
            return;
        }

        setShowSaveModal(true);
    };

    const handleSaveConfigurationConfirm = async () => {
        if (!configName.trim() && !isEditMode) {
            toast.error("Vui lòng nhập tên cho cấu hình!");
            return;
        }

        try {
            // Standardize component types before saving
            const normalizedProducts = Object.entries(selectedProducts).reduce(
                (result, [type, product]) => {
                    // Log each product and its type for debugging
                    console.log(`Preparing product of type ${type}:`, product);

                    // Standardize component type
                    const standardType = standardizeComponentType(type);

                    // Ensure price is a number
                    let price = 0;
                    if (product.price !== undefined && product.price !== null) {
                        // Convert to number if it's a string
                        price =
                            typeof product.price === "string"
                                ? parseFloat(product.price.replace(/,/g, ""))
                                : Number(product.price);

                        // If conversion resulted in NaN, default to 0
                        if (isNaN(price)) price = 0;
                    }

                    // Store original type in details
                    const productWithDetails = {
                        ...product,
                        price: price, // Ensure price is a number
                        details: {
                            ...(product.details || {}),
                            originalComponentType: type,
                        },
                    };

                    // Use the original type as the key for proper mapping
                    return {
                        ...result,
                        [type]: productWithDetails, // Keep original type as key
                    };
                },
                {},
            );

            // Log the normalized products
            console.log(
                "Normalized products before saving:",
                normalizedProducts,
            );

            // Create config data object without id initially
            const configData: any = {
                name: configName,
                purpose: configPurpose,
                products: normalizedProducts,
                totalPrice: totalPrice,
                wattage: totalWattage,
            };

            // Only add id for updates with valid configId
            if (configId && configId.trim() !== "") {
                // Make sure configId is a string
                configData.id = configId;
            }

            console.log("Operation type:", configId ? "UPDATE" : "CREATE");
            console.log("Config ID value:", configId || "null/undefined");
            console.log("Sending configuration data:", configData);

            const saved = await saveConfiguration(configData);

            setShowSaveModal(false);
            toast.success(
                isEditMode
                    ? "Cấu hình đã được cập nhật thành công!"
                    : "Cấu hình đã được lưu thành công!",
            );

            if (!configId) {
                // If this is a new config, redirect to the config with ID
                router.push(`/manual-build-pc?configId=${saved.id}`);
            }
        } catch (error) {
            console.error("Error saving configuration:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            toast.error(`Không thể lưu cấu hình: ${errorMessage}`);
        }
    };

    // Update these handlers to pass the new values directly to handleSelectClick
    const handleSearchChange = (term: string) => {
        // Update state and re-apply filters
        setSearchTerm(term);
        applyPaginationAndFilters(allCompatibleParts, 1, term, sortOption);
    };

    const handleSortChange = (option: "name" | "price-asc" | "price-desc") => {
        // Update state and re-apply filters
        setSortOption(option);
        applyPaginationAndFilters(
            allCompatibleParts,
            currentPage,
            searchTerm,
            option,
        );
    };

    if (isLoadingConfig) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2">Đang tải cấu hình...</p>
            </div>
        );
    }

    return (
        <div className="manual-build-pc-container grid grid-cols-8 gap-4 justify-center py-4 w-full bg-white">
            <div className="p-4 ml-5 bg-gray-50 shadow-md border-t-1 border-slate-200 dark:bg-white dark:border-zinc-100 col-span-6">
                <h1 className="text-4xl text-zinc-900 font-bold mb-4 text-center dark:text-zinc-100">
                    XÂY DỰNG CẤU HÌNH PC THỦ CÔNG
                </h1>
                <p className="text-lg text-zinc-500 font-medium mb-4 text-center dark:text-zinc-100">
                    Hãy chọn các linh kiện để xây dựng cấu hình PC của bạn
                </p>

                {/* Parts selection grid */}
                <PartsSelectionGrid
                    selectedProducts={selectedProducts}
                    onSelectClick={handleSelectClick}
                    onRemovePart={handleRemovePart}
                />
            </div>

            {/* Part selection modal */}
            <PartSelectionModal
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                currentCategory={currentCategory}
                popupItems={popupItems}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                currentPage={currentPage}
                totalPages={totalPages}
                handleItemSelect={handleItemSelect}
                handlePageChange={handlePageChange}
                onSearchChange={handleSearchChange} // Add this line to connect the search handler
                onSortChange={handleSortChange} // Add this line to connect the sort handler
            />

            {/* Save configuration modal */}
            <SaveConfigurationModal
                showModal={showSaveModal}
                configName={configName}
                configPurpose={configPurpose}
                onNameChange={setConfigName}
                onPurposeChange={setConfigPurpose}
                onSave={handleSaveConfigurationConfirm}
                onClose={() => setShowSaveModal(false)}
            />

            {/* Configuration summary */}
            <ConfigurationSummary
                selectedProducts={selectedProducts}
                totalPrice={totalPrice}
                totalWattage={totalWattage}
                isCompatible={isCompatible}
                onSaveConfiguration={handleSaveConfiguration}
                onExportExcel={handleSaveToExcel}
                isEditMode={isEditMode} // Pass the edit mode flag
            />
        </div>
    );
};

export default ManualBuildPCContent;
