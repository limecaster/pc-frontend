import React, { useState, useEffect } from "react";
import { API_URL } from "@/config/constants";

const ApiStatusChecker: React.FC = () => {
    const [status, setStatus] = useState<
        "checking" | "available" | "unavailable"
    >("checking");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                // Try a different endpoint that's more likely to work
                const response = await fetch(`${API_URL}/products/categories`);
                if (response.ok) {
                    setStatus("available");
                } else {
                    setStatus("unavailable");
                    setError(`API responded with status: ${response.status}`);
                }
            } catch (err) {
                setStatus("unavailable");
                if (err instanceof Error) {
                    setError(`Connection error: ${err.message}`);
                } else {
                    setError("Connection error");
                }
            }
        };

        checkApiStatus();
    }, []);

    if (status === "checking") {
        return (
            <div className="text-sm text-gray-500">Checking API status...</div>
        );
    }

    if (status === "unavailable") {
        return (
            <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4 text-sm">
                <p className="font-medium">API Connection Issue</p>
                <p className="mt-1">
                    {error || "Unable to connect to the API server"}
                </p>
                <p className="mt-1">
                    Make sure your backend server is running at: {API_URL}
                </p>
            </div>
        );
    }

    return (
        <div className="p-2 bg-green-50 text-green-700 rounded-md mb-4 text-sm">
            API connected successfully
        </div>
    );
};

export default ApiStatusChecker;
