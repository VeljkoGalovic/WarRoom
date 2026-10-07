"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Search, Target, Users, Map, Zap, Shield, Cpu, Radio, Sparkles, Plus, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "COMMAND OVERVIEW", href: "/dashboard", icon: TrendingUp, shortcut: "⌘1" },
  { name: "TACTICAL GOALS", href: "/dashboard/goals", icon: Target, shortcut: "⌘2" },
  { name: "AI COMMAND STAFF", href: "/dashboard/team", icon: Users, shortcut: "⌘3" },
  { name: "WAR MAP", href: "/dashboard/warmap", icon: Map, shortcut: "⌘4" },
];

const actionItems = [
  { name: "NEW MILESTONE", description: "Add a daily micro-task to active campaign", icon: Plus, shortcut: "⌘M", href: "/dashboard/goals" },
  { name: "DISPATCH TO GENERAL VANCE", description: "Request strategic assessment", icon: Zap, shortcut: "⌘G", href: "/dashboard/team" },
  { name: "TASK SPECIALIST NOVA", description: "Deploy coding operation", icon: Cpu, shortcut: "⌘N", href: "/dashboard/team" },
  { name: "QUERY LIEUTENANT MERCURY", description: "Request intelligence briefing", icon: Radio, shortcut: "⌘I", href: "/dashboard/team" },
  { name: "REPORT TO SERGEANT HAMMER", description: "Daily accountability check-in", icon: Shield, shortcut: "⌘H", href: "/dashboard/team" },
  { name: "MESSAGE CAPTAIN KELSO", description: "Logistics & operations query", icon: MessageSquare, shortcut: "⌘L", href: "/dashboard/team" },
  { name: "TOGGLE MILESTONE", description: "Quick complete/uncomplete active task", icon: CheckCircle, shortcut: "⌘T", href: "/dashboard/goals" },
  { name: "NEW CAMPAIGN", description: "Create new strategic objective", icon: Target, shortcut: "⌘C", href: "/dashboard/goals" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
        data-testid="backdrop"
      />
      <Command className="w-full max-w-md">
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={(value) => setSearch(value)}
          autoFocus
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape") onClose();
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </CommandInput>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="NAVIGATION">
            {navigationItems
              .filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <CommandItem
                  key={item.name}
                  onSelect={() => {
                    onClose();
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2 w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-tactical text-xs font-mono">{item.name}</span>
                    <span className="ml-auto text-xs text-foreground-muted">{item.shortcut}</span>
                  </Link>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="TACTICAL ACTIONS">
            {actionItems
              .filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <CommandItem
                  key={item.name}
                  onSelect={() => {
                    onClose();
                  }}
                >
                  <Link
                    href={item.href || "#"}
                    onClick={onClose}
                    className="flex items-center gap-2 w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <p className="text-tactical text-xs font-mono text-primary">{item.name}</p>
                      <p className="text-timestamp text-foreground-muted text-[0.6rem]">{item.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-foreground-muted">{item.shortcut}</span>
                  </Link>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}