
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import DashboardContent from '@/components/dashboard/Dashboard';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
