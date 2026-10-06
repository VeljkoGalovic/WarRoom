"use client";

import * as React from "react";
import * as CommandPrimitives from "cmdk";
import { cn } from "@/lib/utils";

const Command = CommandPrimitives.Command;
const CommandDialog = CommandPrimitives.CommandDialog;
const CommandInput = CommandPrimitives.CommandInput;
const CommandList = CommandPrimitives.CommandList;
const CommandEmpty = CommandPrimitives.CommandEmpty;
const CommandGroup = CommandPrimitives.CommandGroup;
const CommandItem = CommandPrimitives.CommandItem;
const CommandSeparator = CommandPrimitives.CommandSeparator;
const CommandLoading = CommandPrimitives.CommandLoading;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandLoading,
};