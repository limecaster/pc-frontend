import React, { createContext, useState, useContext } from "react";

interface StaffSidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const StaffSidebarContext = createContext<StaffSidebarContextType | undefined>(
    undefined,
);

export const StaffSidebarProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <StaffSidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </StaffSidebarContext.Provider>
    );
};

export const useStaffSidebar = () => {
    const context = useContext(StaffSidebarContext);
    if (context === undefined) {
        throw new Error(
            "useStaffSidebar must be used within a StaffSidebarProvider",
        );
    }
    return context;
};
