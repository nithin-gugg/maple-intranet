import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface PDFSearchProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onClose: () => void;
}

export function PDFSearch({ searchText, setSearchText, onClose }: PDFSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when search becomes visible
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="absolute top-16 right-4 sm:right-8 z-20 bg-canvas border border-hairline shadow-lg rounded-lg p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
      <Search className="h-4 w-4 text-slate-400 ml-1" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search in page..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="text-sm bg-transparent border-none focus:outline-none w-32 sm:w-48 text-ink px-1"
      />
      <div className="w-px h-4 bg-hairline mx-1" />
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-surface rounded-md text-slate-500 hover:text-ink transition-colors" 
        aria-label="Close search"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
