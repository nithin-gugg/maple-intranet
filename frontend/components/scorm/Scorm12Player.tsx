"use client";

import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ScormPlayerProps {
  packageId: number;
  entryPointUrl: string;
  userId: string;
}

export default function Scorm12Player({ packageId, entryPointUrl, userId }: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Maintain standard CMI state locally to eliminate network bottlenecks during LMSGetValue
  const cmiStateRef = useRef<Record<string, string>>({});
  const dirtyKeysRef = useRef<Record<string, string>>({});
  const lastErrorRef = useRef<string>("0");

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
        console.error("SCORM Init Error", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [packageId, userId]);

  useLayoutEffect(() => {
    if (!attemptId) return;

    // 2. Build the SCORM API adapter and attach it to the window object.
    // SCORM 1.2 requires an object named "API" to exist on the window or parent window.
    
    const commitData = (isFinish: boolean = false) => {
      const keysToCommit = { ...dirtyKeysRef.current };
      if (Object.keys(keysToCommit).length === 0 && !isFinish) return;
      
      const endpoint = isFinish ? 'finish' : 'commit';
      
      console.log(`\n[TRACE 2] ---------------------------------------------`);
      console.log(`[TRACE 2] Before POST /api/v1/scorm/runtime/${endpoint}`);
      console.log(`[TRACE 2] dirty keys:`, Object.keys(keysToCommit));
      console.log(`[TRACE 2] complete CMI payload being sent:`, keysToCommit);
      console.log(`[TRACE 2] is cmi.core.lesson_status present?`, 'cmi.core.lesson_status' in keysToCommit);
      console.log(`[TRACE 2] value of cmi.core.lesson_status:`, keysToCommit['cmi.core.lesson_status']);
      console.log(`[TRACE 2] ---------------------------------------------\n`);

      // We use fetch with keepalive for unmount/finish scenarios to ensure it completes
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attemptId, cmi_data: keysToCommit }),
        keepalive: true
      }).then(() => {
        if (!isFinish) {
          console.log("[SCORM 1.2] 💾 State successfully flushed to LMS backend.");
        }
      }).catch(err => {
        console.error("[SCORM 1.2] 🚨 Failed to flush state to LMS backend:", err);
      });
      
      // Remove the exact keys we just batched from the dirty tracker
      for (const key of Object.keys(keysToCommit)) {
          delete dirtyKeysRef.current[key];
      }
    };

    // @ts-ignore
    window.API = {
      LMSInitialize: function (param: string) {
        console.log("\n[TRACE 1] 🟢 LMSInitialize() called by SCO");
        lastErrorRef.current = "0";
        return "true";
      },
      LMSFinish: function (param: string) {
        console.log("\n[TRACE 1] 🛑 LMSFinish() called by SCO");
        commitData(true);
        lastErrorRef.current = "0";
        return "true";
      },
      LMSGetValue: function (cmi_key: string) {
        // Fast, synchronous read from local pre-loaded state
        const val = cmiStateRef.current[cmi_key] !== undefined ? cmiStateRef.current[cmi_key] : "";
        
        if (cmi_key === 'cmi.core.lesson_status' || cmi_key === 'cmi.core.lesson_location' || cmi_key === 'cmi.suspend_data') {
            console.log(`[TRACE 1] 📖 LMSGetValue('${cmi_key}') -> '${cmi_key === "cmi.suspend_data" ? `[${val.length} chars]` : val}'`);
        }
        
        lastErrorRef.current = "0";
        return val;
      },
      LMSSetValue: function (cmi_key: string, cmi_value: string) {
        if (cmi_key === 'cmi.core.lesson_status' || cmi_key === 'cmi.core.lesson_location' || cmi_key === 'cmi.suspend_data') {
            console.log(`[TRACE 1] ✍️ LMSSetValue('${cmi_key}', '${cmi_key === "cmi.suspend_data" ? `[${cmi_value.length} chars]` : cmi_value}')`);
        }
        
        cmiStateRef.current[cmi_key] = cmi_value;
        dirtyKeysRef.current[cmi_key] = cmi_value;
        lastErrorRef.current = "0";
        return "true";
      },
      LMSCommit: function (param: string) {
        console.log("\n[TRACE 1] 💾 LMSCommit() called by SCO");
        commitData(false);
        lastErrorRef.current = "0";
        return "true";
      },
      LMSGetLastError: function () {
        return lastErrorRef.current; 
      },
      LMSGetErrorString: function (errorCode: string) {
        if (errorCode === "0") return "No error";
        if (errorCode === "101") return "General Exception";
        if (errorCode === "201") return "Invalid argument error";
        return "Unknown error";
      },
      LMSGetDiagnostic: function (errorCode: string) {
        return "Diagnostic info for code: " + errorCode;
      }
    };

    // Autosave every 15 seconds to prevent data loss
    const autosaveInterval = setInterval(() => {
      commitData(false);
    }, 15000);

    return () => {
      // Cleanup API and force a final commit on unmount
      commitData(true);
      clearInterval(autosaveInterval);
      // @ts-ignore
      delete window.API;
    };
  }, [attemptId]);

  const [iframeLoaded, setIframeLoaded] = useState(false);

  const srcUrl = React.useMemo(() => {
    let url = entryPointUrl;
    
    // If it's a Supabase URL, proxy it to bypass the Supabase CDN text/plain restriction for HTML files
    if (url && url.includes('supabase.co')) {
      const match = url.match(/public\/scorm\/(.+)/);
      if (match && match[1]) {
        url = `/api/scorm-cdn/${match[1]}`;
      }
    }

    // Add cache buster to bypass old text/plain cached responses
    return url.includes('?') 
      ? `${url}&t=${Date.now()}` 
      : `${url}?t=${Date.now()}`;
  }, [entryPointUrl]);

  if (!attemptId) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing your learning experience...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-full">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading course...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={srcUrl}
        onLoad={() => setIframeLoaded(true)}
        className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        title="SCORM Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
