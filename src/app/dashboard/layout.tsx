import React, { ReactNode } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
