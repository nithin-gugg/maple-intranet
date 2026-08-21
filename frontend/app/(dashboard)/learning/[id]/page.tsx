"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, PlayCircle } from "lucide-react";
import LearningPlayer from "@/components/scorm/LearningPlayer";
import { useUser } from "@clerk/nextjs";

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-green" /></div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-slate-500">Course not found or you don't have access.</div>;
  }

  const scormModule = course.modules?.find((m: any) => m.content_type === "SCORM" && m.learning_package);
  const learningPackage = scormModule?.learning_package;

  // Use the Next.js proxy to avoid CORS issues for legacy local files
  let proxiedUrl = learningPackage?.entry_point_url;
  if (proxiedUrl) {
    if (proxiedUrl.startsWith('/static/')) {
      proxiedUrl = proxiedUrl.replace('/static/', '/api/learning-static/');
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center p-2 sm:p-3 bg-canvas border-b border-hairline flex-shrink-0 z-10">
        <Link href="/learning" className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-soft border border-hairline rounded-md text-slate-600 hover:text-ink transition-colors">
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Back to Course
        </Link>
      </div>

      <div className="flex-1 bg-surface relative">
        {proxiedUrl && user ? (
          <LearningPlayer 
            packageId={learningPackage.id}
            entryPointUrl={proxiedUrl}
            standard={learningPackage.standard}
            userId={user.id}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-canvas">
            <div className="h-20 w-20 bg-surface-soft text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-hairline">
              <PlayCircle className="h-8 w-8" />
            </div>
            <h3 className="text-heading-4 font-semibold text-ink mb-2">No Content Found</h3>
            <p className="text-slate-500 max-w-md">
              This course does not have a valid learning package uploaded yet, or you are not logged in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
