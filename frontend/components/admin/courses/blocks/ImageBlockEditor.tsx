"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ImageBlockEditor({ block, onUpdate }: { block: any, onUpdate: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState(() => {
    const json = block.metadata_json || {};
    return {
      url: json.url || "",
      alt: json.alt || ""
    };
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/upload`, {
          method: "POST",
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const newMetadata = { ...metadata, url: baseUrl + data.url };
          setMetadata(newMetadata);
          onUpdate({
            metadata_json: newMetadata
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {metadata.url ? (
        <div className="space-y-4">
          <div className="relative w-full rounded-lg overflow-hidden border border-hairline bg-canvas flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={metadata.url} 
              alt={metadata.alt || "Course image"} 
              className="max-h-[400px] object-contain"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-500">Alt Text</label>
              <input
                type="text"
                value={metadata.alt || ""}
                onChange={(e) => {
                  const newMetadata = { ...metadata, alt: e.target.value };
                  setMetadata(newMetadata);
                  onUpdate({ metadata_json: newMetadata });
                }}
                placeholder="Describe the image for accessibility..."
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-surface focus:border-brand-green outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Replace Image</label>
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <button className="px-4 py-1.5 text-sm font-medium border border-input rounded-lg hover:bg-canvas">
                  Choose File
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-input rounded-xl p-8 text-center bg-surface hover:bg-canvas transition-colors">
          <input 
            type="file" 
            id={`img-upload-${block.id}`}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label htmlFor={`img-upload-${block.id}`} className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
              {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div>
              <span className="font-semibold text-brand-teal-deep">Click to upload image</span>
            </div>
            <p className="text-xs text-slate-400">JPG, PNG, GIF (Max 5MB)</p>
          </label>
        </div>
      )}
    </div>
  );
}
