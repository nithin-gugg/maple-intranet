"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Loader2 } from "lucide-react";

export default function NewDocumentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: 1, 
    department_id: 1, 
    drive_url: "",
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, depRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/departments`)
        ]);
        const catData = await catRes.json();
        const depData = await depRes.json();
        
        setCategories(catData || []);
        setDepartments(depData || []);
        
        if (catData?.length > 0) setFormData(f => ({...f, category_id: catData[0].id}));
        if (depData?.length > 0) setFormData(f => ({...f, department_id: depData[0].id}));
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    
    fetchMetadata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create document");
      }

      router.push("/documents");
    } catch (error) {
      console.error(error);
      alert("Error saving document.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-display-md font-heading tracking-tight text-ink">Add Document</h1>
        <p className="mt-2 text-subtitle text-slate-500">Link a new file from Google Drive to the intranet document system.</p>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-heading-6 font-semibold text-ink border-b border-hairline pb-2">Document Metadata</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document Title <span className="text-red-500">*</span></label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                placeholder="e.g. Employee Handbook Q3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none resize-none"
                placeholder="Briefly describe the contents of this document..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                {loadingMetadata ? (
                  <div className="w-full px-4 py-2 rounded-lg border border-input bg-surface flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : (
                  <select 
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none appearance-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Department</label>
                {loadingMetadata ? (
                  <div className="w-full px-4 py-2 rounded-lg border border-input bg-surface flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : (
                  <select 
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none appearance-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-heading-6 font-semibold text-ink border-b border-hairline pb-2">Google Drive Integration</h3>
            <p className="text-sm text-slate-500">Paste the shareable link from Google Drive. Ensure the sharing settings are configured correctly on Drive.</p>
            
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
              disabled={isSaving || !formData.title || !formData.drive_url}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-brand-teal-deep text-white hover:bg-brand-teal shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSaving ? 'Publishing...' : 'Publish Document'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
