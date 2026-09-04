"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Folder, FolderOpen, FileText, LayoutGrid, ChevronRight, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";

export interface DocumentSidebarProps {
  activeMainCategory?: string;
  activeSubcategory?: string;
  onCloseMobile?: () => void;
}

const MAIN_CATEGORIES = {
  OFFICIAL: { title: "Official Documents", color: "text-brand-green", bg: "bg-brand-green/10", icon: Folder },
  OPERATIONAL: { title: "Operational Documents", color: "text-brand-teal", bg: "bg-brand-teal/10", icon: Folder }
};

const SUBCATEGORIES: Record<string, string> = {
  ONBOARDING: "Onboarding Documents",
  TEAMS_DEPARTMENTS: "Teams & Departments",
  ANNOUNCEMENTS_UPDATES: "Announcements & Updates",
  SOPS: "SOPs",
  WORKFLOWS: "Workflows",
  UNCATEGORIZED_OFFICIAL: "Uncategorized"
};

export function DocumentSidebar({ activeMainCategory, activeSubcategory, onCloseMobile }: DocumentSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const activeDocumentId = params?.id as string | undefined;

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Expanded state for main categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    OFFICIAL: activeMainCategory === "OFFICIAL" || !activeMainCategory,
    OPERATIONAL: activeMainCategory === "OPERATIONAL" || !activeMainCategory
  });

  // Expanded state for subcategories
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({
    [`${activeMainCategory}_${activeSubcategory}`]: true
  });

  useEffect(() => {
    if (activeMainCategory) {
      setExpanded(prev => ({ ...prev, [activeMainCategory]: true }));
    }
  }, [activeMainCategory]);

  useEffect(() => {
    if (activeMainCategory && activeSubcategory) {
      setExpandedSub(prev => ({ ...prev, [`${activeMainCategory}_${activeSubcategory}`]: true }));
    }
  }, [activeMainCategory, activeSubcategory]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents`);
        const data = await res.json();
        setDocuments(data || []);
      } catch (err) {
        console.error("Failed to fetch documents for sidebar counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Compute counts
  const counts = useMemo(() => {
    const counts = { total: documents.length, main: {} as Record<string, number>, sub: {} as Record<string, number> };
    documents.forEach(doc => {
      const mainCat = doc.category?.main_category || "OFFICIAL";
      const subCat = doc.category?.name || "UNCATEGORIZED_OFFICIAL";
      
      counts.main[mainCat] = (counts.main[mainCat] || 0) + 1;
      const subKey = `${mainCat}_${subCat}`;
      counts.sub[subKey] = (counts.sub[subKey] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const toggleExpand = (e: React.MouseEvent, mainCat: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [mainCat]: !prev[mainCat] }));
  };

  const toggleSubExpand = (e: React.MouseEvent, subKey: string) => {
    // Note: Don't prevent default, allow the Link to navigate to the filtered list as well
    setExpandedSub(prev => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const isAllActive = !activeMainCategory && !activeSubcategory && !activeDocumentId;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return documents.filter(doc => 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#1a2530] border-r border-white/10 w-full overflow-y-auto custom-scrollbar text-white">
      <div className="p-6 pb-20">
        
        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg bg-white/10 border border-white/20 pl-10 pr-4 outline-none focus:border-[#00dc82] focus:ring-1 focus:ring-[#00dc82] transition-all shadow-sm text-sm text-white placeholder-gray-400"
          />
        </div>

        <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">
          {searchQuery ? "Search Results" : "Documents"}
        </h2>
        
        <nav className="space-y-6">
          {searchQuery ? (
            <div className="space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map(doc => {
                  const isDocActive = activeDocumentId === doc.id.toString();
                  return (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex flex-col gap-1 w-full px-3 py-2 rounded-lg text-sm transition-colors group",
                        isDocActive ? "bg-brand-green/10 text-brand-green font-medium" : "text-slate-600 hover:text-ink hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={cn("h-4 w-4 flex-shrink-0", isDocActive ? "text-brand-green" : "text-slate-400")} />
                        <span className="truncate font-medium">{doc.title}</span>
                      </div>
                      <span className="text-xs text-slate-400 ml-7 truncate">
                        {SUBCATEGORIES[doc.category?.name] || doc.category?.name || "Uncategorized"}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 bg-canvas rounded-lg border border-hairline">
                  No documents found matching "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            <>
              {/* All Documents */}
              <div>
            <Link 
              href="/documents" 
              onClick={handleLinkClick}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isAllActive ? "bg-[#00dc82]/20 text-[#00dc82]" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={cn("h-4 w-4", isAllActive ? "text-[#00dc82]" : "text-gray-400 group-hover:text-white")} />
                <span>All Documents</span>
              </div>
              {!loading && counts.total > 0 && (
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isAllActive ? "bg-[#00dc82]/20 text-[#00dc82]" : "bg-white/10 text-gray-400 group-hover:bg-white/20")}>
                  {counts.total}
                </span>
              )}
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(MAIN_CATEGORIES).map(([mainCat, config]) => {
              const isMainExpanded = expanded[mainCat];
              const isMainActive = activeMainCategory === mainCat;
              
              const subcats = mainCat === "OFFICIAL" 
                ? ["ONBOARDING", "TEAMS_DEPARTMENTS", "ANNOUNCEMENTS_UPDATES"] 
                : ["SOPS", "WORKFLOWS"];

              return (
                <div key={mainCat} className="space-y-1">
                  <button
                    onClick={(e) => toggleExpand(e, mainCat)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors group text-left",
                      isMainActive && !activeSubcategory && !activeDocumentId ? "text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isMainExpanded ? (
                        <FolderOpen className={cn("h-4 w-4", config.color.replace("text-brand-", "text-"))} />
                      ) : (
                        <Folder className={cn("h-4 w-4", config.color.replace("text-brand-", "text-"))} />
                      )}
                      <span>{config.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!loading && counts.main[mainCat] > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-gray-400 group-hover:bg-white/20">
                          {counts.main[mainCat]}
                        </span>
                      )}
                      {isMainExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-white" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-white" />
                      )}
                    </div>
                  </button>

                  {isMainExpanded && (
                    <div className="ml-5 border-l border-white/10 pl-3 space-y-1 mt-1">
                      {subcats.map(subCat => {
                        const subKey = `${mainCat}_${subCat}`;
                        const isSubExpanded = expandedSub[subKey];
                        
                        // It is active if it matches the current URL category/subcategory, 
                        // AND we aren't specifically viewing a document (or we are viewing one that belongs here)
                        const isSubActive = isMainActive && activeSubcategory === subCat;
                        
                        const subcatDocs = documents.filter(doc => 
                          (doc.category?.main_category || "OFFICIAL") === mainCat && 
                          (doc.category?.name || "UNCATEGORIZED_OFFICIAL") === subCat
                        );

                        return (
                          <div key={subCat} className="space-y-1">
                            <Link
                              href={`/documents?category=${mainCat}&subcategory=${subCat}`}
                              onClick={(e) => toggleSubExpand(e, subKey)}
                              className={cn(
                                "flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-sm transition-colors group",
                                isSubActive && !activeDocumentId ? "bg-[#00dc82]/20 text-[#00dc82] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {isSubExpanded ? (
                                  <FolderOpen className={cn("h-3.5 w-3.5", (isSubActive && !activeDocumentId) ? "text-[#00dc82]" : "text-gray-500")} />
                                ) : (
                                  <Folder className={cn("h-3.5 w-3.5", (isSubActive && !activeDocumentId) ? "text-[#00dc82]" : "text-gray-500")} />
                                )}
                                <span>{SUBCATEGORIES[subCat] || subCat}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {!loading && counts.sub[subKey] > 0 && (
                                  <span className={cn("text-xs px-1.5 py-0.5 rounded-md", (isSubActive && !activeDocumentId) ? "text-[#00dc82]" : "text-gray-500")}>
                                    {counts.sub[subKey]}
                                  </span>
                                )}
                                {isSubExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-500 group-hover:text-white" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white" />
                                )}
                              </div>
                            </Link>

                            {/* Level 3: Documents */}
                            {isSubExpanded && subcatDocs.length > 0 && (
                              <div className="ml-5 border-l border-white/10 pl-3 space-y-1 mt-1">
                                {subcatDocs.map(doc => {
                                  const isDocActive = activeDocumentId === doc.id.toString();
                                  return (
                                    <Link
                                      key={doc.id}
                                      href={`/documents/${doc.id}`}
                                      onClick={handleLinkClick}
                                      className={cn(
                                        "flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm transition-colors group line-clamp-1",
                                        isDocActive ? "bg-[#00dc82]/20 text-[#00dc82] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                                      )}
                                      title={doc.title}
                                    >
                                      <span className="truncate">{doc.title}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
          )}
        </nav>
      </div>
    </div>
  );
}
