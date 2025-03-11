import React, { useState } from "react";
import { createInitialAdmin } from "@/api/admin";
import { toast } from "react-hot-toast";

const InitialAdminSetup: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        phoneNumber: "",
        secretKey: "",
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
            const { confirmPassword, ...adminData } = formData;
            const result = await createInitialAdmin(adminData);

            if (result.success) {
                toast.success("Initial admin account created successfully!");
                // Redirect to login
                window.location.href = "/admin/login";
            } else {
                toast.error(result.message || "Failed to create admin account");
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
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Create Initial Admin Account
            </h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                {/* Other form fields... */}

                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="secretKey"
                    >
                        Secret Key
                    </label>
                    <input
                        type="password"
                        id="secretKey"
                        name="secretKey"
                        value={formData.secretKey}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Admin Account"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InitialAdminSetup;
