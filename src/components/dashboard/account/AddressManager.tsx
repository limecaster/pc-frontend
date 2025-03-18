"use client";

import React, { useState, useEffect } from "react";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from "@/api/account";
import { toast } from "react-hot-toast";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

type Ward = {
    name_with_type: string;
    code: string;
};

type District = {
    name_with_type: string;
    code: string;
    "xa-phuong": Record<string, Ward>;
};

type Province = {
    name_with_type: string;
    code: string;
    "quan-huyen": Record<string, District>;
};

type VietNamAdministrative = Record<string, Province>;

interface Address {
    id?: number;
    fullName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault?: boolean;
}

const emptyAddress: Address = {
    fullName: "",
    phoneNumber: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
};

const AddressManager: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<Address>(emptyAddress);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Administrative division data
    const [addressData, setAddressData] = useState<VietNamAdministrative>({});
    const [provinces, setProvinces] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [wards, setWards] = useState<string[]>([]);

    useEffect(() => {
        fetchAddresses();

        // Fetch Vietnamese administrative divisions data
        fetch("/data/hanh-chinh-vn.json")
            .then((res) => res.json())
            .then((data) => {
                setAddressData(data);
                setProvinces(
                    Object.entries(data).map(
                        ([_, details]) => (details as Province).name_with_type,
                    ),
                );
            })
            .catch((error) => {
                console.error("Error loading administrative data:", error);
                toast.error("Không thể tải dữ liệu hành chính");
            });
    }, []);

    // Update districts when province changes
    useEffect(() => {
        if (
            currentAddress.city &&
            addressData &&
            Object.keys(addressData).length > 0
        ) {
            const provinceKey = Object.keys(addressData).find(
                (key) =>
                    addressData[key].name_with_type === currentAddress.city,
            );

            if (provinceKey) {
                setDistricts(
                    Object.values(addressData[provinceKey]["quan-huyen"]).map(
                        (d) => d.name_with_type,
                    ),
                );

                // If editing an existing address where district doesn't match the new province
                if (
                    !Object.values(addressData[provinceKey]["quan-huyen"]).some(
                        (d) => d.name_with_type === currentAddress.district,
                    )
                ) {
                    // Reset district and ward
                    setCurrentAddress((prev) => ({
                        ...prev,
                        district: "",
                        ward: "",
                    }));
                }
            }
        }
    }, [currentAddress.city, addressData]);

    // Update wards when district changes
    useEffect(() => {
        if (
            currentAddress.city &&
            currentAddress.district &&
            addressData &&
            Object.keys(addressData).length > 0
        ) {
            const provinceKey = Object.keys(addressData).find(
                (key) =>
                    addressData[key].name_with_type === currentAddress.city,
            );

            if (provinceKey) {
                const districtKey = Object.keys(
                    addressData[provinceKey]["quan-huyen"],
                ).find(
                    (key) =>
                        addressData[provinceKey]["quan-huyen"][key]
                            .name_with_type === currentAddress.district,
                );

                if (districtKey) {
                    setWards(
                        Object.values(
                            addressData[provinceKey]["quan-huyen"][districtKey][
                                "xa-phuong"
                            ],
                        ).map((w) => w.name_with_type),
                    );

                    // If editing an existing address where ward doesn't match the new district
                    if (
                        !Object.values(
                            addressData[provinceKey]["quan-huyen"][districtKey][
                                "xa-phuong"
                            ],
                        ).some((w) => w.name_with_type === currentAddress.ward)
                    ) {
                        // Reset ward
                        setCurrentAddress((prev) => ({ ...prev, ward: "" }));
                    }
                }
            }
        }
    }, [currentAddress.district, currentAddress.city, addressData]);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const data = await getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Không thể tải địa chỉ");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setCurrentAddress(emptyAddress);
        setIsEditing(false);
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEditModal = (address: Address) => {
        setCurrentAddress(address);
        setIsEditing(true);
        setErrors({});
        setShowModal(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checkbox = e.target as HTMLInputElement;
            setCurrentAddress((prev) => ({
                ...prev,
                [name]: checkbox.checked,
            }));
        } else {
            setCurrentAddress((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const requiredFields = [
            "fullName",
            "phoneNumber",
            "street",
            "ward",
            "district",
            "city",
        ];

        requiredFields.forEach((field) => {
            if (!currentAddress[field as keyof Address]) {
                newErrors[field] = "Trường này là bắt buộc";
            }
        });

        if (
            currentAddress.phoneNumber &&
            !/^[0-9]{10,11}$/.test(currentAddress.phoneNumber)
        ) {
            newErrors.phoneNumber = "Số điện thoại không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeleteAddress = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
            try {
                await deleteAddress(id);
                setAddresses(addresses.filter((a) => a.id !== id));
                toast.success("Đã xóa địa chỉ");
            } catch (error) {
                console.error("Error deleting address:", error);
                toast.error("Không thể xóa địa chỉ");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);

            if (isEditing && currentAddress.id) {
                const updated = await updateAddress(
                    currentAddress.id,
                    currentAddress,
                );
                setAddresses(
                    addresses.map((addr) =>
                        addr.id === currentAddress.id ? updated : addr,
                    ),
                );
                toast.success("Đã cập nhật địa chỉ");
            } else {
                const newAddress = await addAddress(currentAddress);
                setAddresses([...addresses, newAddress]);
                toast.success("Đã thêm địa chỉ mới");
            }

            setShowModal(false);
        } catch (error) {
            console.error("Error saving address:", error);
            toast.error("Không thể lưu địa chỉ");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-32 bg-gray-200 rounded w-full"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Địa chỉ giao hàng
                </h2>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center text-sm text-primary hover:underline"
                >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Thêm địa chỉ mới
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="py-8 text-center border border-dashed rounded-md">
                    <p className="text-gray-500">
                        Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border ${address.isDefault ? "border-primary bg-blue-50" : "border-gray-200"} rounded-lg p-4 relative`}
                        >
                            {address.isDefault && (
                                <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                    Mặc định
                                </span>
                            )}
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">
                                        {address.fullName}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {address.phoneNumber}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {address.street}, {address.ward},{" "}
                                        {address.district}, {address.city}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() =>
                                            handleOpenEditModal(address)
                                        }
                                        className="p-1 text-gray-500 hover:text-primary"
                                    >
                                        <Pencil1Icon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteAddress(address.id!)
                                        }
                                        className="p-1 text-gray-500 hover:text-red-500"
                                        disabled={addresses.length === 1}
                                        title={
                                            addresses.length === 1
                                                ? "Không thể xóa địa chỉ duy nhất"
                                                : ""
                                        }
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for add/edit address */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">
                            {isEditing
                                ? "Chỉnh sửa địa chỉ"
                                : "Thêm địa chỉ mới"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={currentAddress.fullName}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-md ${
                                            errors.fullName
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={currentAddress.phoneNumber}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-md ${
                                            errors.phoneNumber
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.phoneNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Street */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ cụ thể
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={currentAddress.street}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-md ${
                                            errors.street
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.street && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.street}
                                        </p>
                                    )}
                                </div>

                                {/* Province/City, District, Ward Selectors */}
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Province/City */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tỉnh/Thành phố
                                        </label>
                                        <select
                                            name="city"
                                            value={currentAddress.city}
                                            onChange={handleChange}
                                            className={`w-full p-2 border rounded-md ${
                                                errors.city
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Chọn tỉnh/thành phố
                                            </option>
                                            {provinces.map((province) => (
                                                <option
                                                    key={province}
                                                    value={province}
                                                >
                                                    {province}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.city && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    {/* District */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quận/Huyện
                                        </label>
                                        <select
                                            name="district"
                                            value={currentAddress.district}
                                            onChange={handleChange}
                                            disabled={!currentAddress.city}
                                            className={`w-full p-2 border rounded-md ${
                                                errors.district
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } ${!currentAddress.city ? "bg-gray-100" : ""}`}
                                        >
                                            <option value="">
                                                Chọn quận/huyện
                                            </option>
                                            {districts.map((district) => (
                                                <option
                                                    key={district}
                                                    value={district}
                                                >
                                                    {district}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.district && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.district}
                                            </p>
                                        )}
                                    </div>

                                    {/* Ward */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phường/Xã
                                        </label>
                                        <select
                                            name="ward"
                                            value={currentAddress.ward}
                                            onChange={handleChange}
                                            disabled={!currentAddress.district}
                                            className={`w-full p-2 border rounded-md ${
                                                errors.ward
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } ${!currentAddress.district ? "bg-gray-100" : ""}`}
                                        >
                                            <option value="">
                                                Chọn phường/xã
                                            </option>
                                            {wards.map((ward) => (
                                                <option key={ward} value={ward}>
                                                    {ward}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.ward && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.ward}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Default Address Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        name="isDefault"
                                        checked={currentAddress.isDefault}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label
                                        htmlFor="isDefault"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        Đặt làm địa chỉ mặc định
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-70"
                                    disabled={submitting}
                                >
                                    {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressManager;
