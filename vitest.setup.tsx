import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cn } from '@/lib/utils';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LayoutDashboard: () => <svg data-testid="icon-layout-dashboard" />,
  Database: () => <svg data-testid="icon-database" />,
  Users: () => <svg data-testid="icon-users" />,
  FileText: () => <svg data-testid="icon-file-text" />,
  Settings: () => <svg data-testid="icon-settings" />,
  LogOut: () => <svg data-testid="icon-log-out" />,
  Menu: () => <svg data-testid="icon-menu" />,
  X: () => <svg data-testid="icon-x" />,
  ChevronLeft: () => <svg data-testid="icon-chevron-left" />,
  ChevronRight: () => <svg data-testid="icon-chevron-right" />,
  ChevronDown: () => <svg data-testid="icon-chevron-down" />,
  Search: () => <svg data-testid="icon-search" />,
  Bell: () => <svg data-testid="icon-bell" />,
  Sun: () => <svg data-testid="icon-sun" />,
  Moon: () => <svg data-testid="icon-moon" />,
  Plus: () => <svg data-testid="icon-plus" />,
  ArrowRight: () => <svg data-testid="icon-arrow-right" />,
  Activity: () => <svg data-testid="icon-activity" />,
  Target: () => <svg data-testid="icon-target" />,
  Zap: () => <svg data-testid="icon-zap" />,
  Shield: () => <svg data-testid="icon-shield" />,
  Command: () => <svg data-testid="icon-command" />,
  Home: () => <svg data-testid="icon-home" />,
  Loader2: () => <svg data-testid="icon-loader-2" />,
  Key: () => <svg data-testid="icon-key" />,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => {
  // Store the onOpenChange callback
  let onOpenChange: ((open: boolean) => void) | undefined;

  return {
    Root: ({ children, open, onOpenChange: callback }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
      onOpenChange = callback;
      return (
        <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'}>
          {children}
        </div>
      );
    },
    Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
      <button data-testid="dialog-trigger" {...props}>
        {children}
      </button>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
    Close: ({ children, ...props }: { children?: React.ReactNode }) => (
      <button data-testid="dialog-close" onClick={() => onOpenChange?.(false)} {...props}>
        {children}
      </button>
    ),
    Overlay: ({ children, ...props }: { children?: React.ReactNode }) => <div data-testid="dialog-overlay" {...props}>{children}</div>,
    Content: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-content" role="dialog" className={className} {...props}>
        {children}
        {/* Built-in close button from DialogContent */}
        <button
          data-testid="dialog-close"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => onOpenChange?.(false)}
        >
          <svg data-testid="icon-x" className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    ),
    Title: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
      <h2 data-testid="dialog-title" className={className} {...props}>
        {children}
      </h2>
    ),
    Description: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
      <p data-testid="dialog-description" className={className} {...props}>
        {children}
      </p>
    ),
  };
});

// Mock Radix UI Dropdown Menu components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dropdown-menu-root" data-state={open ? 'open' : 'closed'}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="dropdown-menu-trigger" {...props}>
      {children}
    </button>
  ),
  Group: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-group">{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-portal">{children}</div>,
  Sub: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-sub">{children}</div>,
  RadioGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-radio-group">{children}</div>,
  SubTrigger: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-sub-trigger" className={className} {...props}>
      {children}
    </div>
  ),
  SubContent: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-sub-content" className={className} {...props}>
      {children}
    </div>
  ),
  Content: ({ children, className, sideOffset, ...props }: { children?: React.ReactNode; className?: string; sideOffset?: number }) => (
    <div data-testid="dropdown-menu-content" role="menu" data-side-offset={sideOffset} className={className} {...props}>
      {children}
    </div>
  ),
  Item: ({ children, disabled, inset, className, ...props }: { children?: React.ReactNode; disabled?: boolean; inset?: boolean; className?: string }) => (
    <div data-testid="dropdown-menu-item" role="menuitem" data-disabled={disabled} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({ children, checked, className, ...props }: { children?: React.ReactNode; checked?: boolean; className?: string }) => (
    <div data-testid="dropdown-menu-checkbox-item" role="menuitemcheckbox" aria-checked={checked} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      {children}
    </div>
  ),
  RadioItem: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-radio-item" role="menuitemradio" className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      {children}
    </div>
  ),
  Label: ({ children, inset, className, ...props }: { children?: React.ReactNode; inset?: boolean; className?: string }) => (
    <div data-testid="dropdown-menu-label" role="group" className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props}>
      {children}
    </div>
  ),
  Separator: ({ className, ...props }: { className?: string }) => (
    <div data-testid="dropdown-menu-separator" role="separator" className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span data-testid="dropdown-menu-item-indicator">{children}</span>,
}));

// Mock Radix UI Slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children }: { children: React.ReactNode }) => <div data-testid="slot">{children}</div>,
}));

// Mock Radix UI Toast
vi.mock('@radix-ui/react-toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
  Toast: ({ children }: { children: React.ReactNode }) => <div data-testid="toast">{children}</div>,
  ToastTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-title">{children}</div>,
  ToastDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-description">{children}</div>,
  ToastClose: () => <button data-testid="toast-close" />,
  ToastViewport: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-viewport">{children}</div>,
}));

// Mock cmdk
vi.mock('cmdk', async () => {
  // Import React dynamically
  const React = await import('react');
  return {
    Command: ({ children, value, onValueChange, ...props }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }) => (
      <div data-testid="command" {...props}>
        {React.Children.map(children, (child: any) => {
          if (!React.isValidElement(child)) return child;
          // Pass value and onValueChange to CommandInput
          if (child.type && typeof child.type === 'function' && child.type.displayName === 'CommandInput') {
            return React.cloneElement(child, { value, onValueChange });
          }
          return child;
        })}
      </div>
    ),
    CommandDialog: ({ children }: { children: React.ReactNode }) => <div data-testid="command-dialog">{children}</div>,
    CommandInput: ({ children, value, onValueChange, ...props }: { children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void }) => (
      <input data-testid="command-input" value={value} onChange={(e) => onValueChange?.(e.target.value)} {...props} />
    ),
    CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
    CommandGroup: ({ children, heading }: { children: React.ReactNode; heading?: string }) => (
      <div data-testid="command-group">
        {heading && <div data-testid="command-group-heading">{heading}</div>}
        {children}
      </div>
    ),
    CommandItem: ({ children, onSelect, ...props }: { children: React.ReactNode; onSelect?: () => void }) => (
      <div data-testid="command-item" onClick={onSelect} {...props}>{children}</div>
    ),
    CommandSeparator: () => <div data-testid="command-separator" />,
    CommandShortcut: ({ children }: { children: React.ReactNode }) => <span data-testid="command-shortcut">{children}</span>,
    CommandLoading: () => <div data-testid="command-loading" />,
  };
});

// Suppress console.error in tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});