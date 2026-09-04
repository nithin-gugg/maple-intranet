"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import TipTapEditor from "../../blocks/TipTapEditor";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { useRef } from "react";

export default function CourseDetailsStep({ course, onUpdate, onNext }: { course: any, onUpdate: () => void, onNext: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.url);
        toast({ title: "Image uploaded successfully" });
      } else {
        toast({ title: "Failed to upload image", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "An error occurred during upload", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!title) {
      toast({ title: "Course name is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          thumbnail_url: thumbnailUrl
        }),
      });

      if (res.ok) {
        toast({ title: "Details saved successfully" });
        onUpdate();
        onNext();
      } else {
        toast({ title: "Failed to save details", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Course Details</h2>
        <p className="text-muted-foreground">Set the core information for your course.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Course Name <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              placeholder="e.g. Workplace Safety Fundamentals" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Course Description <span className="text-red-500">*</span></Label>
            <div className="border rounded-lg overflow-hidden">
              <TipTapEditor 
                block={{ content: description }} 
                onUpdate={({ content }) => setDescription(content)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Course Thumbnail</Label>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />

            {thumbnailUrl ? (
              <div className="relative border rounded-xl overflow-hidden max-w-xl group">
                <img 
                  src={thumbnailUrl.startsWith('http') ? thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${thumbnailUrl}`} 
                  alt="Course Thumbnail" 
                  className="w-full h-auto aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Change
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setThumbnailUrl("")}>
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-input rounded-xl p-8 flex flex-col items-center justify-center text-center max-w-xl transition-colors cursor-pointer group ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {isUploading ? <Loader2 className="w-6 h-6 text-brand-green animate-spin" /> : <ImageIcon className="w-6 h-6 text-slate-400" />}
                </div>
                <h3 className="font-medium text-ink mb-1">{isUploading ? 'Uploading...' : 'Upload Image'}</h3>
                <p className="text-xs text-slate-500 mb-4">Supported: JPG, PNG, GIF. Max: 2 MB<br/>Recommended: 640 × 360 px (16:9)</p>
                <Button variant="outline" size="sm" disabled={isUploading}>Select File</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand-green hover:bg-brand-green/90 text-white min-w-[120px]">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
