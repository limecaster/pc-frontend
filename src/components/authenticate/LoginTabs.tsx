import React from "react";

interface LoginTabsProps {
    activeTab: "login" | "register";
    onTabChange: (tab: "login" | "register") => void;
}

export const LoginTabs: React.FC<LoginTabsProps> = ({
    activeTab,
    onTabChange,
}) => {
    return (
        <nav className="flex z-10 items-start self-stretch text-xl font-semibold leading-snug text-center">
            <button
                onClick={() => onTabChange("login")}
                className={`gap-2.5 py-4 w-[212px] ${
                    activeTab === "login"
                        ? "bg-white shadow-sm text-zinc-900 border-b-2 border-primary"
                        : "text-slate-400"
                }`}
            >
                Đăng nhập
            </button>
            <button
                onClick={() => onTabChange("register")}
                className={`gap-2.5 py-4 w-[212px] ${
                    activeTab === "register"
                        ? "bg-white shadow-sm text-zinc-900 border-b-2 border-primary"
                        : "text-slate-400"
                }`}
            >
                Đăng ký
            </button>
        </nav>
    );
};
