"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, PlayCircle, CheckCircle2, RotateCcw, BookOpen, FileText } from "lucide-react";
import LearningPlayer from "@/components/scorm/LearningPlayer";
import NativeLearningPlayer from "@/components/learning/NativeLearningPlayer";
import CourseProgressHeader from "@/components/learning/CourseProgressHeader";
import { useUser, useAuth } from "@clerk/nextjs";

export default function CoursePlayerPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("not attempted");
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const { user } = useUser();
  const { userId, getToken } = useAuth();

  const handleMarkComplete = async () => {
    if (!userId) return;
    setIsMarkingComplete(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setProgress(100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let isInitialLoad = true;
    const fetchCourse = async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}`);
        if (userId) {
          url.searchParams.append("user_id", userId);
        }
        const res = await fetch(url.toString());
        if (!res.ok) {
          setCourse(null);
          return;
        }
        const data = await res.json();
        
        if (isInitialLoad) {
          setCourse(data);
          isInitialLoad = false;
        }
        
        setProgress(data.progress_percent || 0);
        setStatus(data.status || "not attempted");
        
        if (data.status === "COMPLETED") {
          // Fetch certificate if it exists
          try {
            const token = await getToken();
            const certRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/my`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (certRes.ok) {
              const certs = await certRes.json();
              const myCert = certs.find((c: any) => c.course_id === parseInt(id));
              if (myCert) {
                setCertificate(myCert);
              }
            }
          } catch (e) {
            console.error("Failed to fetch certificate", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId !== undefined) {
      fetchCourse();
      
      // Poll for progress updates every 10 seconds
      const interval = setInterval(fetchCourse, 10000);
      return () => clearInterval(interval);
    }
  }, [id, userId]);

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

  const handleRestart = async () => {
    if (!userId || !confirm("Are you sure you want to restart this course? A new attempt will be created.")) return;
    setIsRestarting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        // Remove mode=review from URL if present and reload
        router.push(`/learning/${id}`);
        setTimeout(() => window.location.reload(), 200); // Hacky reload for clean state
      }
    } catch (e) {
      console.error(e);
      setIsRestarting(false);
    }
  };

  if (status === "completed" && mode !== "review") {
    return (
      <div className="flex flex-col h-full w-full bg-surface items-center justify-center p-8">
        <div className="max-w-md w-full bg-canvas border border-hairline rounded-2xl p-8 text-center shadow-lg">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-ink mb-2">Course Completed!</h2>
          <p className="text-slate-500 mb-8">
            You have successfully completed <strong>{course.title}</strong>. What would you like to do next?
          </p>
          
          <div className="flex flex-col gap-3">
            {certificate && (
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${certificate.generated_file_path}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-teal text-white font-medium rounded-xl hover:bg-brand-teal-deep transition-colors"
              >
                <FileText className="w-5 h-5" /> Download Certificate
              </a>
            )}
            
            <Link 
              href={`/learning/${id}?mode=review`}
              className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-colors ${
                certificate ? 'bg-surface-soft border border-hairline text-slate-700 hover:bg-slate-100' : 'bg-brand-green text-white hover:bg-brand-teal-deep'
              }`}
            >
              <BookOpen className="w-5 h-5" /> Review Course
            </Link>
            
            <button 
              onClick={handleRestart}
              disabled={isRestarting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface-soft border border-hairline text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {isRestarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
              Restart Course (New Attempt)
            </button>
            
            <Link 
              href="/learning"
              className="w-full flex items-center justify-center py-3 text-slate-500 font-medium hover:text-ink transition-colors mt-2"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative z-0">
      <CourseProgressHeader
        title={course.title}
        progressPercent={progress}
        totalLessons={course.course_type === "NATIVE" ? course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) : 0}
        completedLessons={course.course_type === "NATIVE" ? Math.round((progress / 100) * course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)) : 0}
        onMenuClick={course.course_type === "NATIVE" ? () => setIsSidebarCollapsed(!isSidebarCollapsed) : undefined}
      />

      <div className="flex-1 bg-surface relative overflow-hidden flex flex-col h-full">
        {mode === "review" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Review Mode: Progress will not be saved.
          </div>
        )}
        
        {course.course_type === "NATIVE" ? (
          <NativeLearningPlayer 
            courseId={course.id} 
            userId={userId || undefined} 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
        ) : proxiedUrl && user ? (
          <LearningPlayer 
            packageId={learningPackage.id}
            entryPointUrl={proxiedUrl}
            standard={learningPackage.standard}
            userId={user.id}
            // mode={mode} // Ideally pass mode to player to set cmi.mode="review"
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
