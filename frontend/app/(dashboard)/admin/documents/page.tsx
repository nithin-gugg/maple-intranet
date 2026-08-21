"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, FileText, Loader2 } from "lucide-react";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/${id}`, { method: "DELETE" });
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-heading tracking-tight text-ink">Manage Documents</h1>
          <p className="mt-1 text-sm text-slate-500">View, edit, and delete intranet documents.</p>
        </div>
        <Link 
          href="/admin/documents/new" 
          className="flex items-center gap-2 bg-brand-teal-deep text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-teal transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Link>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-hairline text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Version</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-ink">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{doc.document_type}</td>
                  <td className="px-6 py-4 text-slate-600">v{doc.version}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/documents/${doc.id}/edit`}
                        className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-md transition-colors"
                        title="Edit Drive URL"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
