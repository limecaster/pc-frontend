import { useState, useEffect } from "react";
import { hasStaffAccess } from "@/api/auth";

interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is logged in by looking for token and user data in localStorage
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);

                setUser(parsedUser);
                setIsStaff(hasStaffAccess(parsedUser.role));
                setIsAdmin(parsedUser.role === "admin");
            } catch (error) {
                console.error("Error parsing user data:", error);
                setUser(null);
                setIsStaff(false);
                setIsAdmin(false);
            }
        } else {
            setUser(null);
            setIsStaff(false);
            setIsAdmin(false);
        }

        setLoading(false);
    }, []);

    return { user, loading, isStaff, isAdmin };
}
