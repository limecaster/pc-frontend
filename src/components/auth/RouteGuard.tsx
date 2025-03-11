"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface RouteGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({
    children,
    allowedRoles = [],
}) => {
    const { isAuthenticated, isLoading, checkUserRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState<boolean>(false);

    useEffect(() => {
        // Check authorization
        const checkAuth = () => {
            // If not authenticated and not on login page, redirect to login
            if (!isLoading) {
                if (!isAuthenticated && pathname !== "/authenticate") {
                    setAuthorized(false);
                    router.push("/authenticate");
                    return;
                }

                // If authenticated but trying to access login page, redirect based on role
                if (isAuthenticated && pathname === "/authenticate") {
                    const userRole = checkUserRole();

                    if (userRole === "admin") {
                        router.push("/admin/dashboard");
                    } else if (userRole === "staff") {
                        router.push("/staff/dashboard");
                    } else {
                        router.push("/profile"); // Default redirect for customers
                    }
                    return;
                }

                // If authenticated and specific roles are required, check role
                if (isAuthenticated && allowedRoles.length > 0) {
                    const userRole = checkUserRole();

                    if (!userRole || !allowedRoles.includes(userRole)) {
                        setAuthorized(false);

                        // Redirect based on role
                        if (userRole === "admin") {
                            router.push("/admin/dashboard");
                        } else if (userRole === "staff") {
                            router.push("/staff/dashboard");
                        } else {
                            router.push("/"); // Redirect to home for customers
                        }
                        return;
                    }
                }

                // If all checks pass, authorize access
                setAuthorized(true);
            }
        };

        checkAuth();
    }, [
        isLoading,
        isAuthenticated,
        pathname,
        router,
        checkUserRole,
        allowedRoles,
    ]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    // Render children only if authorized
    return authorized ? <>{children}</> : null;
};

export default RouteGuard;
