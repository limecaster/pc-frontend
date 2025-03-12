"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

interface FooterContextType {
    footerRef: React.RefObject<HTMLElement | null>;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export const FooterProvider = ({ children }: { children: ReactNode }) => {
    const footerRef = useRef<HTMLElement>(null);

    return (
        <FooterContext.Provider value={{ footerRef }}>
            {children}
        </FooterContext.Provider>
    );
};

export const useFooter = (): FooterContextType => {
    const context = useContext(FooterContext);
    if (context === undefined) {
        throw new Error("useFooter must be used within a FooterProvider");
    }
    return context;
};
