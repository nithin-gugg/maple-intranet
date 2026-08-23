"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, GripVertical, FileText, Layout, PlaySquare, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import LessonBuilder from "@/components/admin/courses/LessonBuilder";

type ContentBlock = {
  id: number;
  type: string;
  content: string | null;
  sort_order: number;
  metadata_json: any;
};

type Lesson = {
  id: number;
  title: string;
  sort_order: number;
  content_blocks: ContentBlock[];
};

type Module = {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
};

type CourseHierarchy = {
  id: number;
  title: string;
  course_type: string;
  is_published: boolean;
  modules: Module[];
};

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<CourseHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  
  const fetchCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/hierarchy`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0 && !selectedLessonId) {
          setSelectedLessonId(data.modules[0].lessons[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleAddModule = async () => {
    const title = prompt("Enter Module Title:");
    if (!title) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, order: course?.modules.length || 0 })
      });
      fetchCourse();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLesson = async (moduleId: number, currentLessonsCount: number) => {
    const title = prompt("Enter Lesson Title:");
    if (!title) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sort_order: currentLessonsCount, completion_type: "MANUAL", is_required: true })
      });
      fetchCourse();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    const newStatus = !course.is_published;
    if (newStatus && course.modules.length === 0) {
      alert("Cannot publish a course without any modules.");
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newStatus })
      });
      if (res.ok) {
        setCourse({ ...course, is_published: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading course builder...</div>;
  if (!course) return <div className="p-8 text-center text-red-500">Course not found</div>;

  const selectedLesson = course.modules
    .flatMap(m => m.lessons)
    .find(l => l.id === selectedLessonId);

  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 overflow-hidden bg-surface">
      {/* Sidebar / Curriculum Tree */}
      <div className="w-80 border-r border-hairline bg-canvas flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-hairline bg-surface">
          <Link href="/admin/courses" className="text-xs font-medium text-slate-500 hover:text-brand-green flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Courses
          </Link>
          <h2 className="text-lg font-heading font-semibold text-ink truncate">{course.title}</h2>
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.is_published ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-slate-500'}`}>
              {course.is_published ? 'Published' : 'Draft'}
            </span>
            
            <button
              onClick={handleTogglePublish}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${course.is_published ? 'bg-brand-green' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${course.is_published ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Curriculum</h3>
            <button onClick={handleAddModule} className="p-1 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {course.modules.map((module, mIdx) => (
              <div key={module.id} className="space-y-1">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                    <span>Module {mIdx + 1}: {module.title}</span>
                  </div>
                  <button onClick={() => handleAddLesson(module.id, module.lessons.length)} className="p-1 text-slate-400 hover:text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="pl-6 space-y-1 mt-2">
                  {module.lessons.map((lesson, lIdx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLessonId === lesson.id
                          ? "bg-brand-green/10 text-brand-green font-medium"
                          : "text-slate-600 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    </button>
                  ))}
                  
                  {module.lessons.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400 italic">No lessons yet</div>
                  )}
                </div>
              </div>
            ))}
            
            {course.modules.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-input rounded-xl">
                <p className="text-sm text-slate-500 mb-2">No modules found</p>
                <button onClick={handleAddModule} className="text-sm font-medium text-brand-green">Add Module</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Lesson Editor Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
        {selectedLesson ? (
          <LessonBuilder 
            lesson={selectedLesson} 
            onUpdate={fetchCourse} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-3">
            <Layout className="w-12 h-12 text-slate-300" />
            <p>Select a lesson from the sidebar to start building.</p>
          </div>
        )}
      </div>
    </div>
  );
}
