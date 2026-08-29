"use client";

import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ScormPlayerProps {
  packageId: number;
  entryPointUrl: string;
  userId: string;
}

export default function Scorm2004Player({ packageId, entryPointUrl, userId }: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Maintain standard CMI state locally to eliminate network bottlenecks during GetValue
  const cmiStateRef = useRef<Record<string, string>>({});
  const dirtyKeysRef = useRef<Record<string, string>>({});

  useEffect(() => {
    // 1. Initialize session with backend and preload existing state
    const initSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package_id: packageId, user_id: userId }),
        });
        const data = await res.json();
        setAttemptId(data.attempt_id);
        cmiStateRef.current = data.cmi_data || {};
      } catch (err) {
        console.error("SCORM 2004 Init Error", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [packageId, userId]);

  useLayoutEffect(() => {
    if (!attemptId) return;

    // 2. Build the SCORM 2004 API adapter and attach it to the window object.
    
    const commitData = (isFinish: boolean = false) => {
      if (Object.keys(dirtyKeysRef.current).length === 0 && !isFinish) return;
      
      const keysToCommit = { ...dirtyKeysRef.current };
      const endpoint = isFinish ? 'finish' : 'commit';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/${endpoint}`;
      const payload = { attempt_id: attemptId, cmi_data: keysToCommit };

      if (!navigator.onLine) {
        console.warn("[SCORM 2004] 📴 Offline. Buffering commit to local storage.");
        import("@/lib/offlineQueue").then(({ OfflineQueue }) => {
          OfflineQueue.enqueue({
            url,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        });
      } else {
        // We use fetch with keepalive for unmount/finish scenarios to ensure it completes
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).then((res) => {
          if (!res.ok) throw new Error("Server responded with error");
          if (!isFinish) {
            console.log("[SCORM 2004] 💾 State successfully flushed to LMS backend.");
          }
        }).catch(err => {
          console.error("[SCORM 2004] 🚨 Failed to flush state to LMS backend. Buffering:", err);
          import("@/lib/offlineQueue").then(({ OfflineQueue }) => {
            OfflineQueue.enqueue({
              url,
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          });
        });
      }
      
      // Remove the exact keys we just batched from the dirty tracker
      for (const key of Object.keys(keysToCommit)) {
          delete dirtyKeysRef.current[key];
      }
    };

    // Initialize offline listeners
    import("@/lib/offlineQueue").then(({ OfflineQueue }) => {
       OfflineQueue.setupListeners();
    });

    // @ts-ignore
    window.API_1484_11 = {
      Initialize: function (param: string) {
        if (param !== "") return "false";
        console.log("SCORM 2004: Initialize called");
        return "true";
      },
      Terminate: function (param: string) {
        if (param !== "") return "false";
        console.log("SCORM 2004: Terminate called");
        commitData(true);
        return "true";
      },
      GetValue: function (cmi_key: string) {
        const val = cmiStateRef.current[cmi_key] !== undefined ? cmiStateRef.current[cmi_key] : "";
        console.log(`SCORM 2004: GetValue(${cmi_key}) -> ${val}`);
        return val;
      },
      SetValue: function (cmi_key: string, cmi_value: string) {
        console.log(`SCORM 2004: SetValue(${cmi_key}, ${cmi_value})`);
        cmiStateRef.current[cmi_key] = cmi_value;
        dirtyKeysRef.current[cmi_key] = cmi_value;
        return "true";
      },
      Commit: function (param: string) {
        if (param !== "") return "false";
        console.log("SCORM 2004: Commit called");
        commitData(false);
        return "true";
      },
      GetLastError: function () {
        return "0"; 
      },
      GetErrorString: function (errorCode: string) {
        return "No Error";
      },
      GetDiagnostic: function (errorCode: string) {
        return "";
      }
    };

    const autosaveInterval = setInterval(() => {
      commitData(false);
    }, 15000);

    return () => {
      commitData(true);
      clearInterval(autosaveInterval);
      // @ts-ignore
      delete window.API_1484_11;
    };
  }, [attemptId]);

  const [iframeLoaded, setIframeLoaded] = useState(false);

  const srcUrl = React.useMemo(() => {
    let url = entryPointUrl;
    
    if (url && url.includes('supabase.co')) {
      const match = url.match(/public\/scorm\/(.+)/);
      if (match && match[1]) {
        url = `/api/scorm-cdn/${match[1]}`;
      }
    }

    return url.includes('?') 
      ? `${url}&t=${Date.now()}` 
      : `${url}?t=${Date.now()}`;
  }, [entryPointUrl]);

  if (!attemptId) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing your SCORM 2004 experience...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-full">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading SCORM 2004 course...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={srcUrl}
        onLoad={() => setIframeLoaded(true)}
        className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        title="SCORM 2004 Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
