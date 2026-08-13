"use client";

import { useEffect, useRef, useState } from "react";
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scorm/runtime/initialize`, {
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

  useEffect(() => {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scorm/runtime/finish`, {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scorm/runtime/setvalue`, {
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

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Initializing Learning Environment...</p>
      </div>
    );
  }

  // Use the proxied URL directly so Next.js rewrites it
  const srcUrl = entryPointUrl;

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-[900px]">
      <iframe
        ref={iframeRef}
        src={srcUrl}
        className="w-full h-full border-none"
        title="SCORM Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
