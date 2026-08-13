"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [scormFile, setScormFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: 1, // Default category
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setScormFile(file);
      } else {
        alert("Please select a valid .zip SCORM package");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let scorm_package_id = null;

      // 1. Upload SCORM Package if provided
      if (scormFile) {
        const scormData = new FormData();
        scormData.append("title", formData.title + " SCORM");
        scormData.append("file", scormFile);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/learning-packages/upload`, {
          method: "POST",
          body: scormData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.detail || "Failed to upload SCORM package");
        }

        const packageData = await uploadRes.json();
        scorm_package_id = packageData.id;
      }

      // 2. Create Course Record
      const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/learning/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          learning_package_id: scorm_package_id
        }),
      });

      if (!courseRes.ok) {
        throw new Error("Failed to create course");
      }

      router.push("/learning");
    } catch (error: any) {
      console.error(error);
      alert(`Error saving course: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-display-md font-heading tracking-tight text-ink">Course Builder</h1>
        <p className="mt-2 text-subtitle text-slate-500">Create a new learning module and optionally upload a SCORM 1.2 package.</p>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-heading-6 font-semibold text-ink border-b border-hairline pb-2">Basic Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Course Title <span className="text-red-500">*</span></label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                placeholder="e.g. Code of Conduct 2026"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none resize-none"
                placeholder="Course overview and objectives..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category ID</label>
              <input 
                type="number"
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-surface focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
              />
              <p className="text-xs text-slate-500">Enter a valid Category ID (e.g., 1 for Leadership, 2 for Technical).</p>
            </div>
          </div>

          {/* SCORM Upload Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-heading-6 font-semibold text-ink border-b border-hairline pb-2">Interactive Content (SCORM)</h3>
            <p className="text-sm text-slate-500">Upload a SCORM 1.2 zip package. Our engine will securely extract and parse the manifest to identify the launch files.</p>
            
            <div className="border-2 border-dashed border-input rounded-xl p-8 text-center bg-surface hover:bg-canvas transition-colors">
              <input 
                type="file" 
                id="scorm-upload" 
                className="hidden" 
                accept=".zip"
                onChange={handleFileChange}
              />
              <label htmlFor="scorm-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-semibold text-brand-teal-deep hover:text-brand-green transition-colors">Click to upload</span>
                  <span className="text-slate-500 ml-1">or drag and drop</span>
                </div>
                <p className="text-xs text-slate-400">SCORM 1.2 .zip (Max 100MB)</p>
              </label>
              
              {scormFile && (
                <div className="mt-6 flex items-center gap-3 p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-lg text-left">
                  <FileText className="h-5 w-5 text-brand-teal" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-teal-deep truncate">{scormFile.name}</p>
                    <p className="text-xs text-slate-500">{(scormFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-brand-green" />
                </div>
              )}
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-accent-orange/10 border border-accent-orange/20 rounded-lg text-accent-orange-dark">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Security Notice:</strong> Uploaded packages are scanned for path traversal attempts and sandboxed upon extraction.</p>
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
              disabled={isUploading || !formData.title}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-brand-teal-deep text-white hover:bg-brand-teal shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Save & Publish'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
