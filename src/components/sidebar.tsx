"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import {
  Users,
  BookOpen,
  Upload,
  UserCheck,
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
} from "lucide-react";

const adminLinks = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/professors", label: "Professors", icon: UserCheck },
  { href: "/dashboard/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/admin/groups", label: "Groups", icon: FolderOpen },
  { href: "/dashboard/admin/import", label: "Import Data", icon: Upload },
];

const professorLinks = [
  { href: "/dashboard/professor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/professor/courses", label: "Courses", icon: BookOpen },
];

const studentLinks = [
  { href: "/dashboard/student", label: "My Group", icon: Users },
  { href: "/dashboard/student/evaluations", label: "My Evaluations", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  if (!user) return null;

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "PROFESSOR"
        ? professorLinks
        : studentLinks;

  return (
    <aside className="hidden w-56 shrink-0 bg-ie-navy md:block">
      <nav className="flex flex-col gap-0.5 p-3">
        {links.map((link) => {
          const isActive =
            link.href === pathname ||
            (link.href !== "/dashboard/admin" &&
              link.href !== "/dashboard/professor" &&
              link.href !== "/dashboard/student" &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium tracking-wide transition-colors",
                isActive
                  ? "bg-ie-blue text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
