import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "flowbite";
import Image from "next/image";
import { ManualBuildPCItemCard } from "@/components/manual-build-pc/ManualBuildPCItemCard";
import { ProductCard } from "@/components/manual-build-pc/ProductCard";
import { getCompatibleParts } from "@/api/manual-build-pc";

import cpuIcon from "@/assets/icon/pc-parts/cpu.svg";
import motherboardIcon from "@/assets/icon/pc-parts/motherboard.svg";
import ramIcon from "@/assets/icon/pc-parts/ram.svg";
import hddIcon from "@/assets/icon/pc-parts/hdd.svg";
import ssdIcon from "@/assets/icon/pc-parts/ssd.svg";
import gpuIcon from "@/assets/icon/pc-parts/gpu.svg";
import psuIcon from "@/assets/icon/pc-parts/psu.svg";
import caseIcon from "@/assets/icon/pc-parts/case.svg";
import cpucoolerIcon from "@/assets/icon/pc-parts/cpucooler.svg";
import monitorIcon from "@/assets/icon/pc-parts/monitor.svg";
import peripheralIcon from "@/assets/icon/pc-parts/peripheral.svg";
import extensibleCardIcon from "@/assets/icon/pc-parts/extensible-card.svg";
import accessoriesIcon from "@/assets/icon/pc-parts/other.svg";

import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

