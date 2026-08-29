"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { appsDocumentation } from '@/data/apps-documentation';
import { AppSidebar } from './AppSidebar';
import { DocumentationContent } from './DocumentationContent';
import { OnThisPage } from './OnThisPage';

export function AppsDocumentationLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTool = searchParams.get('tool');
  
  // Try to load from URL first, otherwise default to hubstaff
  const initialAppId = urlTool && appsDocumentation.some(a => a.id === urlTool) 
    ? urlTool 
    : 'hubstaff';
    
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sync state to URL without triggering a full page reload or scrolling
  useEffect(() => {
    if (urlTool !== selectedAppId) {
      router.replace(`?tool=${selectedAppId}`, { scroll: false });
    }
  }, [selectedAppId, urlTool, router]);

  // Update state if URL changes externally (e.g. back button)
  useEffect(() => {
    if (urlTool && urlTool !== selectedAppId && appsDocumentation.some(a => a.id === urlTool)) {
      setSelectedAppId(urlTool);
    }
  }, [urlTool]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return appsDocumentation;
    const query = searchQuery.toLowerCase();
    
    return appsDocumentation.filter(app => {
      if (app.name.toLowerCase().includes(query)) return true;
      if (app.description.toLowerCase().includes(query)) return true;
      if (app.sections.some(s => 
        s.title.toLowerCase().includes(query) || 
        (typeof s.content === 'string' && s.content.toLowerCase().includes(query))
      )) return true;
      return false;
    });
  }, [searchQuery]);

  const selectedApp = useMemo(() => {
    return appsDocumentation.find(a => a.id === selectedAppId) || appsDocumentation[0];
  }, [selectedAppId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Mobile App Selector (visible only on mobile) */}
      <div className="lg:hidden">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Select Application
        </label>
        <div className="relative">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-surface border border-hairline rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/50 text-ink font-medium"
          >
            {filteredApps.map(app => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Menu className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative items-start">
        {/* Left Sidebar (hidden on mobile) */}
        <AppSidebar 
          apps={filteredApps} 
          selectedAppId={selectedAppId} 
          onSelectApp={setSelectedAppId} 
        />

        {/* Center Content */}
        {filteredApps.length > 0 ? (
          <DocumentationContent app={selectedApp} />
        ) : (
          <div className="flex-1 py-12 text-center text-slate-500">
            No documentation found matching "{searchQuery}"
          </div>
        )}

        {/* Right Sidebar (On This Page) */}
        {filteredApps.length > 0 && (
          <OnThisPage app={selectedApp} />
        )}
      </div>
    </div>
  );
}
