"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

const WEBSOCKET_URL = "http://localhost:3001";
const AUTOBUILD_URL = "http://localhost:3001/build/auto-build";

export interface PCConfiguration {
    CPU: object;
    CPUCooler: object;
    Motherboard: object;
    GraphicsCard: object;
    RAM: object;
    InternalHardDrive: object;
    Case: object;
    PowerSupply: object;
}

const AutoBuildPC: React.FC = () => {
    const router = useRouter();
    let [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<
        { category: string; items: any[] }[]
    >([]);
    const [loading, setLoading] = useState(false);
    // New state for PC configurations and config modal
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

    const renderSuggestion = (category: string, items: any[]) => (
        <div className="item-cells-group border rounded shadow-md bg-neural-50">
            {category === "Saving" ? (
                <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-saving bg-gradient-to-b from-lime-100 to-bg-neural-50">
                    <span className="bg-emerald-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-emerald-900 dark:text-emerald-300 -mt-10">
                        Tiết kiệm
                    </span>
                </div>
            ) : category === "Performance" ? (
                <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-performance bg-gradient-to-b from-orange-100 to-bg-neural-50">
                    <span className="bg-orange-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-orange-900 dark:text-orange-300 -mt-10">
                        Hiệu năng
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-popular bg-gradient-to-b from-cyan-100 to-bg-neural-50">
                    <span className="bg-cyan-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-cyan-900 dark:text-cyan-300 -mt-10">
                        Phổ biến
                    </span>
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center p-4">
                    <div className="loader"></div>
                </div>
            ) : items.length !== 8 ? (
                <div className="text-center text-red-500 font-medium p-4">
                    Không thể tạo cấu hình PC dựa trên yêu cầu của bạn.
                </div>
            ) : (
                items.map(
                    (
                        item: {
                            name: any;
                            type: any;
                            price: {
                                toLocaleString: (
                                    arg0: string,
                                ) =>
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | React.ReactElement<
                                          any,
                                          | string
                                          | React.JSXElementConstructor<any>
                                      >
                                    | Iterable<React.ReactNode>
                                    | React.ReactPortal
                                    | Promise<React.ReactNode>
                                    | null
                                    | undefined;
                            };
                        },
                        index: React.Key | null | undefined,
                    ) => (
                        <div
                            key={index}
                            className="grid grid-cols-7 gap-2 mb-2 px-4"
                        >
                            <Image
                                src={`https://via.placeholder.com/150`} // item.imageUrl
                                width={150}
                                height={150}
                                alt={"Ảnh sản phẩm"}
                                className="rounded "
                            />
                            <p className="col-span-3 text-zinc-900 leading-none font-medium">
                                {item.name || item.type}
                            </p>
                            <p className="col-span-2 text-base font-semibold leading-none text-primary">
                                {item.price?.toLocaleString("vi-VN") as string}đ
                            </p>
                            <div className="auto-build-actions">
                                <FontAwesomeIcon
                                    icon={faRotate}
                                    className="text-zinc-900"
                                />
                            </div>
                        </div>
                    ),
                )
            )}
            {!loading && items.length === 8 && (
                <div className="item-cell-action mt-4 p-4 text-right">
                    <div className="item-combo-price">
                        <p className="text-base font-semibold leading-none text-primary">
                            Tổng tiền:{" "}
                            {items
                                .reduce(
                                    (acc: any, item: { price: any }) =>
                                        acc + (item.price || 0),
                                    0,
                                )
                                .toLocaleString("vi-VN")}{" "}
                            VND
                        </p>
                    </div>
                    <div className="item-action">
                        <button
                            className="mt-2 bg-primary text-white font-medium py-1 px-4 rounded"
                            onClick={() => handleCustomizeClick(items)}
                            type="button"
                        >
                            Cá nhân hóa
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

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
                <div className="mt-2">
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                        Cấu hình PC
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {pcConfigs.map(
                            (config, idx) => (
                                (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() =>
                                            handleConfigClick(config)
                                        }
                                    >
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Tổng giá:{" "}
                                            {Object.values(config)
                                                .reduce(
                                                    (acc: number, part: any) =>
                                                        acc + (part.price || 0),
                                                    0,
                                                )
                                                .toLocaleString("vi-VN")}
                                            đ
                                        </p>
                                        <p className="text-base text-gray-600 dark:text-gray-300">
                                            Điểm benchmark:{" "}
                                            {Object.values(config)
                                                .reduce(
                                                    (acc: number, part: any) =>
                                                        acc +
                                                        (part.benchmarkScore ||
                                                            0),
                                                    0,
                                                ) === 0
                                                ? "Không đủ thông tin"
                                                : Object.values(config)
                                                      .reduce(
                                                          (acc: number, part: any) =>
                                                              acc +
                                                              (part.benchmarkScore ||
                                                                  0),
                                                          0,
                                                      )
                                                      .toFixed(1)}
                                        </p>
                                    </div>
                                )
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Configuration details modal */}
            {showConfigModal && selectedConfig && (
                <div
                    id="config-modal"
                    tabIndex={-1}
                    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-full bg-black bg-opacity-50"
                >
                    <div className="relative p-4 w-full max-w-2xl">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Chi tiết cấu hình
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                {selectedConfig ? (
                                    Object.entries(selectedConfig).map(
                                        (
                                            [partLabel, partData]: [string, any],
                                            index,
                                        ) => (
                                            <div
                                                key={index}
                                                className="flex justify-between border-b pb-2"
                                            >
                                                <span className="text-gray-900 dark:text-white">{partData["name"]}</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {partData[
                                                        "price"
                                                    ]?.toLocaleString("vi-VN")}
                                                    đ
                                                </span>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="text-lg text-gray-900 dark:text-white">
                                        Không có chi tiết cấu hình.
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-end p-4 gap-2 border-t dark:border-gray-600">
                                <button
                                    type="button"
                                    className="bg-danger text-white py-2 px-4 rounded"
                                    onClick={() => setShowConfigModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="bg-primary text-white py-2 px-4 rounded"
                                    onClick={() => handleCustomizeSelectedConfig(selectedConfig)}
                                >
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
