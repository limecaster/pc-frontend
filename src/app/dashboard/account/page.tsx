import React, { useEffect } from "react";
import AccountPage from "@/components/dashboard/account/AccountPage";

const AccountDashboard = () => {
    useEffect(() => {
        document.title = "Tài khoản | B Store";
    }, []);
    return <AccountPage />;
};

export default AccountDashboard;
