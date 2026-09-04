"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export default function CourseReviewStep({ course, onUpdate }: { course: any, onUpdate: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${course.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: true }),
      });

      if (res.ok) {
        toast({ title: "Course published successfully!" });
        onUpdate();
      } else {
        toast({ title: "Failed to publish course", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${course.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: false }),
      });

      if (res.ok) {
        toast({ title: "Course moved to drafts" });
        onUpdate();
      } else {
        toast({ title: "Failed to unpublish course", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Check validations
  const hasTitle = !!course.title;
  const hasCurriculum = course.modules && course.modules.length > 0;
  
  const canPublish = hasTitle && hasCurriculum;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Review & Publish</h2>
        <p className="text-muted-foreground">Review your course details before making it available to learners.</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="px-6 py-4 bg-slate-50 border-b border-hairline flex items-center justify-between">
          <h3 className="font-semibold text-ink uppercase tracking-wider text-sm">Course Overview</h3>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${course.is_published ? 'bg-brand-green/20 text-brand-green' : 'bg-amber-100 text-amber-700'}`}>
            {course.is_published ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-[150px_1fr] gap-4">
            <span className="text-sm text-slate-500 font-medium">Title</span>
            <span className="text-sm text-ink">{course.title || <span className="text-red-500">Missing</span>}</span>
            
            <span className="text-sm text-slate-500 font-medium">Category</span>
            <span className="text-sm text-ink">{course.category?.name || "Uncategorized"}</span>
            
            <span className="text-sm text-slate-500 font-medium">Duration</span>
            <span className="text-sm text-ink">{course.duration_minutes ? `${course.duration_minutes} minutes` : "Not set"}</span>
            
            <span className="text-sm text-slate-500 font-medium">Enrollment</span>
            <span className="text-sm text-ink">{course.self_enrollment ? "Self Enrollment Allowed" : "Admin Assigned Only"}</span>
            
            <span className="text-sm text-slate-500 font-medium">Mandatory</span>
            <span className="text-sm text-ink">{course.is_mandatory ? "Yes" : "No"}</span>
            
            <span className="text-sm text-slate-500 font-medium">Certificate</span>
            <span className="text-sm text-ink">{course.certificate_template_id ? "Enabled" : "Disabled"}</span>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">Curriculum Summary</h4>
            {course.modules?.length === 0 ? (
              <p className="text-sm text-red-500 flex items-center"><X className="w-4 h-4 mr-1" /> No curriculum content added</p>
            ) : (
              <div className="space-y-2">
                {course.modules?.map((m: any, i: number) => (
                  <div key={m.id} className="text-sm pl-4 border-l-2 border-slate-200">
                    <span className="font-medium text-slate-700">Module {i + 1}: {m.title}</span>
                    <span className="text-slate-500 ml-2">({m.lessons?.length || 0} items)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        {!canPublish ? (
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">Cannot publish course yet</p>
            <p className="text-sm text-slate-500">Please fix the missing requirements above.</p>
          </div>
        ) : course.is_published ? (
          <div className="text-center">
            <p className="text-brand-green font-medium mb-4 flex items-center justify-center"><Check className="w-5 h-5 mr-1" /> Course is live</p>
            <Button onClick={handleUnpublish} disabled={isPublishing} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Unpublish Course
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-ink font-medium mb-4">Ready to go live?</p>
            <Button onClick={handlePublish} disabled={isPublishing} className="bg-brand-green hover:bg-brand-green/90 text-white min-w-[200px]">
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Publish Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
