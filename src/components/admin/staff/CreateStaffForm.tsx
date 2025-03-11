import React, { useState } from "react";
import { createStaff } from "@/api/admin";
import { toast } from "react-hot-toast";

const CreateStaffForm: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        phoneNumber: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...staffData } = formData;
            const result = await createStaff(staffData);

            if (result.success) {
                toast.success("Staff account created successfully!");
                // Reset form or handle navigation
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    firstname: "",
                    lastname: "",
                    phoneNumber: "",
                });
            } else {
                toast.error(result.message || "Failed to create staff account");
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create Staff Account</h2>

            <form onSubmit={handleSubmit}>
                {/* Form fields similar to above... */}

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Staff Account"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStaffForm;
