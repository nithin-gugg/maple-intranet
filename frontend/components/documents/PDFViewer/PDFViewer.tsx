import React, { useCallback, useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PDFToolbar } from "./PDFToolbar";
import { PDFSearch } from "./PDFSearch";
import { Loader2 } from "lucide-react";

// Set up the worker for react-pdf to parse the PDF in a background thread
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create proxy URL to avoid CORS from WordPress domain
  const proxyUrl = `/api/pdf?url=${encodeURIComponent(url)}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Highlight search text
  const textRenderer = useCallback(
    (textItem: any) => {
      const { str } = textItem;
      if (!searchText) return str;
      
      const regex = new RegExp(`(${searchText})`, 'gi');
      if (!regex.test(str)) return str;

      const parts = str.split(regex);
      
      return (
        <React.Fragment>
          {parts.map((part: string, i: number) => 
            regex.test(part) ? (
              <mark key={i} className="bg-brand-green/30 text-ink rounded-[2px] shadow-sm">
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </React.Fragment>
      );
    },
    [searchText]
  );

  const handleZoomIn = () => setScale((s) => Math.min(3.0, s + 0.25));
  const handleZoomOut = () => setScale((s) => Math.max(0.25, s - 0.25));
  
  const handleFitWidth = useCallback(() => {
    if (containerRef.current) {
      // Assuming a standard PDF page width of ~600px at scale 1.0 (A4 is usually ~595px)
      // We calculate the scale based on container width
      const containerWidth = containerRef.current.clientWidth;
      // Provide some padding
      const targetScale = (containerWidth - 40) / 600; 
      setScale(Math.min(3.0, Math.max(0.25, targetScale)));
    }
  }, []);

  const handleFitPage = useCallback(() => {
    if (containerRef.current) {
      // Assuming a standard PDF page height of ~842px at scale 1.0
      const containerHeight = containerRef.current.clientHeight;
      // Provide some padding
      const targetScale = (containerHeight - 80) / 842;
      setScale(Math.min(3.0, Math.max(0.25, targetScale)));
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'ArrowRight') {
        if (numPages && pageNumber < numPages) setPageNumber(p => p + 1);
      } else if (e.key === 'ArrowLeft') {
        if (pageNumber > 1) setPageNumber(p => p - 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchVisible(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages]);

  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      <PDFToolbar
        pageNumber={pageNumber}
        numPages={numPages}
        onNextPage={() => setPageNumber((p) => Math.min(numPages || 1, p + 1))}
        onPrevPage={() => setPageNumber((p) => Math.max(1, p - 1))}
        onPageChange={(p) => setPageNumber(p)}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitWidth={handleFitWidth}
        onFitPage={handleFitPage}
        onToggleSearch={() => setIsSearchVisible(!isSearchVisible)}
        isSearchVisible={isSearchVisible}
      />
      
      {isSearchVisible && (
        <PDFSearch 
          searchText={searchText} 
          setSearchText={setSearchText} 
          onClose={() => setIsSearchVisible(false)} 
        />
      )}

      <div className="flex-1 overflow-auto bg-slate-100 flex justify-center p-4 sm:p-8">
        <Document
          file={proxyUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-4" />
              <p>Loading document...</p>
              
              {/* Professional skeleton for loading */}
              <div className="mt-8 w-[600px] max-w-full bg-white rounded-lg shadow-sm border border-hairline p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-40 bg-slate-200 rounded w-full mt-8"></div>
              </div>
            </div>
          }
          error={
            <div className="mt-20 flex flex-col items-center justify-center text-red-500 bg-red-50 p-6 rounded-lg border border-red-100 max-w-lg mx-auto text-center">
              <p className="font-semibold text-lg mb-2">Unable to load document.</p>
              <p className="text-sm">Please try again later. Ensure you have the correct permissions.</p>
            </div>
          }
          className="flex flex-col items-center"
        >
          <div className="shadow-lg mb-4 bg-white transition-transform duration-200 ease-in-out">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              customTextRenderer={textRenderer}
              loading={<div className="h-[800px] w-[600px] max-w-full bg-white flex items-center justify-center text-slate-400">Rendering page...</div>}
              renderAnnotationLayer={true}
              renderTextLayer={true}
              className="rounded-sm"
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
