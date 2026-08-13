"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Loader2 } from "lucide-react";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    drive_url: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}`);
        const data = await res.json();
        if (data) {
          setFormData({ title: data.title, drive_url: data.drive_url || "" });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drive_url: formData.drive_url }),
      });

      if (!res.ok) throw new Error("Failed to update document");
      router.push("/admin/documents");
    } catch (error) {
      console.error(error);
      alert("Error updating document.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-green" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-display-md font-heading tracking-tight text-ink">Edit Document</h1>
        <p className="mt-2 text-subtitle text-slate-500">Update the Google Drive preview link for {formData.title}.</p>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Google Drive URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  required
                  type="url" 
                  value={formData.drive_url}
                  onChange={(e) => setFormData({...formData, drive_url: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  placeholder="https://docs.google.com/document/d/..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-hairline flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving || !formData.drive_url}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-brand-teal-deep text-white hover:bg-brand-teal shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Update Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
