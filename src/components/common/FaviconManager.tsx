"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { getFavicon } from "@/api/logo";

// Default favicon as fallback
const DEFAULT_FAVICON = "/logo.png";

const FaviconManager = () => {
    const [faviconUrl, setFaviconUrl] = useState<string>(DEFAULT_FAVICON);

    useEffect(() => {
        const loadFavicon = async () => {
            try {
                const favicon = await getFavicon();
                if (favicon && favicon.imageUrl) {
                    setFaviconUrl(favicon.imageUrl);
                }
            } catch (error) {
                console.error("Error loading favicon:", error);
                // Keep using the default favicon on error
            }
        };

        loadFavicon();
    }, []);

    return (
        <Head>
            <link rel="icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
        </Head>
    );
};

export default FaviconManager;
