"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "./PasswordChangeForm";
import AddressManager from "./AddressManager";

const AccountPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Thông tin tài khoản
            </h1>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="profile" className="text-sm">
                        Thông tin cá nhân
                    </TabsTrigger>
                    <TabsTrigger value="password" className="text-sm">
                        Đổi mật khẩu
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="text-sm">
                        Địa chỉ giao hàng
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileForm />
                </TabsContent>

                <TabsContent value="password">
                    <PasswordChangeForm />
                </TabsContent>

                <TabsContent value="addresses">
                    <AddressManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AccountPage;
