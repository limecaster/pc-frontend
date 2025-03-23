import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Spinner, Pagination } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";

interface SelectorItem {
    id: string;
    name: string;
}

interface SelectorModalProps {
    title: string;
    show: boolean;
    onClose: () => void;
    onSelect: (selectedItems: string[]) => void;
    fetchItems: (
        search: string,
        page: number,
        limit: number,
    ) => Promise<{
        items: SelectorItem[];
        total: number;
        pages: number;
    }>;
    currentSelection: string[];
    itemsPerPage?: number;
    isMultiSelect?: boolean;
}

const SelectorModal: React.FC<SelectorModalProps> = ({
    title,
    show,
    onClose,
    onSelect,
    fetchItems,
    currentSelection,
    itemsPerPage = 10,
    isMultiSelect = true,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState<SelectorItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Track the actual search term that was submitted
    const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

    // Initialize with current selection
    useEffect(() => {
        setSelectedItems(currentSelection || []);
    }, [currentSelection, show]);

    // Load items when modal is opened or page changes or when search is explicitly submitted
    useEffect(() => {
        if (show) {
            loadItems();
        }
    }, [show, currentPage, appliedSearchTerm]); // Removed searchTerm, added appliedSearchTerm

    const loadItems = async () => {
        if (!show) return;

        setLoading(true);
        try {
            // Use the appliedSearchTerm instead of searchTerm
            const response = await fetchItems(
                appliedSearchTerm,
                currentPage,
                itemsPerPage,
            );
            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.pages);
        } catch (error) {
            console.error("Error loading items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        setAppliedSearchTerm(searchTerm); // Update the applied search term when search is triggered
    };

    const handleItemToggle = (id: string) => {
        if (isMultiSelect) {
            setSelectedItems((prev) =>
                prev.includes(id)
                    ? prev.filter((itemId) => itemId !== id)
                    : [...prev, id],
            );
        } else {
            setSelectedItems([id]);
        }
    };

    const handleConfirm = () => {
        onSelect(selectedItems);
        onClose();
    };

    // Reset search when modal is closed
    useEffect(() => {
        if (!show) {
            setSearchTerm("");
            setAppliedSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    return (
        <Modal show={show} onClose={onClose} size="lg">
            <Modal.Header>
                <div className="flex justify-between w-full items-center">
                    <span>{title}</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
            </Modal.Header>
            <Modal.Body>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-4 flex">
                    <TextInput
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow mr-2"
                    />
                    <Button type="submit" disabled={loading}>
                        <HiSearch className="mr-2 h-5 w-5" />
                        Tìm kiếm
                    </Button>
                </form>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Spinner size="xl" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {appliedSearchTerm
                                ? "Không tìm thấy kết quả phù hợp"
                                : "Nhập từ khóa và nhấn tìm kiếm để bắt đầu"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center p-2 border-b"
                                >
                                    <input
                                        type="checkbox"
                                        id={`item-${item.id}`}
                                        checked={selectedItems.includes(
                                            item.id,
                                        )}
                                        onChange={() =>
                                            handleItemToggle(item.id)
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor={`item-${item.id}`}
                                        className="ml-2 w-full py-2 text-sm font-medium text-gray-900 cursor-pointer"
                                    >
                                        {item.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                            totalPages={totalPages}
                            showIcons
                        />
                    </div>
                )}

                {/* Selection Info */}
                <div className="mt-4 text-sm text-gray-500">
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? "s" : ""} được chọn
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button color="gray" onClick={onClose}>
                    Hủy
                </Button>
                <Button onClick={handleConfirm}>
                    Xác nhận ({selectedItems.length})
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SelectorModal;
