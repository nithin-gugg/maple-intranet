import { ArrowLeft, Maximize, Minimize } from "lucide-react";

interface PDFHeaderProps {
  title?: string;
  onBack?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PDFHeader({ title, onBack, isFullscreen, onToggleFullscreen }: PDFHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-1 border-b border-hairline flex-shrink-0 bg-canvas px-4 pt-1">
      <div className="flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center p-2 mr-3 text-slate-500 hover:text-ink hover:bg-surface rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium hidden sm:inline">Back</span>
          </button>
        )}
        <h1 className="text-heading-6 sm:text-heading-5 font-heading tracking-tight text-ink font-semibold truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-2xl" title={title}>
          {title || "Document Viewer"}
        </h1>
      </div>
      
      <button
        onClick={onToggleFullscreen}
        className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-ink hover:bg-surface rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green"
        aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </button>
    </div>
  );
}
