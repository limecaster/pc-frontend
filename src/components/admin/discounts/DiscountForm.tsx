import React from "react";
import {
    Modal,
    Button,
    TextInput,
    Select,
    Textarea,
    Spinner,
} from "flowbite-react";
import { HiPlus, HiX } from "react-icons/hi";
import { DiscountFormProps } from "@/types/discount";

const DiscountForm: React.FC<DiscountFormProps> = ({
    formData,
    modalMode,
    isSubmitting,
    setFormData,
    handleSubmit,
    handleFormChange,
    handleTargetTypeChange,
    selectedProductNames,
    selectedCustomerNames,
    showProductSelector,
    showCustomerSelector,
    setShowProductSelector,
    setShowCustomerSelector,
    categories,
    loadingSelectors,
}) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="discountCode"
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <TextInput
                    id="discountCode"
                    name="discountCode"
                    placeholder="Nhập mã giảm giá (ví dụ: SUMMER2023)"
                    value={formData.discountCode}
                    onChange={handleFormChange}
                    required
                    disabled={modalMode === "edit"}
                />
                {modalMode === "edit" && (
                    <p className="mt-1 text-xs text-gray-500">
                        Mã giảm giá không thể thay đổi sau khi tạo
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="discountName"
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    Tên mã giảm giá <span className="text-red-500">*</span>
                </label>
                <TextInput
                    id="discountName"
                    name="discountName"
                    placeholder="Nhập tên mô tả mã giảm giá"
                    value={formData.discountName}
                    onChange={handleFormChange}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="discountDescription"
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    Mô tả
                </label>
                <Textarea
                    id="discountDescription"
                    name="discountDescription"
                    placeholder="Mô tả chi tiết về mã giảm giá"
                    rows={3}
                    value={formData.discountDescription}
                    onChange={handleFormChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="discountType"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <Select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="percentage">Theo phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (VND)</option>
                    </Select>
                </div>

                <div>
                    <label
                        htmlFor="discountAmount"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Giá trị giảm giá <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        id="discountAmount"
                        name="discountAmount"
                        type="number"
                        min={0}
                        max={formData.type === "percentage" ? 100 : undefined}
                        placeholder={
                            formData.type === "percentage"
                                ? "Nhập % giảm giá"
                                : "Nhập số tiền giảm"
                        }
                        value={formData.discountAmount}
                        onChange={handleFormChange}
                        required
                    />
                    {formData.type === "percentage" && (
                        <p className="mt-1 text-xs text-gray-500">
                            Giá trị từ 1 đến 100%
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="startDate"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleFormChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="endDate"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleFormChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        min={formData.startDate} // Prevent end date before start date
                        required
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="status"
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    Trạng thái
                </label>
                <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </Select>
            </div>

            {/* Target Configuration Section */}
            <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700 mb-2">
                    Cấu hình đối tượng áp dụng
                </h4>

                <div>
                    <label
                        htmlFor="targetType"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Đối tượng áp dụng
                    </label>
                    <Select
                        id="targetType"
                        name="targetType"
                        value={formData.targetType || "all"}
                        onChange={handleTargetTypeChange}
                    >
                        <option value="all">Tất cả</option>
                        <option value="products">Sản phẩm cụ thể</option>
                        <option value="categories">Danh mục sản phẩm</option>
                        <option value="customers">Khách hàng cụ thể</option>
                    </Select>
                </div>

                {/* Product selector */}
                {formData.targetType === "products" && (
                    <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Chọn sản phẩm áp dụng
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col space-y-3">
                            <Button
                                color="light"
                                onClick={() => setShowProductSelector(true)}
                            >
                                <HiPlus className="mr-2" />
                                Chọn sản phẩm
                            </Button>

                            {/* Display selected products */}
                            {formData.productIds &&
                            formData.productIds.length > 0 ? (
                                <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                                    <div className="text-sm text-gray-500 mb-2">
                                        Đã chọn {formData.productIds.length} sản
                                        phẩm:
                                    </div>
                                    <div className="space-y-1">
                                        {formData.productIds.map((id) => (
                                            <div
                                                key={id}
                                                className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                            >
                                                <span className="text-sm">
                                                    {selectedProductNames[id] ||
                                                        id}
                                                </span>
                                                <Button
                                                    color="light"
                                                    size="xs"
                                                    onClick={() => {
                                                        const newIds =
                                                            formData.productIds?.filter(
                                                                (i) => i !== id,
                                                            ) || [];
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            productIds: newIds,
                                                        }));
                                                    }}
                                                >
                                                    <HiX />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    Không có sản phẩm nào được chọn
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Category selector */}
                {formData.targetType === "categories" && (
                    <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Chọn danh mục sản phẩm
                            <span className="text-red-500">*</span>
                        </label>
                        {loadingSelectors ? (
                            <div className="flex items-center space-x-2">
                                <Spinner size="sm" />
                                <span className="text-sm text-gray-500">
                                    Đang tải danh mục...
                                </span>
                            </div>
                        ) : (
                            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                                {categories.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Không có danh mục nào
                                    </p>
                                ) : (
                                    categories.map((category) => (
                                        <div
                                            key={category}
                                            className="flex items-center mb-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`category-${category}`}
                                                checked={
                                                    formData.categoryNames?.includes(
                                                        category,
                                                    ) || false
                                                }
                                                onChange={(e) => {
                                                    const isChecked =
                                                        e.target.checked;
                                                    setFormData((prev) => {
                                                        const currentCategories =
                                                            prev.categoryNames ||
                                                            [];
                                                        return {
                                                            ...prev,
                                                            categoryNames:
                                                                isChecked
                                                                    ? [
                                                                          ...currentCategories,
                                                                          category,
                                                                      ]
                                                                    : currentCategories.filter(
                                                                          (c) =>
                                                                              c !==
                                                                              category,
                                                                      ),
                                                        };
                                                    });
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label
                                                htmlFor={`category-${category}`}
                                                className="ml-2 text-sm font-medium text-gray-900"
                                            >
                                                {category}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Customer selector */}
                {formData.targetType === "customers" && (
                    <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Chọn khách hàng
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col space-y-3">
                            <Button
                                color="light"
                                onClick={() => setShowCustomerSelector(true)}
                            >
                                <HiPlus className="mr-2" />
                                Chọn khách hàng
                            </Button>

                            {/* Display selected customers */}
                            {formData.customerIds &&
                            formData.customerIds.length > 0 ? (
                                <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                                    <div className="text-sm text-gray-500 mb-2">
                                        Đã chọn {formData.customerIds.length}{" "}
                                        khách hàng:
                                    </div>
                                    <div className="space-y-1">
                                        {formData.customerIds.map((id) => (
                                            <div
                                                key={id}
                                                className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                            >
                                                <span className="text-sm">
                                                    {selectedCustomerNames[
                                                        id
                                                    ] || id}
                                                </span>
                                                <Button
                                                    color="light"
                                                    size="xs"
                                                    onClick={() => {
                                                        const newIds =
                                                            formData.customerIds?.filter(
                                                                (i) => i !== id,
                                                            ) || [];
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            customerIds: newIds,
                                                        }));
                                                    }}
                                                >
                                                    <HiX />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    Không có khách hàng nào được chọn
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label
                            htmlFor="minOrderAmount"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            Giá trị đơn hàng tối thiểu (đ)
                        </label>
                        <TextInput
                            id="minOrderAmount"
                            name="minOrderAmount"
                            type="number"
                            min="0"
                            placeholder="0 = không giới hạn"
                            value={formData.minOrderAmount || ""}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="flex flex-col space-y-4 pt-8">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isFirstPurchaseOnly"
                                checked={formData.isFirstPurchaseOnly || false}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        isFirstPurchaseOnly: e.target.checked,
                                    }));
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                                htmlFor="isFirstPurchaseOnly"
                                className="ml-2 text-sm font-medium text-gray-900"
                            >
                                Chỉ áp dụng cho lần mua đầu tiên
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isAutomatic"
                                checked={formData.isAutomatic || false}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        isAutomatic: e.target.checked,
                                    }));
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                                htmlFor="isAutomatic"
                                className="ml-2 text-sm font-medium text-gray-900"
                            >
                                Tự động áp dụng mã giảm giá (Không cần nhập mã)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default DiscountForm;
