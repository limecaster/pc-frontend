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
import {
    trackManualBuildAddToCart,
    trackManualBuildComponentSelect,
    trackManualBuildSaveConfig,
    trackManualBuildExportExcel,
} from "@/api/events";

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

    const [allCompatibleParts, setAllCompatibleParts] = useState<any[]>([]);
    const [filteredParts, setFilteredParts] = useState<any[]>([]);

    const isEditMode = Boolean(configId);

    useEffect(() => {
        if (configId) {
            setIsLoadingConfig(true);
            getConfiguration(configId)
                .then((config) => {
                    if (config && config.products) {
                        const processedProducts: Record<string, any> = {
                            ...config.products,
                        };

                        // Look for storage components that need special handling
                        Object.entries(processedProducts).forEach(
                            ([key, comp]: [string, any]) => {
                                if (key === "InternalHardDrive") {
                                    // Determine if it's SSD or HDD
                                    const isSSD = comp.type === "SSD";

                                    const storageType = isSSD ? "SSD" : "HDD";

                                    processedProducts[storageType] = {
                                        ...comp,
                                        type: storageType,
                                        storageType: storageType,
                                    };

                                    delete processedProducts[
                                        "InternalHardDrive"
                                    ];
                                }
                            },
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

    useEffect(() => {
        try {
            if (selectedProductsQuery) {
                const parsedProducts = JSON.parse(
                    selectedProductsQuery as string,
                );

                if (
                    typeof parsedProducts !== "object" ||
                    parsedProducts === null
                ) {
                    console.error("Invalid products format:", parsedProducts);
                    return;
                }

                const processedProducts = Object.entries(parsedProducts).reduce(
                    (result, [componentType, product]: [string, any]) => {
                        // Skip invalid products
                        if (!product) {
                            console.warn(
                                `Skipping invalid product for ${componentType}`,
                            );
                            return result;
                        }

                        // Process storage types to ensure consistency
                        if (componentType === "InternalHardDrive") {
                            // Determine if it's SSD or HDD
                            const isSSD =
                                product.type === "SSD" ||
                                product.storageType === "SSD" ||
                                (product.name &&
                                    product.name.includes("SSD")) ||
                                (product.name &&
                                    product.name.includes("Solid State"));

                            const storageType = isSSD ? "SSD" : "HDD";
                            result[storageType] = {
                                ...product,
                                type: storageType,
                                storageType: storageType,
                            };
                        } else {
                            // All other component types
                            result[componentType] = {
                                ...product,

                                componentType:
                                    product.componentType || componentType,
                            };
                        }
                        return result;
                    },
                    {} as Record<string, any>,
                );

                setSelectedProducts(processedProducts);
            }
        } catch (error) {
            console.error("Error parsing selected products:", error);
            toast.error("Đã xảy ra lỗi khi tải dữ liệu sản phẩm.");
        }
    }, [selectedProductsQuery]);

    useEffect(() => {
        calculateTotalPrice();
        calculateTotalWattage();
        setIsCompatible(true);
    }, [selectedProducts]);

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

        if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm);
        if (newSortOption !== undefined) setSortOption(newSortOption);

        try {
            const response = await getAllCompatibleParts(
                category,
                selectedParts,
                newSearchTerm !== undefined ? newSearchTerm : searchTerm,
                newSortOption !== undefined ? newSortOption : sortOption,
            );

            setAllCompatibleParts(response.items);

            applyPaginationAndFilters(
                response.items,
                page,
                newSearchTerm !== undefined ? newSearchTerm : searchTerm,
                newSortOption !== undefined ? newSortOption : sortOption,
            );

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

    const applyPaginationAndFilters = (
        items: any[] = allCompatibleParts,
        page: number = currentPage,
        searchFilter: string = searchTerm,
        sort: "name" | "price-asc" | "price-desc" = sortOption,
    ) => {
        let filtered = items;
        if (searchFilter) {
            filtered = items.filter((item) =>
                item.name.toLowerCase().includes(searchFilter.toLowerCase()),
            );
        }

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

        setFilteredParts(filtered);

        const totalFilteredItems = filtered.length;
        const totalPageCount = Math.max(
            1,
            Math.ceil(totalFilteredItems / itemsPerPage),
        );
        setTotalPages(totalPageCount);

        const safePage = Math.min(Math.max(1, page), totalPageCount);

        setCurrentPage(safePage);

        const startIndex = (safePage - 1) * itemsPerPage;
        const endIndex = Math.min(
            startIndex + itemsPerPage,
            totalFilteredItems,
        );
        setPopupItems(filtered.slice(startIndex, endIndex));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

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

        // Track component selection
        trackManualBuildComponentSelect({
            componentType: currentCategory,
            id: product.id || "",
            name: product.name || "",
            price: product.price || 0,
        });

        setShowPopup(false);
    };

    const handleRemovePart = (category: string) => {
        setSelectedProducts((prev) => {
            const newSelectedProducts: Record<string, any> = { ...prev };
            delete newSelectedProducts[category];
            return newSelectedProducts;
        });
    };

    const calculateTotalPrice = () => {
        const price = Object.values(selectedProducts).reduce((sum, product) => {
            return sum + (parseFloat(product.price) || 0);
        }, 0);
        setTotalPrice(price);
    };

    const calculateTotalWattage = () => {
        let totalWattage = 0;
        for (const [key, product] of Object.entries(selectedProducts)) {
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

        // Track the export to excel event
        trackManualBuildExportExcel({
            totalPrice,
            totalWattage,
            components: Object.entries(selectedProducts).map(
                ([key, product]) => ({
                    type: key,
                    id: product.id || "",
                    name: product.name || "",
                    price: product.price || 0,
                }),
            ),
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
            const normalizedProducts = Object.entries(selectedProducts).reduce(
                (result, [type, product]) => {
                    // Standardize component type
                    const standardType = standardizeComponentType(type);

                    let price = 0;
                    if (product.price !== undefined && product.price !== null) {
                        price =
                            typeof product.price === "string"
                                ? parseFloat(product.price.replace(/,/g, ""))
                                : Number(product.price);

                        if (isNaN(price)) price = 0;
                    }

                    const productWithDetails = {
                        ...product,
                        price: price,
                        details: {
                            ...(product.details || {}),
                            originalComponentType: type,
                        },
                    };

                    return {
                        ...result,
                        [type]: productWithDetails,
                    };
                },
                {},
            );

            const configData: any = {
                name: configName,
                purpose: configPurpose,
                products: normalizedProducts,
                totalPrice: totalPrice,
                wattage: totalWattage,
            };

            if (configId && configId.trim() !== "") {
                configData.id = configId;
            }

            // Track the add to cart event
            trackManualBuildAddToCart({
                totalPrice,
                totalWattage,
                components: Object.entries(selectedProducts).map(
                    ([key, product]) => ({
                        type: key,
                        id: product.id || "",
                        name: product.name || "",
                        price: product.price || 0,
                    }),
                ),
            });

            // Track configuration save as a separate event
            trackManualBuildSaveConfig({
                name: configName,
                purpose: configPurpose,
                totalPrice,
                totalWattage,
                isEdit: isEditMode,
                components: Object.entries(selectedProducts).map(
                    ([key, product]) => ({
                        type: key,
                        id: product.id || "",
                        name: product.name || "",
                        price: product.price || 0,
                    }),
                ),
            });

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

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        applyPaginationAndFilters(allCompatibleParts, 1, term, sortOption);
    };

    const handleSortChange = (option: "name" | "price-asc" | "price-desc") => {
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
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
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
                isEditMode={isEditMode}
            />
        </div>
    );
};

export default ManualBuildPCContent;
