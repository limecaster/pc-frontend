import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Types for Vietnam administrative data
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

interface VietnamAddressSelectProps {
    selectedCity: string;
    selectedDistrict: string;
    selectedWard: string;
    onCityChange: (city: string) => void;
    onDistrictChange: (district: string) => void;
    onWardChange: (ward: string) => void;
    className?: string;
    labelClassName?: string;
    selectClassName?: string;
    required?: boolean;
    labels?: {
        city?: string;
        district?: string;
        ward?: string;
    };
    placeholders?: {
        city?: string;
        district?: string;
        ward?: string;
    };
}

const VietnamAddressSelect: React.FC<VietnamAddressSelectProps> = ({
    selectedCity,
    selectedDistrict,
    selectedWard,
    onCityChange,
    onDistrictChange,
    onWardChange,
    className = "",
    labelClassName = "block text-sm font-medium text-gray-700 mb-1",
    selectClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500",
    required = false,
    labels = {
        city: "Tỉnh/Thành phố",
        district: "Quận/Huyện",
        ward: "Xã/Phường",
    },
    placeholders = {
        city: "Chọn tỉnh/thành phố",
        district: "Chọn quận/huyện",
        ward: "Chọn xã/phường",
    },
}) => {
    const [addressData, setAddressData] = useState<VietNamAdministrative>({});
    const [provinces, setProvinces] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [wards, setWards] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load data from JSON file
    useEffect(() => {
        setIsLoading(true);
        fetch("/data/hanh-chinh-vn.json")
            .then((res) => res.json())
            .then((data) => {
                setAddressData(data);
                setProvinces(
                    Object.entries(data).map(
                        ([_, details]) => (details as Province).name_with_type,
                    ),
                );
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error loading administrative data:", error);
                toast.error("Không thể tải dữ liệu địa chỉ hành chính");
                setIsLoading(false);
            });
    }, []);

    // Update districts when province changes
    useEffect(() => {
        if (selectedCity && Object.keys(addressData).length > 0) {
            const provinceKey = Object.keys(addressData).find(
                (key) => addressData[key].name_with_type === selectedCity,
            );
            if (provinceKey) {
                setDistricts(
                    Object.values(addressData[provinceKey]["quan-huyen"]).map(
                        (d) => d.name_with_type,
                    ),
                );
                // Don't reset district and ward here, let the parent component handle it
            }
        } else {
            setDistricts([]);
        }
    }, [selectedCity, addressData]);

    // Update wards when district changes
    useEffect(() => {
        if (
            selectedCity &&
            selectedDistrict &&
            Object.keys(addressData).length > 0
        ) {
            const provinceKey = Object.keys(addressData).find(
                (key) => addressData[key].name_with_type === selectedCity,
            );
            if (provinceKey) {
                const districtKey = Object.keys(
                    addressData[provinceKey]["quan-huyen"],
                ).find(
                    (key) =>
                        addressData[provinceKey]["quan-huyen"][key]
                            .name_with_type === selectedDistrict,
                );
                if (districtKey) {
                    setWards(
                        Object.values(
                            addressData[provinceKey]["quan-huyen"][districtKey][
                                "xa-phuong"
                            ],
                        ).map((w) => w.name_with_type),
                    );
                    // Don't reset ward here, let the parent component handle it
                }
            }
        } else {
            setWards([]);
        }
    }, [selectedCity, selectedDistrict, addressData]);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        onCityChange(city);

        // Automatically reset district and ward when city changes
        if (city !== selectedCity) {
            onDistrictChange("");
            onWardChange("");
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const district = e.target.value;
        onDistrictChange(district);

        // Automatically reset ward when district changes
        if (district !== selectedDistrict) {
            onWardChange("");
        }
    };

    return (
        <div className={`grid grid-cols-1 gap-3 ${className}`}>
            {/* Province/City */}
            <div>
                {labels.city && (
                    <label className={labelClassName}>
                        {labels.city} {required && "*"}
                    </label>
                )}
                <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className={`${selectClassName} ${isLoading ? "cursor-wait" : ""}`}
                    required={required}
                    disabled={isLoading}
                >
                    <option value="">{placeholders.city}</option>
                    {provinces.map((province) => (
                        <option key={province} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
            </div>

            {/* District */}
            <div>
                {labels.district && (
                    <label className={labelClassName}>
                        {labels.district} {required && "*"}
                    </label>
                )}
                <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    className={`${selectClassName} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    required={required}
                    disabled={!selectedCity}
                >
                    <option value="">{placeholders.district}</option>
                    {districts.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ward */}
            <div>
                {labels.ward && (
                    <label className={labelClassName}>
                        {labels.ward} {required && "*"}
                    </label>
                )}
                <select
                    value={selectedWard}
                    onChange={(e) => onWardChange(e.target.value)}
                    className={`${selectClassName} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    required={required}
                    disabled={!selectedDistrict}
                >
                    <option value="">{placeholders.ward}</option>
                    {wards.map((ward) => (
                        <option key={ward} value={ward}>
                            {ward}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default VietnamAddressSelect;
