"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { FileText, Shield, Search, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";

const MAIN_CATEGORIES = {
  OFFICIAL: { title: "Official Documents", color: "text-brand-green", bg: "bg-brand-green/10", icon: FileText },
  OPERATIONAL: { title: "Operational Documents", color: "text-brand-teal", bg: "bg-brand-teal/10", icon: Shield }
};

const SUBCATEGORIES: Record<string, string> = {
  ONBOARDING: "Onboarding Documents",
  TEAMS_DEPARTMENTS: "Teams & Departments",
  ANNOUNCEMENTS_UPDATES: "Announcements & Updates",
  SOPS: "SOPs",
  WORKFLOWS: "Workflows",
  UNCATEGORIZED_OFFICIAL: "Uncategorized"
};

function DocumentCard({ doc, mainConfig, subCatName }: { doc: any, mainConfig: any, subCatName: string }) {
  const [imgError, setImgError] = useState(false);
  
  return (
    <Link
      href={`/documents/${doc.id}`}
      className="flex flex-col bg-canvas border border-hairline rounded-xl hover:shadow-lg transition-all hover:border-brand-green/50 group overflow-hidden h-full"
    >
      {/* Thumbnail Section */}
      <div className="aspect-video w-full bg-surface-soft relative overflow-hidden flex items-center justify-center border-b border-hairline">
        {doc.thumbnail_url && !imgError ? (
          <img
            src={doc.thumbnail_url}
            alt={doc.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
             <mainConfig.icon className={cn("h-12 w-12 opacity-20", mainConfig.color)} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-md bg-surface-soft px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 truncate max-w-full">
            {subCatName}
          </span>
        </div>
        
        <h4 className="font-semibold text-ink line-clamp-1 group-hover:text-brand-green transition-colors">{doc.title}</h4>
        
        <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1">
          {doc.description || "No description provided."}
        </p>
        
        <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
          <span className="text-xs text-brand-green font-medium flex items-center gap-1 group-hover:underline">
            View Document <ChevronRight className="h-3 w-3" />
          </span>
          <span className="text-xs text-slate-400">{new Date(doc.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

function DocumentsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents`);
        const data = await res.json();
        setDocuments(data || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    let docs = documents;

    // Filter by URL params if present
    if (categoryParam) {
      docs = docs.filter(doc => (doc.category?.main_category || "OFFICIAL") === categoryParam);
    }
    if (subcategoryParam) {
      docs = docs.filter(doc => (doc.category?.name || "UNCATEGORIZED_OFFICIAL") === subcategoryParam);
    }
    return docs;
  }, [documents, categoryParam, subcategoryParam]);

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {
      OFFICIAL: {},
      OPERATIONAL: {}
    };

    filteredDocuments.forEach(doc => {
      const mainCat = doc.category?.main_category || "OFFICIAL";
      const subCat = doc.category?.name || "UNCATEGORIZED_OFFICIAL";
      
      if (!groups[mainCat]) groups[mainCat] = {};
      if (!groups[mainCat][subCat]) groups[mainCat][subCat] = [];
      
      groups[mainCat][subCat].push(doc);
    });

    return groups;
  }, [filteredDocuments]);

  // Determine Title & Breadcrumbs
  let pageTitle = "All Documents";
  let breadcrumb = "Documents";

  if (categoryParam) {
    pageTitle = MAIN_CATEGORIES[categoryParam as keyof typeof MAIN_CATEGORIES]?.title || categoryParam;
    breadcrumb = `Documents / ${pageTitle}`;
    
    if (subcategoryParam) {
      pageTitle = SUBCATEGORIES[subcategoryParam] || subcategoryParam;
      breadcrumb = `Documents / ${MAIN_CATEGORIES[categoryParam as keyof typeof MAIN_CATEGORIES]?.title} / ${pageTitle}`;
    }
  }

  return (
    <DocumentsLayout activeMainCategory={categoryParam || undefined} activeSubcategory={subcategoryParam || undefined}>
      <div className="space-y-8 pb-12 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <span>Documents</span>
              {categoryParam && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>{MAIN_CATEGORIES[categoryParam as keyof typeof MAIN_CATEGORIES]?.title || categoryParam}</span>
                </>
              )}
              {subcategoryParam && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-brand-green">{pageTitle}</span>
                </>
              )}
            </div>
            <h1 className="text-display-sm font-heading tracking-tight text-ink flex items-center gap-3">
              {pageTitle}
              {!loading && (
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-surface-soft border border-hairline text-slate-500 mt-1">
                  {filteredDocuments.length}
                </span>
              )}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        ) : (
          <div className="space-y-12">
            
            {Object.keys(MAIN_CATEGORIES).map(mainCat => {
              const mainConfig = MAIN_CATEGORIES[mainCat as keyof typeof MAIN_CATEGORIES];
              const subCategoriesObj = groupedDocuments[mainCat] || {};
              const subKeys = Object.keys(subCategoriesObj).sort();

              if (subKeys.length === 0) return null;

              return (
                <div key={mainCat} className="space-y-6">
                  {/* Show main category header only if we aren't already filtered down to it specifically */}
                  {(!categoryParam || categoryParam !== mainCat) && (
                    <div className="flex items-center gap-3 border-b border-hairline pb-3">
                      <div className={cn("h-8 w-8 rounded-md flex items-center justify-center", mainConfig.bg)}>
                        <mainConfig.icon className={cn("h-4 w-4", mainConfig.color)} />
                      </div>
                      <h2 className="text-heading-6 font-semibold text-ink">{mainConfig.title}</h2>
                    </div>
                  )}

                  <div className="space-y-10 pl-1">
                    {subKeys.map(subCat => (
                      <div key={subCat} className="space-y-4">
                        {/* Show subcategory header only if we aren't filtered down to it specifically */}
                        {(!subcategoryParam || subcategoryParam !== subCat) && (
                          <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                            {SUBCATEGORIES[subCat] || subCat}
                          </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                          {subCategoriesObj[subCat].map(doc => (
                            <DocumentCard 
                              key={doc.id} 
                              doc={doc} 
                              mainConfig={mainConfig} 
                              subCatName={SUBCATEGORIES[subCat] || subCat} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center p-12 bg-surface border border-hairline rounded-xl">
                <p className="text-slate-500">No documents found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DocumentsLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-green" /></div>}>
      <DocumentsPageContent />
    </Suspense>
  );
}
