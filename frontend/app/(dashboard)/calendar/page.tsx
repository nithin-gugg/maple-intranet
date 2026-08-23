"use client";

import dynamic from "next/dynamic";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

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
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      const token = await getToken();
      setUserToken(token);
         try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/v1/auth/google/status?user_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsConnected(data.is_connected);
        }
      } catch (err) {
        console.error("Failed to check google status", err);
      }
    };
    checkStatus();
  }, [user, getToken]);

  const handleConnectGoogle = () => {
    if (!user) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/v1/auth/google/login?user_id=${user.id}`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-lg font-heading tracking-tight text-ink">Company Calendar</h1>
          <p className="mt-2 text-subtitle text-slate-500">View upcoming company events and team schedules.</p>
        </div>

        <button
          onClick={handleConnectGoogle}
          disabled={isConnected}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium text-sm"
        >
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-brand-green rounded-full"></div>
              Google Workspace Connected
            </>
          ) : (
            <>
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              Connect Google Workspace
            </>
          )}
        </button>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm p-4 lg:p-6 overflow-hidden">
        <CalendarWidget isGoogleConnected={isConnected} userToken={userToken} />
      </div>
    </div>
  );
}
