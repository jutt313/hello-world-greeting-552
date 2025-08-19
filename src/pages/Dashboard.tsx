
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCards from "@/components/dashboard/MetricCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import LLMProvidersSection from "@/components/llm/LLMProvidersSection";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col relative z-10">
            <DashboardHeader />
            
            <main className="flex-1 p-6 space-y-8 overflow-auto">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-400">
                  Welcome back! Here's an overview of your CodeXI projects.
                </p>
              </div>

              <MetricCards />
              <ChartsSection />
              <LLMProvidersSection />
              <ProjectsTable />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
