"use client";

import "../styles/globals.css";
import Navigation from "@/components/layout/Navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chatbot/ChatBot";
import { Toaster } from "react-hot-toast";
import { Roboto } from "next/font/google";
import { Providers } from "./providers";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FooterProvider } from "@/contexts/FooterContext";
import { usePathname, useRouter } from "next/navigation";
import FaviconManager from "@/components/common/FaviconManager";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { initSessionTracking } from "@/api/events";

const roboto = Roboto({
    subsets: ["vietnamese"],
    weight: ["100", "300", "400", "500", "700", "900"],
});

function CustomerRouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Exclude auth pages and admin/staff pages from the check
    const isExcludedPath =
        pathname?.startsWith("/authenticate") ||
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/staff");

    useEffect(() => {
        if (isLoading || isExcludedPath) return;

        // If user is admin or staff, redirect them to their dashboard
        if (user && (user.role === "admin" || user.role === "staff")) {
            const redirectPath =
                user.role === "admin" ? "/admin/dashboard" : "/staff";
            router.push(redirectPath);
        }
    }, [user, isLoading, router, isExcludedPath]);

    if (isLoading || isExcludedPath) {
        return <>{children}</>;
    }

    // If user is admin/staff, show nothing until redirect happens
    if (user && (user.role === "admin" || user.role === "staff")) {
        return null;
    }

    return <>{children}</>;
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check if the current path is in the admin section
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");
    const isStaffPage = pathname?.startsWith("/staff");
    const isNotCustomerPage = isAdminPage || isStaffPage;

    useEffect(() => {
        // Initialize session tracking for all users (guests and authenticated)
        initSessionTracking();
    }, []);

    return (
        <html lang="vi">
            <body
                className={`${roboto.className} antialiased bg-gray-50 text-gray-800`}
            >
                {/* Add the FaviconManager to manage the favicon */}
                <FaviconManager />

                <Providers>
                    <WishlistProvider>
                        <CheckoutProvider>
                            <AuthProvider>
                                <FooterProvider>
                                    <CustomerRouteGuard>
                                        {!isNotCustomerPage && (
                                            <>
                                                <Header />
                                                <Navigation />
                                                <Breadcrumb />
                                            </>
                                        )}
                                        {children}
                                        {!isNotCustomerPage && <Footer />}
                                        {!isNotCustomerPage && <Chatbot />}
                                        {!isNotCustomerPage && (
                                            <Toaster position="top-center" />
                                        )}
                                    </CustomerRouteGuard>
                                </FooterProvider>
                            </AuthProvider>
                        </CheckoutProvider>
                    </WishlistProvider>
                </Providers>
            </body>
        </html>
    );
}
