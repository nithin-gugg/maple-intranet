"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Maximize, Minimize } from "lucide-react";
import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/${id}`);
        if (!res.ok) throw new Error("Document not found");
        const data = await res.json();
        setDoc(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-green" /></div>;
  }

  if (!doc) {
    return <div className="p-12 text-center text-slate-500">Document not found or you don't have access.</div>;
  }

  return (
    <div className={cn("flex flex-col h-[calc(100vh-6rem)]", isFullscreen && "fixed inset-0 z-50 bg-canvas h-screen w-screen p-6")}>
      {/* Header */}
      {!isFullscreen && (
        <div className="flex items-center justify-between pb-6 border-b border-hairline mb-6 flex-shrink-0">
          <div>
            <Link href="/documents" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-ink mb-2 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Link>
            <h1 className="text-heading-2 font-heading tracking-tight text-ink">{doc.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="bg-surface px-2 py-1 rounded-md border border-hairline">Dept ID: {doc.department_id}</span>
              <span className="bg-surface px-2 py-1 rounded-md border border-hairline">Cat ID: {doc.category_id}</span>
              <span>Version: {doc.version}</span>
              <span>Last Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center rounded-full bg-surface-soft border border-hairline hover:bg-surface px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Full Screen
              <Maximize className="ml-2 h-4 w-4" />
            </button>
            <a 
              href={doc.drive_url} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-brand-green text-on-dark hover:bg-brand-green-dark px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Open in Google Drive
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Viewer / Iframe container */}
      <div className="flex-1 bg-surface-soft rounded-xl border border-hairline overflow-hidden relative">
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            title="Exit Full Screen"
          >
            <Minimize className="h-5 w-5" />
          </button>
        )}
        <iframe 
          src={doc.drive_url} 
          className="w-full h-full border-0"
          title={doc.title}
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
}
