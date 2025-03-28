"use client";

import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/api/account";
import { toast } from "react-hot-toast";

interface UserProfile {
    fullName: string;
    email: string;
    phone: string;
    birthday?: string;
    gender: string;
}

const ProfileForm: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({
        fullName: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "male",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsFetching(true);
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Không thể tải thông tin người dùng");
            } finally {
                setIsFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // Make sure gender has a default value
            const updatedProfile = {
                ...profile,
                gender: profile.gender || "male",
            };

            await updateProfile(updatedProfile);

            // Success
            setIsEditing(false);
            toast.success("Thông tin cá nhân đã được cập nhật!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Không thể cập nhật thông tin. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="bg-white rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Thông tin cá nhân
                </h2>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-primary hover:underline"
                    >
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full p-2 border rounded-md ${
                                isEditing
                                    ? "border-gray-300"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            disabled={true} // Email can't be changed
                            className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full p-2 border rounded-md ${
                                isEditing
                                    ? "border-gray-300"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        />
                    </div>

                    {/* Birthday */}
                    <div>
                        <label
                            htmlFor="birthday"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={profile.birthday || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full p-2 border rounded-md ${
                                isEditing
                                    ? "border-gray-300"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        />
                        {isEditing && (
                            <p className="mt-1 text-xs text-gray-500">
                                Current value: {profile.birthday || "Not set"}
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Giới tính
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={profile.gender || "male"}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full p-2 border rounded-md ${
                                isEditing
                                    ? "border-gray-300"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                        {isEditing && (
                            <p className="mt-1 text-xs text-gray-500">
                                Current value: {profile.gender || "male"}
                            </p>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ProfileForm;
