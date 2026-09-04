"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { DocumentSidebar } from "./DocumentSidebar";

interface DocumentsLayoutProps {
  children: React.ReactNode;
  activeMainCategory?: string;
  activeSubcategory?: string;
}

export function DocumentsLayout({ children, activeMainCategory, activeSubcategory }: DocumentsLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-canvas relative">
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop fixed, Mobile Drawer */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-[340px] flex-shrink-0 h-full bg-[#1a2530] shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-white/10">
          <h2 className="font-heading font-semibold text-white">Documents Menu</h2>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="h-[calc(100%-61px)] lg:h-full overflow-hidden">
          <DocumentSidebar 
            activeMainCategory={activeMainCategory} 
            activeSubcategory={activeSubcategory} 
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center p-4 border-b border-hairline bg-surface shadow-sm z-30">
          <button 
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-slate-600 hover:text-ink hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="font-medium">Menu</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-8">
          <div className="max-w-9xl mx-auto h-full">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
