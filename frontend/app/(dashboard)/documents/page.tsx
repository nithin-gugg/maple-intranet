"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Shield, GraduationCap, Folder, Search, Filter, ExternalLink } from "lucide-react";

const CATEGORIES = [
  { id: 1, title: "Official Documents", icon: FileText, count: 24, color: "text-brand-green", bg: "bg-brand-green/10" },
  { id: 2, title: "Policy Documents", icon: Shield, count: 18, color: "text-accent-purple", bg: "bg-accent-purple/10" },
  { id: 3, title: "Training Documents", icon: GraduationCap, count: 12, color: "text-accent-orange", bg: "bg-accent-orange/10" },
  { id: 4, title: "Other Documents", icon: Folder, count: 31, color: "text-brand-teal", bg: "bg-brand-teal/10" },
];

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const url = activeCategory 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents?category_id=${activeCategory}` 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents`;
        const res = await fetch(url);
        const data = await res.json();
        setDocuments(data || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [activeCategory]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-lg font-heading tracking-tight text-ink">Documents</h1>
        <p className="mt-2 text-subtitle text-slate-500">Access company policies, handbooks, and official resources.</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`cursor-pointer rounded-lg border p-6 transition-all ${
              activeCategory === cat.id 
                ? "border-brand-green shadow-md ring-1 ring-brand-green bg-surface-feature" 
                : "border-hairline bg-canvas hover:shadow-sm"
            }`}
          >
            <div className={`h-12 w-12 rounded-full ${cat.bg} flex items-center justify-center mb-4`}>
              <cat.icon className={`h-6 w-6 ${cat.color}`} />
            </div>
            <h3 className="text-heading-4 font-semibold text-ink">{cat.title}</h3>
            <p className="text-slate-500 mt-1">{cat.count} documents</p>
            <div className="mt-4 flex items-center text-brand-green-dark font-medium text-sm">
              View All <span className="ml-1">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-canvas p-4 rounded-lg border border-hairline shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            className="h-11 w-full rounded-md border border-input bg-surface pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline-strong rounded-md hover:bg-surface-soft transition-colors text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-hairline">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Name</th>
              <th className="px-6 py-4 font-medium text-slate-500 hidden sm:table-cell">Department</th>
              <th className="px-6 py-4 font-medium text-slate-500 hidden md:table-cell">Version</th>
              <th className="px-6 py-4 font-medium text-slate-500 hidden sm:table-cell">Last Updated</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading documents...</td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No documents found.</td>
              </tr>
            ) : documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-surface-soft transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-ink">{doc.title}</p>
                      <span className="text-xs text-brand-green-dark bg-brand-green-soft px-2 py-0.5 rounded-full mt-1 inline-block sm:hidden">
                        Dep ID: {doc.department_id}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">Dep ID: {doc.department_id}</td>
                <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{doc.version}</td>
                <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">
                  {new Date(doc.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-brand-green/10 text-brand-green-dark hover:bg-brand-green/20 px-4 py-2 font-medium transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
