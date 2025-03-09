"use client";
import React, { Suspense } from "react";
import AuthenticateContent from "./AuthenticateContent";

const AuthenticatePage: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
            <AuthenticateContent />
        </Suspense>
    );
};

export default AuthenticatePage;
