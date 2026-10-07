"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Users,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "OVERVIEW", href: "/dashboard", icon: LayoutDashboard },
  { name: "GOALS", href: "/dashboard/goals", icon: Target },
  { name: "COMMAND STAFF", href: "/dashboard/team", icon: Users },
  { name: "WAR MAP", href: "/dashboard/warmap", icon: Map },
  { name: "SETTINGS", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-card-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="font-mono text-tactical-xl text-primary tracking-widest">
            WAR ROOM
          </Link>
        )}
        <button
          onClick={() => onCollapseChange(!isCollapsed)}
          className="h-8 w-8 rounded-lg text-foreground-muted hover:text-primary hover:bg-accent transition-all duration-150"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-mono uppercase tracking-wider transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-foreground-muted hover:bg-accent hover:text-foreground hover:border-l-2 hover:border-hud-border-active"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-card-border">
        {!isCollapsed && (
          <div className="text-timestamp text-center">
            <p>WAR ROOM v1.0.0</p>
            <p className="text-foreground-muted">TACTICAL COMMAND INTERFACE</p>
          </div>
        )}
      </div>
    </aside>
  );
}