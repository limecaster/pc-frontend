"use client";
import React, { useState, useEffect} from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

const WEBSOCKET_URL = "http://localhost:3001";
const AUTOBUILD_URL = "http://localhost:3001/build/auto-build";

export interface Component {
    name: string;
    price: number;
    benchmarkScore?: number;
    image?: string;
    id?: string;
}

export interface PCConfiguration {
    CPU: Component;
    CPUCooler: Component;
    Motherboard: Component;
    GraphicsCard: Component;
    RAM: Component;
    InternalHardDrive: Component;
    Case: Component;
    PowerSupply: Component;
}

const AutoBuildPC: React.FC = () => {
    useEffect(() => {
        document.title = "B Store - Xây dựng PC tự động";
    }, []);

    const router = useRouter();
    let [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<
        { category: string; items: any[] }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [pcConfigs, setPcConfigs] = useState<PCConfiguration[]>([]);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<any>(null);
    const [_, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io(WEBSOCKET_URL);
        socket.on("connect", () => {
            console.log("Connected to server");
        });
        socket.on("autoBuildSubscribed", (data: any) => {
            console.log("Auto build subscription:", data);
        });
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
        setSuggestions([]); // Clear old suggestions

        try {
            if (!input) {
                input = "PC để chơi game khoảng 25 triệu";
                setInput(input);
            }
            const response = await fetch(AUTOBUILD_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput: input }),
            });
            const data = await response.json();
            // Updated: extract items from the first object of each category array
            const formattedSuggestions = [
                {
                    category: "Saving",
                    items:
                        data?.saving && data.saving.length > 0
                            ? Object.values(data.saving[0])
                            : [],
                },
                {
                    category: "Performance",
                    items:
                        data?.performance && data.performance.length > 0
                            ? Object.values(data.performance[0])
                            : [],
                },
                {
                    category: "Popular",
                    items:
                        data?.popular && data.popular.length > 0
                            ? Object.values(data.popular[0])
                            : [],
                },
            ];

            setSuggestions(formattedSuggestions);
            // New: set PC configurations if provided
            // setPcConfigs([
            //   ...(data?.saving || []),
            //   ...(data?.performance || []),
            //   ...(data?.popular || [])
            // ]);
        } catch (error) {
            console.error("Error fetching auto build suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomizeClick = (items: any[]) => {
        const selectedProducts = {
            CPU: items[0],
            "Quạt tản nhiệt": items[1],
            "Bo mạch chủ": items[2],
            "Card đồ họa": items[3],
            RAM: items[4],
            SSD: items[5],
            "Vỏ case": items[6],
            Nguồn: items[7],
        };
        router.push(`/manual-build-pc?selectedProducts=${encodeURIComponent(JSON.stringify(selectedProducts))}`);
    };

    // New: Handle configuration card click to show details modal
    const handleConfigClick = (config: any) => {
        setSelectedConfig(config);
        setShowConfigModal(true);
    };

    const handleCustomizeSelectedConfig = (config: PCConfiguration) => {
        const selectedProducts: { [key: string]: any } = {};
      
        if (config.CPU) selectedProducts['CPU'] = config.CPU;
        if (config.CPUCooler) selectedProducts['Quạt tản nhiệt'] = config.CPUCooler;
        if (config.Motherboard) selectedProducts['Bo mạch chủ'] = config.Motherboard;
        if (config.GraphicsCard) selectedProducts['Card đồ họa'] = config.GraphicsCard;
        if (config.RAM) selectedProducts['RAM'] = config.RAM;
        if (config.InternalHardDrive) selectedProducts['HDD'] = config.InternalHardDrive;
        if (config.Case) selectedProducts['Vỏ case'] = config.Case;
        if (config.PowerSupply) selectedProducts['Nguồn'] = config.PowerSupply;
        console.log('Selected products:', selectedProducts);
        router.push(`/manual-build-pc?selectedProducts=${encodeURIComponent(JSON.stringify(selectedProducts))}`);
      };

    // const renderSuggestion = (category: string, items: any[]) => (
    //     <div className="item-cells-group border rounded shadow-md bg-neural-50">
    //         {category === "Saving" ? (
    //             <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-saving bg-gradient-to-b from-lime-100 to-bg-neural-50">
    //                 <span className="bg-emerald-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-emerald-900 dark:text-emerald-300 -mt-10">
    //                     Tiết kiệm
    //                 </span>
    //             </div>
    //         ) : category === "Performance" ? (
    //             <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-performance bg-gradient-to-b from-orange-100 to-bg-neural-50">
    //                 <span className="bg-orange-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-orange-900 dark:text-orange-300 -mt-10">
    //                     Hiệu năng
    //                 </span>
    //             </div>
    //         ) : (
    //             <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-popular bg-gradient-to-b from-cyan-100 to-bg-neural-50">
    //                 <span className="bg-cyan-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-cyan-900 dark:text-cyan-300 -mt-10">
    //                     Phổ biến
    //                 </span>
    //             </div>
    //         )}
    //         {loading ? (
    //             <div className="flex justify-center items-center p-4">
    //                 <div className="loader"></div>
    //             </div>
    //         ) : items.length !== 8 ? (
    //             <div className="text-center text-red-500 font-medium p-4">
    //                 Không thể tạo cấu hình PC dựa trên yêu cầu của bạn.
    //             </div>
    //         ) : (
    //             items.map(
    //                 (
    //                     item: {
    //                         name: any;
    //                         type: any;
    //                         price: {
    //                             toLocaleString: (
    //                                 arg0: string,
    //                             ) =>
    //                                 | string
    //                                 | number
    //                                 | bigint
    //                                 | boolean
    //                                 | React.ReactElement<
    //                                       any,
    //                                       | string
    //                                       | React.JSXElementConstructor<any>
    //                                   >
    //                                 | Iterable<React.ReactNode>
    //                                 | React.ReactPortal
    //                                 | Promise<React.ReactNode>
    //                                 | null
    //                                 | undefined;
    //                         };
    //                     },
    //                     index: React.Key | null | undefined,
    //                 ) => (
    //                     <div
    //                         key={index}
    //                         className="grid grid-cols-7 gap-2 mb-2 px-4"
    //                     >
    //                         <Image
    //                             src={`https://via.placeholder.com/150`} // item.imageUrl
    //                             width={150}
    //                             height={150}
    //                             alt={"Ảnh sản phẩm"}
    //                             className="rounded "
    //                         />
    //                         <p className="col-span-3 text-zinc-900 leading-none font-medium">
    //                             {item.name || item.type}
    //                         </p>
    //                         <p className="col-span-2 text-base font-semibold leading-none text-primary">
    //                             {item.price?.toLocaleString("vi-VN") as string}đ
    //                         </p>
    //                         <div className="auto-build-actions">
    //                             <FontAwesomeIcon
    //                                 icon={faRotate}
    //                                 className="text-zinc-900"
    //                             />
    //                         </div>
    //                     </div>
    //                 ),
    //             )
    //         )}
    //         {!loading && items.length === 8 && (
    //             <div className="item-cell-action mt-4 p-4 text-right">
    //                 <div className="item-combo-price">
    //                     <p className="text-base font-semibold leading-none text-primary">
    //                         Tổng tiền:{" "}
    //                         {items
    //                             .reduce(
    //                                 (acc: any, item: { price: any }) =>
    //                                     acc + (item.price || 0),
    //                                 0,
    //                             )
    //                             .toLocaleString("vi-VN")}{" "}
    //                         VND
    //                     </p>
    //                 </div>
    //                 <div className="item-action">
    //                     <button
    //                         className="mt-2 bg-primary text-white font-medium py-1 px-4 rounded"
    //                         onClick={() => handleCustomizeClick(items)}
    //                         type="button"
    //                     >
    //                         Cá nhân hóa
    //                     </button>
    //                 </div>
    //             </div>
    //         )}
    //     </div>
    // );

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
                />
                <button
                    onClick={handleBuildClick}
                    className="bg-primary text-white font-semibold py-2 px-4 h-11 rounded"
                    type="button"
                >
                    Xây dựng
                </button>
            </div>

            {/* This is the previous version of suggestion screen */}
            {/* <div className="grid grid-cols-3 gap-4 mt-6">
                {suggestions.map((suggestion, index) => (
                    <React.Fragment key={index}>
                        {renderSuggestion(
                            suggestion.category,
                            suggestion.items,
                        )}
                    </React.Fragment>
                ))}
            </div> */}

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
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {Object.values(config)
                                                    .reduce((acc: number, part: any) => acc + (part.price || 0), 0)
                                                    .toLocaleString("vi-VN")}
                                                đ
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-md font-medium text-gray-600 dark:text-gray-300">
                                                Benchmark: {Object.values(config)
                                                    .reduce((acc: number, part: any) => acc + (part.benchmarkScore || 0), 0) === 0
                                                    ? "N/A"
                                                    : Object.values(config)
                                                        .reduce((acc: number, part: any) => acc + (part.benchmarkScore || 0), 0)
                                                        .toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-3">
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">CPU:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400 truncate">
                                                {config.CPU?.name?.substring(0, 30)}
                                                {config.CPU?.name?.length > 30 ? '...' : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">GPU:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400 truncate">
                                                {config.GraphicsCard?.name?.substring(0, 30)}
                                                {config.GraphicsCard?.name?.length > 30 ? '...' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        className="mt-4 w-full bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCustomizeSelectedConfig(config);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        Cá nhân hóa
                                    </button>
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
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 flex justify-between items-center">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        Tổng giá: {Object.values(selectedConfig)
                                            .reduce((acc: number, part: any) => acc + (part.price || 0), 0)
                                            .toLocaleString("vi-VN")}đ
                                    </p>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                                        Benchmark: {Object.values(selectedConfig)
                                            .reduce((acc: number, part: any) => acc + (part.benchmarkScore || 0), 0) === 0
                                            ? "N/A"
                                            : Object.values(selectedConfig)
                                                .reduce((acc: number, part: any) => acc + (part.benchmarkScore || 0), 0)
                                                .toFixed(1)}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {selectedConfig ? (
                                        Object.entries(selectedConfig).map(([partLabel, partData]: [string, any], index) => (
                                            <div
                                                key={index}
                                                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-700 dark:border-gray-600 overflow-hidden cursor-pointer"
                                                onClick={() => window.open(`/product/${partData.id}`, "_blank")}
                                            >
                                                <div className="flex p-4 space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <Image
                                                            src={partData.image || "/images/image-placeholder.webp"}
                                                            alt={partData.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-20 h-20 object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                                                            {partData.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                                            {partLabel}
                                                        </div>
                                                        <div className="font-semibold text-primary">
                                                            {partData.price?.toLocaleString("vi-VN")}đ
                                                        </div>
                                                        {partData.benchmarkScore && (
                                                            <div className="inline-flex items-center mt-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                                                                    Benchmark: {partData.benchmarkScore}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white col-span-2">
                                            Không có chi tiết cấu hình.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-end p-5 gap-3 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-5 rounded transition-colors duration-200"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-5 rounded flex items-center transition-colors duration-200"
                                    onClick={() => handleCustomizeSelectedConfig(selectedConfig)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Cá nhân hóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoBuildPC;
