import React from "react";

export function NewsCarouselSkeleton() {
  return (
    <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm flex flex-col h-full animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-brand-teal/20 rounded"></div>
          <div className="h-6 w-48 bg-surface rounded"></div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] flex flex-col lg:flex-row gap-6">
        {/* Image Placeholder */}
        <div className="w-full lg:w-2/5 shrink-0">
          <div className="w-full h-48 lg:h-full bg-surface rounded-xl"></div>
        </div>
        
        {/* Content Placeholder */}
        <div className="flex-1 flex flex-col justify-center gap-4 py-2">
          <div className="h-4 w-32 bg-brand-teal/20 rounded"></div>
          
          <div className="space-y-2">
            <div className="h-8 w-full bg-surface rounded"></div>
            <div className="h-8 w-3/4 bg-surface rounded"></div>
          </div>
          
          <div className="space-y-2 mt-2">
            <div className="h-4 w-full bg-surface rounded"></div>
            <div className="h-4 w-5/6 bg-surface rounded"></div>
          </div>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="h-4 w-24 bg-surface rounded"></div>
            <div className="h-4 w-4 bg-surface rounded-full"></div>
            <div className="h-4 w-24 bg-surface rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Controls Placeholder */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-hairline">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-surface rounded-full"></div>
          <div className="h-8 w-8 bg-surface rounded-full"></div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-surface"></div>
          ))}
        </div>
      </div>
    </section>
  );
}
