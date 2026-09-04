"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayer = pathname.match(/^\/learning\/\d+/);
  const isDocument = pathname.startsWith('/documents');
  const isFullHeight = isPlayer || isDocument;

  return (
    <main className={cn(
      "flex-1 overflow-y-auto",
      !isFullHeight && "p-6 md:p-8"
    )}>
      <div className={cn(
        "mx-auto",
        !isFullHeight && "max-w-7xl",
        isFullHeight && "h-full flex flex-col"
      )}>
        {children}
      </div>
    </main>
  );
}
