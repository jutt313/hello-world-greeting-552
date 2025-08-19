
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  FolderOpen,
  MessageSquare,
  Settings,
  Bot,
  BarChart3,
  Users,
  FileText,
  Terminal,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Projects",
    icon: FolderOpen,
    url: "/projects",
  },
  {
    title: "Chat Sessions",
    icon: MessageSquare,
    url: "/chat",
  },
  {
    title: "LLM Providers",
    icon: Bot,
    url: "/llm-providers",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "Team",
    icon: Users,
    url: "/team",
  },
];

const toolsItems = [
  {
    title: "CLI Setup",
    icon: Terminal,
    url: "/cli-setup",
  },
  {
    title: "Documentation",
    icon: FileText,
    url: "/docs",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CX</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            CodeXI
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-slate-400">
          CodeXI Platform v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
