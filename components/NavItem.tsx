"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const settingsPath = `/store/${params.storeId}/settings`;

  const routes = [
    {
      href: `/store/${params.storeId}/onboard`,
      label: "Setup",
      active: pathname === `/store/${params.storeId}/onboard`,
    },
    {
      href: `/store/${params.storeId}`,
      label: "Overview",
      active: pathname === `/store/${params.storeId}`,
    },
    {
      href: `/store/${params.storeId}/billboards`,
      label: "Billboards",
      active: pathname === `/store/${params.storeId}/billboards`,
    },
    {
      href: `/store/${params.storeId}/categories`,
      label: "Categories",
      active: pathname === `/store/${params.storeId}/categories`,
    },
    {
      href: `/store/${params.storeId}/products`,
      label: "Products",
      active: pathname === `/store/${params.storeId}/products`,
    },
    {
      href: `/store/${params.storeId}/orders`,
      label: "Orders",
      active: pathname === `/store/${params.storeId}/orders`,
    },
    {
      href: `/store/${params.storeId}/customers`,
      label: "Customers",
      active: pathname === `/store/${params.storeId}/customers`,
    },
    {
      href: `/store/${params.storeId}/team`,
      label: "Team",
      active: pathname === `/store/${params.storeId}/team`,
    },
    {
      href: `/store/${params.storeId}/billing`,
      label: "Billing",
      active: pathname === `/store/${params.storeId}/billing`,
    },
    {
      href: settingsPath,
      label: "Settings",
      active: pathname.startsWith(settingsPath),
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
