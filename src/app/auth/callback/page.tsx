"use client";
import React, { Suspense } from "react";
import AuthCallback from "./AuthCallbackContent";

const AuthCallbackPage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-white">
                    Loading...
                </div>
            }
        >
            <AuthCallback />
        </Suspense>
    );
};

export default AuthCallbackPage;
