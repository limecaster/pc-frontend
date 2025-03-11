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

const roboto = Roboto({
    subsets: ["vietnamese"],
    weight: ["100", "300", "400", "500", "700", "900"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${roboto.className}`}>
                <Providers>
                    <WishlistProvider>
                        <CheckoutProvider>
                            <AuthProvider>
                                <Header />
                                <Navigation />
                                <Breadcrumb />
                                {children}
                                <Footer />
                                <Chatbot />
                                <Toaster position="top-center" />
                            </AuthProvider>
                        </CheckoutProvider>
                    </WishlistProvider>
                </Providers>
            </body>
        </html>
    );
}
