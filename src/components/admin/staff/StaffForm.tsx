import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStaff, updateStaff, fetchStaffById } from "@/api/admin-staff";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import VietnamAddressSelect from "@/components/common/VietnamAddressSelect";

interface StaffFormProps {
    staffId?: number;
    mode: "add" | "edit";
}

interface FormData {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    role: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    [key: string]: string;
}

const StaffForm: React.FC<StaffFormProps> = ({ staffId, mode }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === "edit");
    const hasLoadedData = useRef(false);

    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        firstname: "",
        lastname: "",
        phoneNumber: "",
        role: "staff",
        street: "",
        ward: "",
        district: "",
        city: "",
    });

    useEffect(() => {
        if (mode === "edit" && staffId && !hasLoadedData.current) {
            hasLoadedData.current = true;
            const loadStaffData = async () => {
                try {
                    setInitialLoading(true);
                    const response = await fetchStaffById(staffId);

                    if (response.success) {
                        setFormData({
                            ...formData,
                            username: response.staff.username || "",
                            email: response.staff.email || "",
                            firstname: response.staff.firstname || "",
                            lastname: response.staff.lastname || "",
                            phoneNumber: response.staff.phoneNumber || "",
                            role: response.staff.role || "staff",
                            street: response.staff.street || "",
                            ward: response.staff.ward || "",
                            district: response.staff.district || "",
                            city: response.staff.city || "",
                            password: "",
                            confirmPassword: "",
                        });
                    }
                } catch (error) {
                    console.error("Error loading staff data:", error);
                    toast.error("Không thể tải thông tin nhân viên");
                } finally {
                    setInitialLoading(false);
                }
            };

            loadStaffData();
        }
    }, [staffId, mode]); // Dependencies include staffId and mode

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        const requiredFields =
            mode === "add"
                ? [
                      "username",
                      "password",
                      "confirmPassword",
                      "email",
                      "firstname",
                      "lastname",
                  ]
                : ["email", "firstname", "lastname"];

        const missingFields = requiredFields.filter(
            (field) => !formData[field],
        );

        if (missingFields.length > 0) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return false;
        }

        if (mode === "add" || (mode === "edit" && formData.password)) {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Mật khẩu xác nhận không khớp");
                return false;
            }

            if (formData.password.length < 6) {
                toast.error("Mật khẩu phải có ít nhất 6 ký tự");
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Email không hợp lệ");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Remove confirmPassword from data before sending to API
            const { confirmPassword, ...staffData } = formData;

            let response;
            if (mode === "add") {
                response = await createStaff(staffData);
                toast.success("Tạo tài khoản nhân viên thành công");
            } else if (mode === "edit" && staffId) {
                const dataToSend = formData.password
                    ? { ...staffData }
                    : {
                          username: staffData.username,
                          email: staffData.email,
                          firstname: staffData.firstname,
                          lastname: staffData.lastname,
                          phoneNumber: staffData.phoneNumber,
                          role: staffData.role,
                          street: staffData.street,
                          ward: staffData.ward,
                          district: staffData.district,
                          city: staffData.city,
                      };

                response = await updateStaff(staffId, dataToSend);
                toast.success("Cập nhật tài khoản nhân viên thành công");
            }

            router.push("/admin/staff");
        } catch (error) {
            console.error("Error saving staff data:", error);
            toast.error(
                mode === "add"
                    ? "Không thể tạo tài khoản nhân viên"
                    : "Không thể cập nhật tài khoản nhân viên",
            );
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                <div className="text-center text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {mode === "add"
                        ? "Thêm nhân viên mới"
                        : "Chỉnh sửa thông tin nhân viên"}
                </h2>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập {mode === "add" && "*"}
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required={mode === "add"}
                            disabled={mode === "edit"}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ *
                        </label>
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên *
                        </label>
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {mode === "add" ? "Mật khẩu *" : "Mật khẩu mới"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required={mode === "add"}
                            placeholder={
                                mode === "edit"
                                    ? "Để trống nếu không thay đổi"
                                    : ""
                            }
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {mode === "add"
                                ? "Xác nhận mật khẩu *"
                                : "Xác nhận mật khẩu mới"}
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required={mode === "add"}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="manager">Quản lý</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="Số nhà, đường"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                        />

                        <VietnamAddressSelect
                            selectedCity={formData.city}
                            selectedDistrict={formData.district}
                            selectedWard={formData.ward}
                            onCityChange={(city) =>
                                setFormData((prev) => ({ ...prev, city }))
                            }
                            onDistrictChange={(district) =>
                                setFormData((prev) => ({ ...prev, district }))
                            }
                            onWardChange={(ward) =>
                                setFormData((prev) => ({ ...prev, ward }))
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? (
                        "Đang xử lý..."
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            {mode === "add"
                                ? "Tạo nhân viên"
                                : "Cập nhật thông tin"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default StaffForm;
