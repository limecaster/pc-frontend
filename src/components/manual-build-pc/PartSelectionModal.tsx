import React from "react";
import Image from "next/image";

interface PartSelectionModalProps {
    showPopup: boolean;
    setShowPopup: (show: boolean) => void;
    currentCategory: string;
    popupItems: any[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: "name" | "price-asc" | "price-desc";
    setSortOption: (option: "name" | "price-asc" | "price-desc") => void;
    currentPage: number;
    totalPages: number;
    handleItemSelect: (item: any) => void;
    handlePageChange: (page: number) => void;
    onSearchChange?: (term: string) => void;
    onSortChange?: (option: "name" | "price-asc" | "price-desc") => void;
}

const formatPrice = (price: string) => {
    price = parseFloat(price).toFixed(0);
    price = price.toString();
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const PartSelectionModal: React.FC<PartSelectionModalProps> = ({
    showPopup,
    setShowPopup,
    currentCategory,
    popupItems,
    loading,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    currentPage,
    totalPages,
    handleItemSelect,
    handlePageChange,
    onSearchChange,
    onSortChange,
}) => {
    return (
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
                        {/* Search and Sort Controls - only show if we have items or are still loading */}
                        {(loading || popupItems.length > 0) && (
                            <form
                                className="grid grid-cols-3 gap-4 mb-4"
                                onSubmit={(e) => e.preventDefault()}
                            >
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
                                        onChange={(e) => {
                                            // No need for debounce with client-side filtering
                                            const value = e.target.value;
                                            setSearchTerm(value);
                                            // Call parent's search handler if provided
                                            if (onSearchChange) {
                                                onSearchChange(value);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                setSearchTerm(
                                                    e.currentTarget.value,
                                                );
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Apply search when focus leaves the field
                                            setSearchTerm(
                                                e.currentTarget.value,
                                            );
                                        }}
                                    />
                                </div>
                                <select
                                    id="sort-options"
                                    value={sortOption}
                                    onChange={(e) => {
                                        const value = e.target.value as
                                            | "name"
                                            | "price-asc"
                                            | "price-desc";
                                        setSortOption(value);
                                        // Call parent's sort handler to immediately apply sorting
                                        if (onSortChange) {
                                            onSortChange(value);
                                        }
                                    }}
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
                        )}

                        {/* Items List with Loading State */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                <p className="mt-3 text-gray-600">
                                    Đang tìm kiếm linh kiện tương thích...
                                </p>
                            </div>
                        ) : popupItems.length === 0 ? (
                            <div className="text-center py-8">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="mt-2 text-lg font-medium text-gray-900">
                                    Không có linh kiện tương thích
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Thử chọn các linh kiện khác hoặc bỏ bớt các
                                    linh kiện đã chọn để tìm được sản phẩm phù
                                    hợp.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {popupItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center p-2 border-b hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleItemSelect(item)}
                                    >
                                        <Image
                                            src={
                                                item.imageUrl ||
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
                                                        ) + " đ"}
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
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <nav
                                aria-label="Page navigation"
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
                                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
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
                                            // Force comparison as numbers
                                            const isCurrentPage =
                                                Number(currentPage) ===
                                                Number(pageNumber);
                                            const isNearCurrentPage =
                                                Math.abs(
                                                    Number(currentPage) -
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
                                                (pageNumber ===
                                                    currentPage - 3 ||
                                                    pageNumber ===
                                                        currentPage + 3) &&
                                                pageNumber > 1 &&
                                                pageNumber < totalPages
                                            ) {
                                                return (
                                                    <li key={index}>
                                                        <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">
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
                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
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
                        )}
                    </div>

                    {/* Modal footer */}
                    <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button
                            onClick={() => setShowPopup(false)}
                            type="button"
                            className="text-white bg-rose-500 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-rose-300 rounded-lg border border-rose-200 text-sm font-medium px-5 py-2.5 hover:text-white focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartSelectionModal;
