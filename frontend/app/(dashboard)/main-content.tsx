"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayer = pathname.match(/^\/learning\/\d+/);

  return (
    <main className={cn(
      "flex-1 overflow-y-auto",
      !isPlayer && "p-6 md:p-8"
    )}>
      <div className={cn(
        "mx-auto",
        !isPlayer && "max-w-7xl",
        isPlayer && "h-full flex flex-col"
      )}>
        {children}
      </div>
    </main>
  );
}
