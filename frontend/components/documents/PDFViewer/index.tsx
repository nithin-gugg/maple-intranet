import React, { useState, useEffect } from "react";
import { PDFHeader } from "./PDFHeader";
import { PDFViewer } from "./PDFViewer";
import { cn } from "@/lib/utils";
import { detectDocumentUrlType, DocumentUrlType } from "@/lib/documentUtils";

interface DocumentViewerProps {
  url: string;
  title?: string;
  onBack?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function DocumentViewer({ url, title, onBack, onFullscreenChange }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [urlType, setUrlType] = useState<DocumentUrlType>(() => detectDocumentUrlType(url));

  useEffect(() => {
    if (url) {
      setUrlType(detectDocumentUrlType(url));
    }
  }, [url]);

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) {
      onFullscreenChange(next);
    }
  };

  const renderContent = () => {
    if (urlType === "GOOGLE_DRIVE_PREVIEW") {
      // If it's a view link, change it to preview for embedding
      const embedUrl = url.replace(/\/view$/, "/preview");
      return (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay"
          frameBorder="0"
          className="w-full h-full"
          title={title || "Document Viewer"}
        />
      );
    }

    if (urlType === "DIRECT_PDF") {
      return <PDFViewer url={url} />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50 p-8">
        <p className="font-semibold text-lg text-red-500 mb-2">Unable to access this document.</p>
        <p className="text-sm text-center">The document URL is invalid or uses an unsupported format. Please make sure the document is publicly accessible and uses a valid HTTPS URL.</p>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex flex-col bg-canvas rounded-xl overflow-hidden shadow-sm border border-hairline transition-all duration-300",
        isFullscreen ? "fixed top-16 left-0 right-0 bottom-0 z-40 h-[calc(100vh-4rem)] w-screen rounded-none border-none" : "h-[calc(100vh-10rem)]"
      )}
    >
      <PDFHeader 
        title={title} 
        onBack={onBack} 
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>
    </div>
  );
}
