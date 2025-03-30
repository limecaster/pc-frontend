import React from "react";
import { Table, Spinner, Pagination, TextInput, Button } from "flowbite-react";
import { HiSearch, HiPencil, HiTrash } from "react-icons/hi";
import { DiscountTableProps } from "@/types/discount";

const DiscountTable: React.FC<DiscountTableProps> = ({
    discounts,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleEditDiscount,
    handleConfirmDelete,
    isLoading,
}) => {
    // Filter discounts based on search term
    const filteredDiscounts = discounts.filter(
        (discount) =>
            discount.discountCode
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            discount.discountName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDiscounts.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const getStatusBadgeClass = (status: string): string => {
        const statusClasses: Record<string, string> = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
            expired: "bg-red-100 text-red-800",
        };
        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <>
            {/* Search Filter */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <HiSearch className="w-5 h-5 text-gray-500" />
                    </div>
                    <TextInput
                        type="text"
                        placeholder="Tìm kiếm mã giảm giá..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full lg:w-1/3 pl-10"
                    />
                </div>
            </div>

            {/* Discounts Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                {isLoading ? (
                    <div className="text-center py-10">
                        <Spinner size="xl" />
                        <div className="mt-4 text-gray-600">
                            Đang tải dữ liệu...
                        </div>
                    </div>
                ) : (
                    <>
                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>Mã giảm giá</Table.HeadCell>
                                <Table.HeadCell>Tên mã</Table.HeadCell>
                                <Table.HeadCell>Loại</Table.HeadCell>
                                <Table.HeadCell>Giá trị</Table.HeadCell>
                                <Table.HeadCell>
                                    Thời gian hiệu lực
                                </Table.HeadCell>
                                <Table.HeadCell>Trạng thái</Table.HeadCell>
                                <Table.HeadCell>Thao tác</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {currentItems.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            Không tìm thấy mã giảm giá nào
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    currentItems.map((discount) => (
                                        <Table.Row
                                            key={discount.id}
                                            className="bg-white"
                                        >
                                            <Table.Cell className="font-medium text-gray-900">
                                                {discount.discountCode}
                                                {discount.isAutomatic && (
                                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                                                        Tự động
                                                    </span>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {discount.discountName}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {discount.type === "percentage"
                                                    ? "Phần trăm"
                                                    : "Cố định"}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {discount.type === "percentage"
                                                    ? `${discount.discountAmount}%`
                                                    : `${discount.discountAmount.toLocaleString()}₫`}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatDate(discount.startDate)}{" "}
                                                - {formatDate(discount.endDate)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(discount.status)}`}
                                                >
                                                    {discount.status ===
                                                    "active"
                                                        ? "Hoạt động"
                                                        : discount.status ===
                                                            "inactive"
                                                          ? "Không hoạt động"
                                                          : "Hết hạn"}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        color="light"
                                                        size="xs"
                                                        onClick={() =>
                                                            handleEditDiscount(
                                                                discount,
                                                            )
                                                        }
                                                    >
                                                        <HiPencil className="mr-1" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        color="failure"
                                                        size="xs"
                                                        onClick={() =>
                                                            handleConfirmDelete(
                                                                discount.id,
                                                            )
                                                        }
                                                    >
                                                        <HiTrash className="mr-1" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table>

                        {totalPages > 1 && (
                            <div className="flex overflow-x-auto sm:justify-center py-4 px-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) =>
                                        setCurrentPage(page)
                                    }
                                    showIcons
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default DiscountTable;
