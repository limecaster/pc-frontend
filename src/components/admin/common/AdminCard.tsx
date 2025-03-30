import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <Card className={cn("shadow-sm", className)} {...props}>
            {children}
        </Card>
    );
};

export default AdminCard;
