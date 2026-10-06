"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <TopNav />
        <div className="px-4 lg:px-8 py-4 border-b">
          <Breadcrumbs />
        </div>
        <main className="p-4 lg:p-8 pt-4">{children}</main>
      </div>
    </div>
  );
}