import React from "react";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@radix-ui/react-icons";

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface AdminBreadcrumbProps {
    items: BreadcrumbItem[];
}

const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index === 0 ? (
                            <Link
                                href={item.href}
                                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary"
                            >
                                <HomeIcon className="w-4 h-4 mr-2" />
                                {item.label}
                            </Link>
                        ) : (
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                <Link
                                    href={item.href}
                                    className="ml-1 text-sm font-medium text-gray-600 hover:text-primary md:ml-2"
                                >
                                    {item.label}
                                </Link>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default AdminBreadcrumb;
