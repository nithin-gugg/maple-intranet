"use client";

import { use, useEffect, useState } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";
import Link from "next/link";

const MAIN_CATEGORIES = {
  OFFICIAL: { title: "Official Documents" },
  OPERATIONAL: { title: "Operational Documents" }
};

const SUBCATEGORIES: Record<string, string> = {
  ONBOARDING: "Onboarding Documents",
  TEAMS_DEPARTMENTS: "Teams & Departments",
  ANNOUNCEMENTS_UPDATES: "Announcements & Updates",
  SOPS: "SOPs",
  WORKFLOWS: "Workflows",
  UNCATEGORIZED_OFFICIAL: "Uncategorized"
};

const DocumentViewer = dynamic(() => import("@/components/documents/PDFViewer/index"), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-surface-soft rounded-xl border border-hairline animate-pulse">Loading PDF Viewer...</div>
});

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/${id}`);
        if (!res.ok) throw new Error("Document not found");
        const data = await res.json();
        setDoc(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <DocumentsLayout>
        <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-green" /></div>
      </DocumentsLayout>
    );
  }

  if (!doc) {
    return (
      <DocumentsLayout>
        <div className="p-12 text-center text-slate-500">Document not found or you don't have access.</div>
      </DocumentsLayout>
    );
  }

  const mainCategory = doc.category?.main_category || "OFFICIAL";
  const subCategory = doc.category?.name || "UNCATEGORIZED_OFFICIAL";
  
  const mainCatTitle = MAIN_CATEGORIES[mainCategory as keyof typeof MAIN_CATEGORIES]?.title || mainCategory;
  const subCatTitle = SUBCATEGORIES[subCategory] || subCategory;

  return (
    <DocumentsLayout activeMainCategory={mainCategory} activeSubcategory={subCategory}>
      <div className="pb-8 h-full flex flex-col">
        
        {/* Breadcrumbs & Header */}
        {!isFullscreen && (
          <div className="mb-6">
            <div className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5 flex-wrap">
              <Link href="/documents" className="hover:text-brand-green transition-colors">Documents</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/documents?category=${mainCategory}`} className="hover:text-brand-green transition-colors">
                {mainCatTitle}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/documents?category=${mainCategory}&subcategory=${subCategory}`} className="hover:text-brand-green transition-colors">
                {subCatTitle}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-brand-green truncate max-w-[200px] sm:max-w-xs">{doc.title}</span>
            </div>
            {/* <h1 className="text-display-sm font-heading tracking-tight text-ink">
              {doc.title}
            </h1> */}
          </div>
        )}

        {/* Document Viewer */}
        <div className="flex-1 min-h-[500px]">
          <DocumentViewer 
            url={doc.drive_url} 
            title={doc.title} 
            onBack={() => router.back()} 
            onFullscreenChange={setIsFullscreen}
          />
        </div>
        
        {/* Metadata Footer */}
        {!isFullscreen && (
          <div className="mt-6 text-sm text-slate-500 bg-surface border border-hairline p-4 rounded-xl flex flex-wrap items-center gap-4">
            <span className="font-medium text-ink">Metadata:</span>
            <span className="px-2 py-1 rounded-md bg-surface-soft border border-hairline">Dept ID: {doc.department_id}</span>
            <span className="px-2 py-1 rounded-md bg-surface-soft border border-hairline">Cat ID: {doc.category_id}</span>
            <span>Version: {doc.version}</span>
            <span>Last Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </DocumentsLayout>
  );
}
