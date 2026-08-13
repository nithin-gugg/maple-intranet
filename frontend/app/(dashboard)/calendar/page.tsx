"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the Calendar wrapper with SSR disabled 
// so that FullCalendar plugins don't cause constructor errors during SSR.
const CalendarWidget = dynamic(() => import("@/components/CalendarWidget"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[700px]">
      <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
    </div>
  )
});

export default function CalendarPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-display-lg font-heading tracking-tight text-ink">Company Calendar</h1>
        <p className="mt-2 text-subtitle text-slate-500">View upcoming company events and team schedules.</p>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm p-4 lg:p-6 overflow-hidden">
        <CalendarWidget />
      </div>
    </div>
  );
}
