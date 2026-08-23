"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, FileText, PlayCircle } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { useRouter } from "next/navigation";

export default function NativeLearningPlayer({ courseId, userId }: { courseId: number, userId?: string }) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/hierarchy`),
          userId ? fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/progress?user_id=${userId}`) : Promise.resolve(null)
        ]);
        
        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data);
          
          if (progressRes && progressRes.ok) {
            const progressData = await progressRes.json();
            setCompletedLessonIds(progressData.completed_lesson_ids || []);
            if (progressData.status === "COMPLETED") {
              setCourseCompleted(true);
            }
          }

          // Select first lesson by default
          if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
            setActiveLessonId(data.modules[0].lessons[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, userId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading course content...</div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-red-500">Failed to load course.</div>;
  }

  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const activeLessonIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const activeLesson = allLessons[activeLessonIndex];
  
  const handleContinue = async () => {
    if (!userId || !activeLessonId) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/lessons/${activeLessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCompletedLessonIds(data.completed_lesson_ids || []);
        
        if (data.status === "COMPLETED") {
          setCourseCompleted(true);
        } else if (activeLessonIndex < allLessons.length - 1) {
          // Advance to next lesson
          setActiveLessonId(allLessons[activeLessonIndex + 1].id);
        } else {
          // If we reached the end but it's not completed? Just in case, mark as done
          setCourseCompleted(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (courseCompleted) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-surface">
        <div className="max-w-md p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-brand-green">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-ink">Course Completed!</h2>
          <p className="text-slate-500">Congratulations! You have successfully completed all lessons in this course.</p>
          <button 
            onClick={() => router.push("/learning")}
            className="w-full py-3 bg-brand-green hover:bg-brand-teal-deep text-white rounded-lg font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-surface">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-hairline bg-canvas flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-hairline bg-surface">
          <h3 className="font-heading font-semibold text-ink truncate">{course.title}</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {course.modules.map((module: any, mIdx: number) => (
            <div key={module.id} className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Module {mIdx + 1}: {module.title}
              </h4>
              <div className="space-y-1">
                {module.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeLessonId === lesson.id
                        ? "bg-brand-green/10 text-brand-green font-medium"
                        : "text-slate-600 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {completedLessonIds.includes(lesson.id) && (
                      <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeLesson ? (
          <div className="max-w-5xl mx-auto py-12 px-8">
            <h1 className="text-4xl font-heading font-bold text-ink mb-8">{activeLesson.title}</h1>
            
            <div className="space-y-8">
              {activeLesson.content_blocks?.length > 0 ? (
                activeLesson.content_blocks.map((block: any) => (
                  <ContentBlockRenderer key={block.id} block={block} />
                ))
              ) : (
                <p className="text-slate-500 italic">This lesson has no content.</p>
              )}
            </div>
            
            {/* Navigation footer */}
            <div className="mt-16 pt-8 border-t border-hairline flex justify-end">
              <button 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-brand-teal-deep transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={handleContinue}
              >
                {isSubmitting ? "Saving..." : completedLessonIds.includes(activeLesson.id) ? "Continue" : "Mark Complete & Continue"} 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Select a lesson to begin.
          </div>
        )}
      </div>
      
    </div>
  );
}

// ----------------------------------------------------------------------
// Content Block Renderer
// ----------------------------------------------------------------------

function ContentBlockRenderer({ block }: { block: any }) {
  const metadata = block.metadata_json || {};
  
  switch (block.type) {
    case "TEXT":
      return <ReadOnlyTipTap content={block.content} />;
      
    case "VIDEO":
      const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      const videoId = metadata.url ? extractYoutubeId(metadata.url) : null;
      
      if (!videoId) return null;
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
      
    case "IMAGE":
      if (!metadata.url) return null;
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-hairline flex justify-center bg-canvas p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={metadata.url} 
            alt={metadata.alt || ""} 
            className="max-h-[500px] object-contain rounded-lg"
          />
        </div>
      );
      
    case "EMBED":
      if (!metadata.url) return null;
      return (
        <a 
          href={metadata.url} 
          target="_blank" 
          rel="noreferrer"
          className="block p-4 border border-hairline rounded-xl hover:border-brand-green hover:shadow-md transition-all bg-surface group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-lg group-hover:bg-brand-green group-hover:text-white transition-colors">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-ink group-hover:text-brand-green transition-colors">{metadata.title || "External Resource"}</h4>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-lg">{metadata.url}</p>
            </div>
          </div>
        </a>
      );
      
    case "QUIZ":
      return (
        <div className="p-6 border border-brand-teal/20 bg-brand-teal/5 rounded-xl space-y-4">
          <h4 className="font-semibold text-brand-teal-deep text-lg">{metadata.question}</h4>
          <div className="space-y-2">
            {metadata.options?.map((opt: any) => (
              <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-hairline bg-surface hover:bg-canvas cursor-pointer transition-colors">
                <input type="radio" name={`quiz-${block.id}`} className="w-4 h-4 text-brand-teal focus:ring-brand-teal" />
                <span className="text-sm text-ink">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
      
    default:
      return null;
  }
}

// ----------------------------------------------------------------------
// ReadOnly TipTap Editor
// ----------------------------------------------------------------------

function ReadOnlyTipTap({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
  });

  if (!editor) return null;

  return (
    <div className="prose prose-slate prose-lg max-w-none prose-p:my-4 prose-headings:font-heading prose-headings:text-ink prose-a:text-brand-green">
      <EditorContent editor={editor} />
    </div>
  );
}
