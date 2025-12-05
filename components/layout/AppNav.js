"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Badge } from "../primitives/Badge";

const navLinks = [
  { href: "/app", label: "Overview" },
  { href: "/app/profile", label: "Profile" },
  { href: "/app/portfolio", label: "Portfolio Builder" },
  { href: "/app/resume", label: "Resume Intelligence" },
  { href: "/app/dashboards", label: "Dashboards" },
  { href: "/app/files", label: "Files" },
  { href: "/app/support", label: "Support AI" },
  { href: "/app/agent", label: "Agents" },
  { href: "/app/templates", label: "Templates" },
  { href: "/app/public", label: "Public Catalog" },
  { href: "/app/billing", label: "Billing" },
];

const AppNav = ({ isAdmin }) => {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
            pathname === link.href
              ? "bg-white/5 text-white shadow-glow"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <span>{link.label}</span>
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/app/admin"
          className={clsx(
            "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
            pathname === "/app/admin"
              ? "bg-white/5 text-white shadow-glow"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <span>Admin Console</span>
          <Badge tone="warn">root</Badge>
        </Link>
      )}
    </nav>
  );
};

export default AppNav;
