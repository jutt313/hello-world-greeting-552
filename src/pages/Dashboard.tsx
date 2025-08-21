
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import DashboardContent from '@/components/dashboard/Dashboard';
import { CLISection } from '@/components/dashboard/CLISection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Terminal, Users, Settings } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="cli" className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  CLI Terminal
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <DashboardContent />
              </TabsContent>

              <TabsContent value="cli" className="space-y-6">
                <CLISection />
              </TabsContent>

              <TabsContent value="agents" className="space-y-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Agents Management</h3>
                  <p className="text-muted-foreground">Agent management interface coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">Settings interface coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
