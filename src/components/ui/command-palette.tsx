"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Search, LayoutDashboard, Database, Users, FileText, Settings, Key, Bell } from "lucide-react";
import Link from "next/link";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
  { name: "Resources", href: "/dashboard/resources", icon: Database, shortcut: "⌘2" },
  { name: "Team", href: "/dashboard/team", icon: Users, shortcut: "⌘3" },
  { name: "Reports", href: "/dashboard/reports", icon: FileText, shortcut: "⌘4" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, shortcut: "⌘5" },
];

const actionItems = [
  { name: "New Task", href: "/dashboard/tasks/new", icon: Key, shortcut: "⌘N" },
  { name: "Invite Member", href: "/dashboard/team/invite", icon: Users, shortcut: "⌘I" },
  { name: "Create Report", href: "/dashboard/reports/new", icon: FileText, shortcut: "⌘R" },
  { name: "API Keys", href: "/dashboard/settings/api-keys", icon: Key, shortcut: "⌘K" },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, shortcut: "⌘B" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
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
          <CommandGroup heading="Navigation">
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
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>
                  </Link>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            {actionItems
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
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>
                  </Link>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}