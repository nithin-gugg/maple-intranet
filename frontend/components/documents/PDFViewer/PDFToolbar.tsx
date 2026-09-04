import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Maximize2, SplitSquareHorizontal } from "lucide-react";
import React from "react";

interface PDFToolbarProps {
  pageNumber: number;
  numPages: number | null;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange: (page: number) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onToggleSearch: () => void;
  isSearchVisible: boolean;
}

export function PDFToolbar({
  pageNumber,
  numPages,
  onNextPage,
  onPrevPage,
  onPageChange,
  scale,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onToggleSearch,
  isSearchVisible,
}: PDFToolbarProps) {
  
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && numPages && val >= 1 && val <= numPages) {
      onPageChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && numPages && val >= 1 && val <= numPages) {
        onPageChange(val);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between p-2 sm:p-3 bg-surface border-b border-hairline sticky top-0 z-10 shadow-sm gap-2">
      {/* Pagination */}
      <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-lg border border-hairline">
        <button
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          className="p-1.5 rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        <div className="flex items-center text-xs sm:text-sm font-medium text-slate-700 px-1 sm:px-2">
          <span className="hidden sm:inline mr-2">Page</span>
          <input 
            type="number" 
            value={pageNumber || ""}
            onChange={handlePageInput}
            onKeyDown={handleKeyDown}
            min={1}
            max={numPages || 1}
            className="w-10 sm:w-12 text-center p-1 border border-input rounded bg-surface focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          <span className="mx-2 text-slate-400">/</span>
          {numPages || "--"}
        </div>

        <button
          onClick={onNextPage}
          disabled={!numPages || pageNumber >= numPages}
          className="p-1.5 rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-lg border border-hairline">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.25}
          className="p-1.5 rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        <span className="text-xs sm:text-sm font-medium text-slate-700 w-10 sm:w-12 text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          disabled={scale >= 3.0}
          className="p-1.5 rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="w-px h-4 sm:h-5 bg-hairline mx-1" />

        <button
          onClick={onFitWidth}
          className="p-1.5 rounded-md hover:bg-surface transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Fit to Width"
          aria-label="Fit to Width"
        >
          <SplitSquareHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        <button
          onClick={onFitPage}
          className="p-1.5 rounded-md hover:bg-surface transition-colors text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
          title="Fit to Page"
          aria-label="Fit to Page"
        >
          <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center">
        <button
          onClick={onToggleSearch}
          className={`p-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green ${
            isSearchVisible 
              ? 'bg-brand-green text-on-dark shadow-sm' 
              : 'bg-surface-soft border border-hairline text-slate-700 hover:bg-surface'
          }`}
          title="Search in document"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>
  );
}
