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
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Initialize session with backend
    const initSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package_id: packageId, user_id: userId }),
        });
        const data = await res.json();
        setSessionId(data.session_id);
      } catch (err) {
        console.error("SCORM Init Error", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [packageId, userId]);

  useLayoutEffect(() => {
    if (!sessionId) return;

    // 2. Build the SCORM API adapter and attach it to the window object.
    // SCORM 1.2 requires an object named "API" to exist on the window or parent window.

    // @ts-ignore
    window.API = {
      LMSInitialize: function () {
        console.log("SCORM: LMSInitialize called");
        return "true";
      },
      LMSFinish: function () {
        console.log("SCORM: LMSFinish called");
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/finish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, cmi_key: "" }),
          keepalive: true
        });
        return "true";
      },
      LMSGetValue: function (cmi_key: string) {
        console.log("SCORM: LMSGetValue called for", cmi_key);
        // This should ideally be synchronous. In standard SCORM, this blocks.
        // We will mock the synchronous part or rely on a pre-fetched cache in a real app.
        // For MVP, we return a mock value immediately.
        if (cmi_key === "cmi.core.lesson_status") return "not attempted";
        if (cmi_key === "cmi.core.student_name") return "Student, Mock";
        return "";
      },
      LMSSetValue: function (cmi_key: string, cmi_value: string) {
        console.log("SCORM: LMSSetValue called for", cmi_key, "->", cmi_value);
        // Async save to backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/scorm/runtime/setvalue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, cmi_key, cmi_value }),
        });
        return "true";
      },
      LMSCommit: function () {
        console.log("SCORM: LMSCommit called");
        return "true";
      },
      LMSGetLastError: function () {
        return "0"; // No error
      },
      LMSGetErrorString: function () {
        return "No Error";
      },
      LMSGetDiagnostic: function () {
        return "";
      }
    };

    return () => {
      // Cleanup API on unmount
      // @ts-ignore
      delete window.API;
    };
  }, [sessionId]);

  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing your learning experience...</p>
      </div>
    );
  }

  let srcUrl = entryPointUrl;
  
  // If it's a Supabase URL, proxy it to bypass the Supabase CDN text/plain restriction for HTML files
  if (srcUrl && srcUrl.includes('supabase.co')) {
    const match = srcUrl.match(/public\/scorm\/(.+)/);
    if (match && match[1]) {
      srcUrl = `/api/scorm-cdn/${match[1]}`;
    }
  }

  // Add cache buster to bypass old text/plain cached responses
  srcUrl = srcUrl.includes('?') 
    ? `${srcUrl}&t=${Date.now()}` 
    : `${srcUrl}?t=${Date.now()}`;

  return (
    <div className="w-full relative bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-[900px]">
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
