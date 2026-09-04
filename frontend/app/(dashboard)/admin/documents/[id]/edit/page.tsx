"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { detectDocumentUrlType } from "@/lib/documentUtils";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    main_category: "OFFICIAL", 
    department_id: 1, 
    drive_url: "",
    thumbnail_url: "",
  });

  const subcategoryOptions = {
    OFFICIAL: [
      { value: "ONBOARDING", label: "Onboarding Documents" },
      { value: "TEAMS_DEPARTMENTS", label: "Teams & Departments" },
      { value: "ANNOUNCEMENTS_UPDATES", label: "Announcements & Updates" }
    ],
    OPERATIONAL: [
      { value: "SOPS", label: "SOPs" },
      { value: "WORKFLOWS", label: "Workflows" }
    ]
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const main_category = e.target.value as "OFFICIAL" | "OPERATIONAL";
    setFormData({
      ...formData,
      main_category,
      subcategory: subcategoryOptions[main_category][0].value
    });
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const depRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/departments`, { headers });
        const depData = await depRes.json();
        setDepartments(depData || []);
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/${id}`);
        const data = await res.json();
        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            main_category: data.category?.main_category || "OFFICIAL",
            subcategory: data.category?.name || "ONBOARDING",
            department_id: data.department_id || 1,
            drive_url: data.drive_url || "",
            thumbnail_url: data.thumbnail_url || "",
          });
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

    if (detectDocumentUrlType(formData.drive_url) === "INVALID") {
      alert("Invalid document URL. Please provide a valid HTTPS PDF URL or Google Drive preview URL.");
      return;
    }

    setIsSaving(true);

    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
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
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-display-md font-heading tracking-tight text-ink">Edit Document</h1>
        <p className="mt-2 text-subtitle text-slate-500">Update metadata and link for {formData.title}.</p>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Main Category</label>
                  <select 
                    value={formData.main_category}
                    onChange={handleMainCategoryChange}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none appearance-none"
                  >
                    <option value="OFFICIAL">Official Documents</option>
                    <option value="OPERATIONAL">Operational Documents</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Subcategory</label>
                  <select 
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none appearance-none"
                  >
                    {subcategoryOptions[formData.main_category as "OFFICIAL" | "OPERATIONAL"].map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                </div>
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
            <h3 className="text-heading-6 font-semibold text-ink border-b border-hairline pb-2">Document File</h3>
            <p className="text-sm text-slate-500">Provide a direct link to a PDF file or a shareable link from Google Drive. Ensure the file is publicly accessible.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  required
                  type="url" 
                  value={formData.drive_url}
                  onChange={(e) => setFormData({...formData, drive_url: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  placeholder="Paste PDF URL or Google Drive preview URL"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-slate-700">Thumbnail Image URL (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="url" 
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  placeholder="Paste an Unsplash image URL (e.g. https://images.unsplash.com/...)"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Leave blank to use a default category placeholder.</p>
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
              {isSaving ? 'Saving...' : 'Update Document'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
