"use client";
import React, { useEffect } from 'react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard - B Store';
  }, []);

  return <DashboardOverview />;
};

export default Dashboard;
