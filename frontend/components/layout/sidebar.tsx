"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Home,
  LayoutDashboard, 
  Files, 
  GraduationCap, 
  Calendar, 
  Users, 
  Megaphone, 
  AppWindow, 
  Bot,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Learning", href: "/learning", icon: GraduationCap },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Apps", href: "/apps", icon: AppWindow },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-brand-teal-deep text-on-dark border-r border-hairline-dark overflow-y-auto transition-all duration-300 relative z-50",
        isCollapsed ? "w-16" : "w-64 absolute h-full shadow-2xl"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className={cn("flex h-16 items-center shrink-0 border-b border-white/10", isCollapsed ? "justify-center px-0" : "justify-between px-4")}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden w-full px-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-brand-green flex items-center justify-center">
              <span className="text-primary font-bold">M</span>
            </div>
            <span className="text-xl font-bold font-heading text-white tracking-tight whitespace-nowrap">Maple</span>
          </div>
        ) : (
          <div className="h-8 w-8 shrink-0 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-primary font-bold">M</span>
          </div>
        )}
      </div>
      <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-4")}>
        {sidebarLinks.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-md text-sm font-medium transition-colors",
                isCollapsed ? "justify-center h-10 w-10 mx-auto p-0" : "px-3 py-2 w-full",
                isActive
                  ? "bg-brand-teal text-brand-green"
                  : "text-slate-300 hover:bg-brand-teal-mid hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  !isCollapsed && "mr-3",
                  isActive ? "text-brand-green" : "text-slate-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-8">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-brand-green uppercase tracking-wider mb-2">
                Administration
              </h3>
            )}
            {isCollapsed && (
              <div className="mx-auto w-8 h-px bg-brand-green/30 mb-2 mt-4"></div>
            )}
            <div className="space-y-1">
              {[
                { name: "Admin Dashboard", href: "/admin/analytics", icon: LayoutDashboard },
                { name: "Users & Assignments", href: "/admin/users", icon: Users },
                { name: "Manage Documents", href: "/admin/documents", icon: Files },
                { name: "Manage Courses", href: "/admin/courses", icon: GraduationCap },
              ].map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center rounded-md text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center h-10 w-10 mx-auto p-0" : "px-3 py-2 w-full",
                      isActive
                        ? "bg-brand-green text-brand-teal-deep"
                        : "text-brand-teal-light hover:bg-brand-teal-mid hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        !isCollapsed && "mr-3",
                        isActive ? "text-brand-teal-deep" : "text-brand-teal-light group-hover:text-white"
                      )}
                      aria-hidden="true"
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
