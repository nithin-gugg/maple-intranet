"use client";

import { UserButton } from "@clerk/nextjs";
import { Search, Bell, HelpCircle } from "lucide-react";

import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  if (pathname.match(/^\/learning\/\d+/)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-border bg-canvas items-center justify-between px-6 shadow-sm">
      <div className="flex flex-1 items-center">
        {/* Search */}
        <div className="relative w-full max-w-md flex items-center text-muted-foreground">
          <Search className="absolute left-3 h-5 w-5" />
          <input
            type="text"
            placeholder="Search documents, people, courses..."
            className="h-11 w-full rounded-md border border-input bg-surface pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2"></div>

        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9"
            }
          }}
        />
      </div>
    </div>
  );
}
