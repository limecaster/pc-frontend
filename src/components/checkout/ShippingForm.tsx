import React from "react";
import VietnamAddressSelect from "@/components/common/VietnamAddressSelect";

export interface CheckoutFormData {
    fullName: string;
    houseNumber: string;
    streetName: string;
    province: string;
    district: string;
    ward: string;
    email: string;
    phone: string;
    notes: string;
}

interface ShippingFormProps {
    formData: CheckoutFormData;
    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    onAddressChange: {
        onCityChange: (city: string) => void;
        onDistrictChange: (district: string) => void;
        onWardChange: (ward: string) => void;
    };
}

const ShippingForm: React.FC<ShippingFormProps> = ({
    formData,
    onChange,
    onAddressChange,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin thanh toán
            </h2>

            <div className="space-y-4">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Họ tên người nhận
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                {/* House Number */}
                <div>
                    <label
                        htmlFor="houseNumber"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Số nhà
                    </label>
                    <input
                        type="text"
                        id="houseNumber"
                        name="houseNumber"
                        value={formData.houseNumber}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                {/* Street Name */}
                <div>
                    <label
                        htmlFor="streetName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tên đường
                    </label>
                    <input
                        type="text"
                        id="streetName"
                        name="streetName"
                        value={formData.streetName}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                {/* Vietnam Address Select */}
                <VietnamAddressSelect
                    selectedCity={formData.province}
                    selectedDistrict={formData.district}
                    selectedWard={formData.ward}
                    onCityChange={onAddressChange.onCityChange}
                    onDistrictChange={onAddressChange.onDistrictChange}
                    onWardChange={onAddressChange.onWardChange}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    required={true}
                    selectClassName="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                    labels={{
                        city: "Tỉnh/Thành phố",
                        district: "Quận/Huyện",
                        ward: "Xã/Phường",
                    }}
                />

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Số điện thoại
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default ShippingForm;
