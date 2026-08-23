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
        
        // As per xAPI Launch Guidelines, provide endpoint, auth, and actor via URL parameters
        // The auth string for Basic Auth or Bearer token
        const auth = encodeURIComponent(`Bearer ${token}`);
        
        const actor = encodeURIComponent(JSON.stringify({
          objectType: "Agent",
          account: {
            homePage: window.location.origin,
            name: userId
          }
        }));
        
        const activityId = encodeURIComponent(`${window.location.origin}/courses/${packageId}`);
        
        // Generate a deterministic UUID based on userId and packageId to ensure state resumes across sessions
        const generateDeterministicUUID = (str: string) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          let hex = Math.abs(hash).toString(16);
          while (hex.length < 32) {
            hex += (Math.abs(hash * 31).toString(16));
          }
          hex = hex.substring(0, 32);
          return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
        };
        
        const registration = generateDeterministicUUID(`${userId}-${packageId}`);

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
