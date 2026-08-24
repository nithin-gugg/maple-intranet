"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface XApiPlayerProps {
  packageId: number;
  entryPointUrl: string;
  userId: string;
}

export default function XApiPlayer({ packageId, entryPointUrl, userId }: XApiPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { getToken } = useAuth();
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
        
        const endpoint = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/xapi/`);
        
        const auth = encodeURIComponent(`Bearer ${token}`);
        
        const actor = encodeURIComponent(JSON.stringify({
          objectType: "Agent",
          account: {
            homePage: window.location.origin,
            name: userId
          }
        }));
        
        const activityId = encodeURIComponent(`${window.location.origin}/courses/${packageId}`);
        
        // 1. Initialize Attempt via API to get stable registration UUID
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/xapi/launch/init`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ package_id: packageId, user_id: userId }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to initialize xAPI session');
        }
        
        const data = await res.json();
        const registration = data.registration;

        const finalUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}endpoint=${endpoint}&auth=${auth}&actor=${actor}&registration=${registration}&activity_id=${activityId}`;
        
        setLaunchUrl(finalUrl);
      } catch (err) {
        console.error("Failed to generate xAPI launch URL", err);
      }
    };

    fetchLaunchParams();
  }, [packageId, userId, entryPointUrl, getToken]);

  if (!launchUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-canvas rounded-xl border border-hairline">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing xAPI environment...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white rounded-xl overflow-hidden border border-hairline shadow-subtle h-full">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading xAPI AU...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={launchUrl}
        onLoad={() => setIframeLoaded(true)}
        className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        title="xAPI Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
