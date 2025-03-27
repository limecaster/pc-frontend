"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { getAutoBuildSuggestions, PCConfiguration } from "@/api/auto-build-pc";
import { API_URL } from "@/config/constants";
import { toast } from "react-hot-toast";
import {
    saveConfiguration,
    formatProductsForApi,
} from "@/api/pc-configuration";
import { useAuth } from "@/contexts/AuthContext";
import { isStorageComponentSSD } from "@/utils/pcConfigurationMapper";
// Import Heroicons components
import {
    ComputerDesktopIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    XMarkIcon,
    BoltIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

const WEBSOCKET_URL = API_URL;

const AutoBuildPCContent: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Xây dựng PC tự động";
    }, []);

    const router = useRouter();
    let [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pcConfigs, setPcConfigs] = useState<PCConfiguration[]>([]);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<any>(null);
    const [_, setSocket] = useState<Socket | null>(null);
    const { isAuthenticated } = useAuth();
    const [isSaving, setIsSaving] = useState<number | null>(null);
    const [isModalSaving, setIsModalSaving] = useState(false);

    useEffect(() => {
        const socket = io(WEBSOCKET_URL);
        socket.on("connect", () => {});
        socket.on("autoBuildSubscribed", (data: any) => {});
        socket.on("pcConfigFormed", (config: any) => {
            setPcConfigs((prevConfigs) => [...prevConfigs, config]);
        });
        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleInputChange = (e: {
        target: { value: React.SetStateAction<string> };
    }) => {
        setInput(e.target.value);
    };

    const handleBuildClick = async () => {
        setLoading(true);
        setPcConfigs([]); // Clear old configs
        // setSuggestions([]); // Clear old suggestions

        try {
            if (!input) {
                input = "PC để chơi game khoảng 25 triệu";
                setInput(input);
            }

            // Use the new API function instead of direct fetch
            await getAutoBuildSuggestions(input);

            // Updated: extract items from the first object of each category array
            // const formattedSuggestions = [
            //     {
            //         category: "Saving",
            //         items:
            //             data?.saving && data.saving.length > 0
            //                 ? Object.values(data.saving[0])
            //                 : [],
            //     },
            //     {
            //         category: "Performance",
            //         items:
            //             data?.performance && data.performance.length > 0
            //                 ? Object.values(data.performance[0])
            //                 : [],
            //     },
            //     {
            //         category: "Popular",
            //         items:
            //             data?.popular && data.popular.length > 0
            //                 ? Object.values(data.popular[0])
            //                 : [],
            //     },
            // ];

            // setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error("Error fetching auto build suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle configuration card click to show details modal
    const handleConfigClick = (config: any) => {
        setSelectedConfig(config);
        setShowConfigModal(true);
    };

    const handleCustomizeSelectedConfig = (config: PCConfiguration) => {
        try {
            // Create a component mapping using exact keys from the provided list
            const manualBuildProducts: Record<string, any> = {};

            // This mapping uses exactly the keys that appear in the user's list
            const componentMapping: Record<string, string> = {
                CPU: "CPU",
                CPUCooler: "Quạt tản nhiệt",
                Motherboard: "Bo mạch chủ",
                GraphicsCard: "Card đồ họa",
                RAM: "RAM",
                Case: "Vỏ case",
                PowerSupply: "Nguồn",
            };

            // Process standard components
            Object.entries(componentMapping).forEach(([autoKey, manualKey]) => {
                if (config[autoKey as keyof PCConfiguration]) {
                    // Ensure we have a valid component with id and price
                    manualBuildProducts[manualKey] = {
                        ...config[autoKey as keyof PCConfiguration],
                        id:
                            config[autoKey as keyof PCConfiguration]?.id ||
                            config[autoKey as keyof PCConfiguration]?.partId,
                        componentType: autoKey,
                        details: {
                            ...(config[autoKey as keyof PCConfiguration]
                                ?.details || {}),
                            originalComponentType: autoKey,
                        },
                    };
                }
            });

            // Handle storage components - always map to SSD for now as that's in the expected list
            if (config.InternalHardDrive) {
                const storage = config.InternalHardDrive;
                const isSSD = isStorageComponentSSD(storage);
                const storageKey = isSSD ? "SSD" : "HDD";

                manualBuildProducts[storageKey] = {
                    ...storage,
                    id: storage.id || storage.partId,
                    componentType: "InternalHardDrive",
                    type: storageKey,
                    storageType: storageKey,
                    details: {
                        ...(storage.details || {}),
                        type: storageKey,
                        storageType: storageKey,
                    },
                };
                console.log(`Mapped InternalHardDrive to ${storageKey}`);
            }

            // Add explicitly defined SSD and HDD if they exist
            if (config.SSD) {
                manualBuildProducts["SSD"] = {
                    ...config.SSD,
                    id: config.SSD.id || config.SSD.partId,
                    componentType: "SSD",
                    type: "SSD",
                    storageType: "SSD",
                };
            }

            if (config.HDD) {
                manualBuildProducts["HDD"] = {
                    ...config.HDD,
                    id: config.HDD.id || config.HDD.partId,
                    componentType: "HDD",
                    type: "HDD",
                    storageType: "HDD",
                };
            }

            router.push(
                `/manual-build-pc?selectedProducts=${encodeURIComponent(
                    JSON.stringify(manualBuildProducts),
                )}`,
            );
        } catch (error) {
            console.error("Error mapping configuration:", error);
            toast.error(
                "Đã xảy ra lỗi khi chuyển đổi cấu hình. Vui lòng thử lại!",
            );

            // Fallback to a simpler mapping if the full mapping fails
            const basicProducts: Record<string, any> = {};
            if (config.CPU) basicProducts["CPU"] = config.CPU;
            if (config.RAM) basicProducts["RAM"] = config.RAM;
            if (config.GraphicsCard)
                basicProducts["Card đồ họa"] = config.GraphicsCard;

            router.push(
                `/manual-build-pc?selectedProducts=${encodeURIComponent(
                    JSON.stringify(basicProducts),
                )}`,
            );
        }
    };

    // New handler for saving a configuration directly
    const handleSaveConfiguration = async (
        config: PCConfiguration,
        index: number,
    ) => {
        try {
            // Check if user is authenticated
            if (!isAuthenticated) {
                toast.error("Vui lòng đăng nhập để lưu cấu hình!");
                router.push(
                    `/authenticate?redirect=${encodeURIComponent(window.location.pathname)}`,
                );
                return;
            }

            setIsSaving(index);

            // Create a properly formatted configuration by performing the same transformations as in handleCustomizeSelectedConfig
            const transformedConfig: Record<string, any> = {};

            // Process standard components
            Object.entries(config).forEach(([componentType, component]) => {
                if (!component) return;

                // Skip InternalHardDrive as we'll handle it separately
                if (componentType === "InternalHardDrive") return;

                // Skip SSD/HDD as we'll handle them specially
                if (componentType === "SSD" || componentType === "HDD") return;

                transformedConfig[componentType] = {
                    ...component,
                    id: component.id || component.partId,
                    details: {
                        ...(component.details || {}),
                        originalComponentType: componentType,
                    },
                };
            });

            // Handle storage components - properly classify as SSD or HDD
            if (config.InternalHardDrive) {
                const storage = config.InternalHardDrive;
                const isSSD = isStorageComponentSSD(storage);
                const storageKey = isSSD ? "SSD" : "HDD";

                transformedConfig[storageKey] = {
                    ...storage,
                    id: storage.id || storage.partId,
                    componentType: "InternalHardDrive",
                    type: storageKey,
                    storageType: storageKey,
                    details: {
                        ...(storage.details || {}),
                        type: storageKey,
                        storageType: storageKey,
                    },
                };
            }

            // Handle explicit SSD
            if (config.SSD) {
                transformedConfig["SSD"] = {
                    ...config.SSD,
                    id: config.SSD.id || config.SSD.partId,
                    componentType: "SSD",
                    type: "SSD",
                    storageType: "SSD",
                };
            }

            // Handle explicit HDD
            if (config.HDD) {
                transformedConfig["HDD"] = {
                    ...config.HDD,
                    id: config.HDD.id || config.HDD.partId,
                    componentType: "HDD",
                    type: "HDD",
                    storageType: "HDD",
                };
            }

            // Format the configuration for saving
            const configData = {
                name: `Cấu hình tự động #${index + 1}`,
                purpose: input || "Cấu hình được tạo tự động",
                products: formatProductsForApi(transformedConfig),
                totalPrice: Object.values(config).reduce(
                    (acc: number, part: any) => acc + (part.price || 0),
                    0,
                ),
                wattage: Object.values(config).reduce(
                    (acc: number, part: any) => acc + (part.tdp || 0),
                    0,
                ),
            };

            await saveConfiguration(configData);
            toast.success("Đã lưu cấu hình thành công!");
        } catch (error) {
            console.error("Error saving configuration:", error);
            toast.error("Đã xảy ra lỗi khi lưu cấu hình. Vui lòng thử lại!");
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md">
            <h1 className="text-4xl text-zinc-900 font-bold mb-4 text-center dark:text-zinc-100">
                XÂY DỰNG CẤU HÌNH PC THEO YÊU CẦU
            </h1>
            <p className="text-lg text-zinc-500 font-medium mb-4 text-center dark:text-zinc-100">
                Hãy mô tả nhu cầu của bạn để chúng tôi tư vấn cấu hình phù hợp
                nhất
            </p>
            <div className="text-sm text-zinc-700 font-medium mb-4 text-center dark:text-zinc-100">
                Sử dụng công nghệ AI để xây dựng cấu hình PC phù hợp với nhu cầu
                của bạn
                <span data-tooltip-target="tooltip-default">
                    <FontAwesomeIcon icon={faCircleInfo} className="mx-1" />
                    <div
                        id="tooltip-default"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                    >
                        Chức năng xây dựng cấu hình PC tự động đảm bảo các linh
                        kiện trong cấu hình tương thích với nhau. Các linh kiện
                        được chọn lựa dựa trên nhu cầu sử dụng và mức giá bạn
                        mong muốn.
                        <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                </span>
            </div>
            <div className="flex gap-4 justify-center p-4 rounded">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="PC để chơi game khoảng 25 triệu"
                    className="border border-2 p-2 w-1/2 rounded mb-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={loading}
                />
                <button
                    onClick={handleBuildClick}
                    className="bg-primary text-white font-semibold py-2 px-4 h-11 rounded flex items-center justify-center transition-colors disabled:bg-blue-400"
                    type="button"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        "Xây dựng"
                    )}
                </button>
            </div>

            {/* Loading state when no configs yet */}
            {loading && pcConfigs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">
                        Đang tạo cấu hình PC phù hợp với yêu cầu của bạn...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Quá trình này có thể mất vài giây.
                    </p>
                </div>
            )}

            {/*PC configurations cards */}
            {pcConfigs.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                        Cấu hình PC đề xuất
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pcConfigs.map((config, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                                onClick={() => handleConfigClick(config)}
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Cấu hình #{idx + 1}
                                    </h3>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-2">
                                                <ComputerDesktopIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {Object.values(config)
                                                    .reduce(
                                                        (
                                                            acc: number,
                                                            part: any,
                                                        ) =>
                                                            acc +
                                                            (part.price || 0),
                                                        0,
                                                    )
                                                    .toLocaleString("vi-VN")}
                                                đ
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-2">
                                                <InformationCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-md font-medium text-gray-600 dark:text-gray-300">
                                                Benchmark:{" "}
                                                {Object.values(config).reduce(
                                                    (acc: number, part: any) =>
                                                        acc +
                                                        (part.benchmarkScore ||
                                                            0),
                                                    0,
                                                ) === 0
                                                    ? "N/A"
                                                    : Object.values(config)
                                                          .reduce(
                                                              (
                                                                  acc: number,
                                                                  part: any,
                                                              ) =>
                                                                  acc +
                                                                  (part.benchmarkScore ||
                                                                      0),
                                                              0,
                                                          )
                                                          .toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-3">
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                CPU:
                                            </span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400 truncate">
                                                {config.CPU?.name?.substring(
                                                    0,
                                                    30,
                                                )}
                                                {config.CPU?.name?.length > 30
                                                    ? "..."
                                                    : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                GPU:
                                            </span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400 truncate">
                                                {config.GraphicsCard?.name?.substring(
                                                    0,
                                                    30,
                                                )}
                                                {config.GraphicsCard?.name
                                                    ?.length > 30
                                                    ? "..."
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-2 rounded transition-colors duration-200 flex items-center justify-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveConfiguration(
                                                    config,
                                                    idx,
                                                );
                                            }}
                                            disabled={isSaving === idx}
                                        >
                                            {isSaving === idx ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                                                    Lưu
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-2 rounded transition-colors duration-200 flex items-center justify-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCustomizeSelectedConfig(
                                                    config,
                                                );
                                            }}
                                        >
                                            <PencilIcon className="h-5 w-5 mr-1" />
                                            Tùy chỉnh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Configuration details modal */}
            {showConfigModal && selectedConfig && (
                <div
                    id="config-modal"
                    tabIndex={-1}
                    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-full bg-black bg-opacity-70"
                    onClick={() => setShowConfigModal(false)}
                >
                    <div
                        className="relative p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-white rounded-lg shadow-2xl dark:bg-gray-800">
                            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Chi tiết cấu hình PC
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full p-2 ml-auto transition-colors duration-200"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                    <span className="sr-only">Đóng</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 flex justify-between items-center">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        Tổng giá:{" "}
                                        {Object.values(selectedConfig)
                                            .reduce(
                                                (acc: number, part: any) =>
                                                    acc + (part.price || 0),
                                                0,
                                            )
                                            .toLocaleString("vi-VN")}
                                        đ
                                    </p>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                                        Benchmark:{" "}
                                        {Object.values(selectedConfig).reduce(
                                            (acc: number, part: any) =>
                                                acc +
                                                (part.benchmarkScore || 0),
                                            0,
                                        ) === 0
                                            ? "N/A"
                                            : Object.values(selectedConfig)
                                                  .reduce(
                                                      (
                                                          acc: number,
                                                          part: any,
                                                      ) =>
                                                          acc +
                                                          (part.benchmarkScore ||
                                                              0),
                                                      0,
                                                  )
                                                  .toFixed(1)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {selectedConfig ? (
                                        Object.entries(selectedConfig).map(
                                            (
                                                [partLabel, partData]: [
                                                    string,
                                                    any,
                                                ],
                                                index,
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-700 dark:border-gray-600 overflow-hidden cursor-pointer"
                                                    onClick={() =>
                                                        window.open(
                                                            `/product/${partData.id}`,
                                                            "_blank",
                                                        )
                                                    }
                                                >
                                                    <div className="flex p-4 space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <Image
                                                                src={
                                                                    partData.imageUrl ||
                                                                    "/images/image-placeholder.webp"
                                                                }
                                                                alt={
                                                                    partData.name
                                                                }
                                                                width={80}
                                                                height={80}
                                                                className="w-20 h-20 object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-900 dark:text-white hover:text-primary line-clamp-2 mb-1">
                                                                {partData.name}
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                                                {partLabel}
                                                            </div>
                                                            <div className="font-semibold text-primary">
                                                                {partData.price?.toLocaleString(
                                                                    "vi-VN",
                                                                )}
                                                                đ
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Không có thông tin cấu hình.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 gap-3 border-t dark:border-gray-700">
                                <div>
                                    {/* Add Save Configuration button on the left */}
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded flex items-center transition-colors duration-200"
                                        onClick={() => {
                                            setIsModalSaving(true);
                                            // Find the index of the selected config in pcConfigs array
                                            const configIndex =
                                                pcConfigs.findIndex(
                                                    (config) =>
                                                        config ===
                                                        selectedConfig,
                                                );
                                            handleSaveConfiguration(
                                                selectedConfig,
                                                configIndex >= 0
                                                    ? configIndex
                                                    : pcConfigs.length,
                                            )
                                                .then(() => {
                                                    setShowConfigModal(false);
                                                })
                                                .finally(() => {
                                                    setIsModalSaving(false);
                                                });
                                        }}
                                        disabled={isModalSaving}
                                    >
                                        {isModalSaving ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                                Lưu cấu hình
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-5 rounded transition-colors duration-200"
                                        onClick={() =>
                                            setShowConfigModal(false)
                                        }
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-5 rounded flex items-center transition-colors duration-200"
                                        onClick={() =>
                                            handleCustomizeSelectedConfig(
                                                selectedConfig,
                                            )
                                        }
                                    >
                                        <PencilIcon className="h-5 w-5 mr-2" />
                                        Cá nhân hóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoBuildPCContent;
