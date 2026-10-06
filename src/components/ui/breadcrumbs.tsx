"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  React.useEffect(() => {
    // No-op: usePathname triggers re-render on route change
  }, [pathname]);

  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/dashboard" },
    ];

    let currentPath = "/dashboard";
    segments.forEach((segment) => {
      // Skip "dashboard" segment since it's the base path for Home
      if (segment === "dashboard") return;

      currentPath += `/${segment}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <nav
      className="flex items-center gap-1 text-sm"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1" role="list">
        {breadcrumbs.map((item, index) => (
          <li key={item.href || item.label} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            {index === 0 ? (
              <Link
                href={item.href as string}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ) : item.href && index < breadcrumbs.length - 1 ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium text-foreground",
                  index === breadcrumbs.length - 1 && "truncate max-w-[200px]"
                )}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}