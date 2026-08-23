"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Cmi5PlayerProps {
  packageId: number;
  entryPointUrl: string;
  userId: string;
}

export default function Cmi5Player({ packageId, entryPointUrl, userId }: Cmi5PlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { getToken } = useAuth();
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaunchParams = async () => {
      try {
        const token = await getToken();
        
        let baseUrl = entryPointUrl;
        if (baseUrl && baseUrl.includes('supabase.co')) {
          const match = baseUrl.match(/public\/scorm\/(.+)/);
          if (match && match[1]) {
            baseUrl = `/api/scorm-cdn/${match[1]}`;
          }
        }
        
        // 1. Initialize session and get registration UUID and AU ID
        const initRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/cmi5/initialize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package_id: packageId, user_id: userId }),
        });
        
        const initData = await initRes.json();
        if (!initRes.ok) {
            throw new Error(initData.detail || "Failed to initialize CMI5 session.");
        }
        
        const registration = initData.registration_id;
        const au_id = initData.au_id;
        
        const endpoint = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/xapi/`);
        
        // 2. Build the fetch URL the AU will use to get its auth token
        const fetchUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/cmi5/fetch?registration=${registration}&au=${encodeURIComponent(au_id)}`);
        
        const actor = encodeURIComponent(JSON.stringify({
          objectType: "Agent",
          account: {
            homePage: window.location.origin,
            name: userId
          }
        }));
        
        // CMI5 spec requires the activityId to be the AU's IRI identifier
        const activityId = encodeURIComponent(au_id);

        const finalUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}endpoint=${endpoint}&fetch=${fetchUrl}&actor=${actor}&registration=${registration}&activityId=${activityId}`;
        
        setLaunchUrl(finalUrl);
      } catch (err: any) {
        console.error("Failed to generate cmi5 launch URL", err);
        setError(err.message || "Failed to initialize course environment.");
      }
    };

    fetchLaunchParams();
  }, [packageId, userId, entryPointUrl, getToken]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-red-500 mt-2">Please try re-uploading this course if it was added before the system update.</p>
      </div>
    );
  }

  if (!launchUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing cmi5 environment...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-full">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading cmi5 AU...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={launchUrl}
        onLoad={() => setIframeLoaded(true)}
        className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        title="cmi5 Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
