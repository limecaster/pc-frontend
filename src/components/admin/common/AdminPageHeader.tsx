import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
    href: string;
    label: string;
    icon?: React.ReactNode;
}

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    backButton?: BackButtonProps;
    actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    description,
    backButton,
    actions,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
                {backButton && (
                    <Link href={backButton.href} className="inline-block mb-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-sm"
                        >
                            {backButton.icon}
                            {backButton.label}
                        </Button>
                    </Link>
                )}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {actions && <div className="mt-4 md:mt-0">{actions}</div>}
        </div>
    );
};

export default AdminPageHeader;