const formatPrice = (price: string) => {
    price = parseFloat(price).toFixed(0);
    price = price.toString();
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const itemData = [
    { label: "CPU", imageSrc: cpuIcon },
    { label: "Bo mạch chủ", imageSrc: motherboardIcon },
    { label: "RAM", imageSrc: ramIcon },
    { label: "HDD", imageSrc: hddIcon },
    { label: "SSD", imageSrc: ssdIcon },
    { label: "Card đồ họa", imageSrc: gpuIcon },
    { label: "Nguồn", imageSrc: psuIcon },
    { label: "Vỏ case", imageSrc: caseIcon },
    { label: "Quạt tản nhiệt", imageSrc: cpucoolerIcon },
    { label: "Màn hình", imageSrc: monitorIcon },
    { label: "Thiết bị ngoại vi", imageSrc: peripheralIcon },
    { label: "Card mở rộng", imageSrc: extensibleCardIcon },
    { label: "Phụ kiện khác", imageSrc: accessoriesIcon },
];

const ManualBuildPCContent = () => {
    const searchParams = useSearchParams() as any;
    const selectedProductsQuery = searchParams?.get("selectedProducts") || "{}";
    const initialSelectedProducts = selectedProductsQuery
        ? JSON.parse(selectedProductsQuery as string)
        : {};

    const [selectedProducts, setSelectedProducts] = useState<{
        [key: string]: any;
    }>(initialSelectedProducts);
    const [showPopup, setShowPopup] = useState(false);
    const [popupItems, setPopupItems] = useState<any[]>(() => []);
    const [currentCategory, setCurrentCategory] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state

    // Add state for search and sort
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<
        "name" | "price-asc" | "price-desc"
    >("price-asc");

    const [totalPrice, setTotalPrice] = useState(0);
    const [totalWattage, setTotalWattage] = useState(0);
    const [isCompatible, setIsCompatible] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10; // Number of items per page

    const handleSelectClick = async (category: string, page: number = 1) => {
        setCurrentCategory(category);
        const selectedParts = Object.entries(selectedProducts).map(
            ([cat, product]) => ({
                name: product?.name || "",
                label: cat,
            }),
        );
        setLoading(true); // Set loading to true
        setShowPopup(true); // Show popup immediately with loading state
        
        try {
            const response = await getCompatibleParts(
                category, 
                selectedParts, 
                page, 
                itemsPerPage
            );
            
            setPopupItems(response.items);
            setTotalPages(response.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("Error fetching compatible parts:", error);
            setPopupItems([]);
        } finally {
            setLoading(false); // Set loading to false when done
        }
    };

    const handlePageChange = (page: number) => {
        handleSelectClick(currentCategory, page);
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
            const newSelectedProducts = { ...prev };
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
            if (key === "RAM") {
                totalWattage += parseInt(product.moduleNumber) * 5;
            }
            if (key === "HDD" || key === "SSD") {
                if (product.formFactor === "2.5") {
                    totalWattage += 5;
                } else {
                    totalWattage += 10;
                }
            }
        }

        setTotalWattage(totalWattage);
    };

    useEffect(() => {
        calculateTotalPrice();
        calculateTotalWattage();
        setIsCompatible(true);
    }, [selectedProducts]);

    const handleBuyNow = () => {
        // TODO: Implement buy now functionality
        console.log("Mua ngay clicked");
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart functionality
        console.log("Thêm vào giỏ hàng clicked");
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

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "danh_sach_san_pham.xlsx");
    };

    return (
        <div className="manual-build-pc-container grid grid-cols-8 gap-4 justify-center py-4 w-full bg-bgSecondary">
            <div className="p-4 bg-bgSecondary shadow-md border-t-2 border-slate-200 dark:bg-white dark:border-zinc-100 col-span-6">
                <h1 className="text-4xl text-zinc-900 font-bold mb-4 text-center dark:text-zinc-100">
                    XÂY DỰNG CẤU HÌNH PC THỦ CÔNG
                </h1>
                <p className="text-lg text-zinc-500 font-medium mb-4 text-center dark:text-zinc-100">
                    Hãy chọn các linh kiện để xây dựng cấu hình PC của bạn
                </p>
                <div className="grid grid-col-1 gap-4 justify-center py-4 w-full bg-bgSecondary">
                    {itemData.map(({ label, imageSrc }) => {
                        const selectedItem = selectedProducts[label];
                        return !selectedItem ? (
                            <ManualBuildPCItemCard
                                key={label}
                                label={label}
                                imageSrc={imageSrc}
                                description="Vui lòng chọn linh kiện"
                                buttonLabel="Chọn"
                                onButtonClick={() => handleSelectClick(label)}
                            />
                        ) : (
                            <ProductCard
                                key={label}
                                imageUrl={
                                    selectedItem?.imageUrl ||
                                    "/images/image-placeholder.webp"
                                }
                                productName={selectedItem?.name || label}
                                currentPrice={
                                    selectedItem?.price?.toString() || "0"
                                }
                                originalPrice="0"
                                discountPercentage="0%"
                                logoUrl=""
                                category={label}
                                productUrl={selectedItem?.id || "#"}
                                buttonLabel="Sửa"
                                onButtonClick={() => handleSelectClick(label)}
                                onRemoveClick={() => handleRemovePart(label)}
                            />
                        );
                    })}
                </div>

                {/* Flowbite Modal */}

                <div
                    id="default-modal"
                    tabIndex={-1}
                    inert={!showPopup ? true : undefined}
                    className={`${
                        showPopup ? "flex" : "hidden"
                    } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full`}
                >
                    <div className="relative p-4 w-full max-w-2xl max-h-full">
                        {/* Modal content */}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 mx-auto my-8 max-w-2xl w-full">
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Chọn linh kiện cho {currentCategory}
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => setShowPopup(false)}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <div className="p-4 space-y-4">
                                {/* Search and Sort Controls */}
                                <form className="grid grid-cols-3 gap-4 mb-4">
                                    <label
                                        htmlFor="simple-search"
                                        className="sr-only"
                                    >
                                        Search
                                    </label>
                                    <div className="relative col-span-2">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 18 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="simple-search"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Tìm kiếm theo tên sản phẩm..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    {/* <label htmlFor="sort-options" className="col-span-0"></label> */}
                                    <select
                                        id="sort-options"
                                        value={sortOption}
                                        onChange={(e) =>
                                            setSortOption(
                                                e.target.value as
                                                    | "name"
                                                    | "price-asc"
                                                    | "price-desc",
                                            )
                                        }
                                        className="col-span-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option value="name">
                                            Sắp xếp theo tên
                                        </option>
                                        <option value="price-asc">
                                            Theo giá tăng dần
                                        </option>
                                        <option value="price-desc">
                                            Theo giá giảm dần
                                        </option>
                                    </select>
                                </form>

                                {/* Items List with Loading State */}
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                        <p className="mt-3 text-gray-600">Đang tìm kiếm linh kiện tương thích...</p>
                                    </div>
                                ) : popupItems.length === 0 ? (
                                    <p className="text-gray-600">
                                        Không có linh kiện tương thích.
                                    </p>
                                ) : (
                                    Array.isArray(popupItems) && (
                                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                            {popupItems
                                                .filter((item) =>
                                                    item.name
                                                        .toLowerCase()
                                                        .includes(
                                                            searchTerm.toLowerCase(),
                                                        ),
                                                )
                                                .sort((a, b) => {
                                                    if (sortOption === "name") {
                                                        return a.name.localeCompare(
                                                            b.name,
                                                        );
                                                    }
                                                    if (
                                                        sortOption ===
                                                        "price-asc"
                                                    ) {
                                                        const priceA =
                                                            parseFloat(
                                                                a.price,
                                                            ) || Infinity;
                                                        const priceB =
                                                            parseFloat(
                                                                b.price,
                                                            ) || Infinity;
                                                        if (priceA === 0)
                                                            return 1;
                                                        if (priceB === 0)
                                                            return -1;
                                                        return priceA - priceB;
                                                    }
                                                    if (
                                                        sortOption ===
                                                        "price-desc"
                                                    ) {
                                                        const priceA =
                                                            parseFloat(a.price);
                                                        const priceB =
                                                            parseFloat(b.price);
                                                        if (
                                                            priceA === 0 &&
                                                            priceB === 0
                                                        )
                                                            return 0;
                                                        return priceB - priceA;
                                                    }
                                                    return 0;
                                                })
                                                .map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center p-2 border-b hover:bg-gray-100 cursor-pointer"
                                                        onClick={() =>
                                                            handleItemSelect(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <Image
                                                            src={
                                                                "/images/image-placeholder.webp"
                                                            }
                                                            alt={item.name}
                                                            width={50}
                                                            height={50}
                                                            className="w-12 h-12 object-cover mr-4 rounded"
                                                            loading="lazy"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-gray-800 font-medium">
                                                                {item.name}
                                                            </p>
                                                            <div className="text-gray-600">
                                                                {item.price ? (
                                                                    <div className="text-base font-semibold leading-none text-primary">
                                                                        {formatPrice(
                                                                            item.price,
                                                                        ) +
                                                                            " đ"}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-base font-semibold leading-none text-red-500">
                                                                        Liên hệ
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )
                                )}
                                {/* Pagination Controls */}
                                <nav
                                    aria-label="Page navigation example"
                                    className="flex justify-center mt-4"
                                >
                                    <ul className="inline-flex items-center -space-x-px h-8 text-sm">
                                        <li>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage - 1,
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                            >
                                                <span className="sr-only">
                                                    Previous
                                                </span>
                                                <svg
                                                    className="w-2.5 h-2.5 rtl:rotate-180"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 6 10"
                                                >
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 1 1 5l4 4"
                                                    />
                                                </svg>
                                            </button>
                                        </li>
                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => {
                                                const pageNumber = index + 1;
                                                const isCurrentPage =
                                                    currentPage === pageNumber;
                                                const isNearCurrentPage =
                                                    Math.abs(
                                                        currentPage -
                                                            pageNumber,
                                                    ) <= 2;
                                                const isFirstPage =
                                                    pageNumber === 1;
                                                const isLastPage =
                                                    pageNumber === totalPages;

                                                if (
                                                    isCurrentPage ||
                                                    isNearCurrentPage ||
                                                    isFirstPage ||
                                                    isLastPage
                                                ) {
                                                    return (
                                                        <li key={index}>
                                                            <button
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        pageNumber,
                                                                    )
                                                                }
                                                                className={`flex items-center justify-center px-3 h-8 leading-tight ${
                                                                    isCurrentPage
                                                                        ? "text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                                                                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                                                }`}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        </li>
                                                    );
                                                } else if (
                                                    pageNumber ===
                                                        currentPage - 3 ||
                                                    pageNumber ===
                                                        currentPage + 3
                                                ) {
                                                    return (
                                                        <li key={index}>
                                                            <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                                                                ...
                                                            </span>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            },
                                        )}
                                        <li>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage + 1,
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                            >
                                                <span className="sr-only">
                                                    Next
                                                </span>
                                                <svg
                                                    className="w-2.5 h-2.5 rtl:rotate-180"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 6 10"
                                                >
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m1 9 4-4-4-4"
                                                    />
                                                </svg>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                            {/* Modal footer */}
                            <div className="flex items-center justify-end p-4 border-t rounded-b dark:border-gray-600">
                                <button
                                    type="button"
                                    className=" text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    onClick={() => setShowPopup(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End of Flowbite Modal */}
            </div>

            {/* Summary Div */}
            <div className="summary flex flex-col space-y-4 p-4 bg-white rounded shadow col-span-2 font-bold">
                <div className="total-price">
                    <p className="text-lg font-bold text-primary">
                        Chi phí dự tính: {formatPrice(totalPrice.toString())} đ
                    </p>
                </div>
                <button
                    onClick={handleBuyNow}
                    className="bg-primary text-white text-center py-2 px-4 rounded"
                    type="button"
                >
                    Mua ngay
                </button>
                <button
                    onClick={handleAddToCart}
                    className="bg-blue-100 text-zinc-800 text-center py-2 px-4 rounded"
                    type="button"
                >
                    Thêm vào giỏ hàng
                </button>
                <div className="compatibility-state text-center py-2 px-4 bg-blue-100 rounded">
                    <p className="text-zinc-800 font-bold">
                        Trạng thái tương thích:{" "}
                        {isCompatible ? "Bình thường" : "Lỗi tương thích"}
                    </p>
                </div>
                <div className="total-wattage text-center py-2 px-4 bg-blue-100 rounded">
                    <p className="text-zinc-800 font-bold">
                        Công suất ước tính: {totalWattage} W
                    </p>
                </div>
                <button
                    onClick={handleSaveToExcel}
                    className="bg-primary text-white py-2 px-4 rounded flex justify-center items-center space-x-2"
                    type="button"
                >
                    <span className="text-center">Lưu dưới dạng Excel</span>
                </button>
            </div>
        </div>
    );
};


export default ManualBuildPCContent;
