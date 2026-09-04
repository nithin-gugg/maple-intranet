"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Edit2, Loader2, PlaySquare, FileText, Layout, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import LessonBuilder from "../../LessonBuilder";

export default function CourseCurriculumStep({ course, onUpdate }: { course: any, onUpdate: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | null>(null);

  const handleAddLesson = async (moduleId: number, currentLessonsCount: number) => {
    const title = prompt("Enter Lesson Title:");
    if (!title) return;
    setAddingLessonToModuleId(moduleId);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, sort_order: currentLessonsCount, completion_type: "MANUAL", is_required: true })
      });
      if (res.ok) {
        onUpdate();
      } else {
        toast({ title: "Failed to add lesson", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setAddingLessonToModuleId(null);
    }
  };

  // We are using a simplified version of the previous builder logic here for demonstration.
  // Full drag-and-drop with dnd-kit can be layered in.
  
  const handleAddModule = async () => {
    const title = prompt("Enter Module Title:");
    if (!title) return;
    setIsAddingModule(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${course.id}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, order: course?.modules.length || 0 })
      });
      onUpdate();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to add module", variant: "destructive" });
    } finally {
      setIsAddingModule(false);
    }
  };

  const selectedLesson = course.modules
    .flatMap((m: any) => m.lessons)
    .find((l: any) => l.id === selectedLessonId);

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-surface shadow-sm">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} border-r border-hairline bg-canvas flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          {!isSidebarCollapsed && <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Curriculum</h3>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded"
          >
            <Layout className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!isSidebarCollapsed && (
            <Button onClick={handleAddModule} disabled={isAddingModule} variant="outline" className="w-full justify-start text-brand-green border-brand-green/20 hover:bg-brand-green/5">
              {isAddingModule ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Module
            </Button>
          )}

          <div className="space-y-4">
            {course.modules.map((module: any, mIdx: number) => (
              <div key={module.id} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 px-2 py-1 bg-slate-100 rounded">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                    <span className="truncate flex-1">{module.title}</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 mx-auto bg-slate-100 text-slate-500 rounded flex items-center justify-center text-xs font-bold" title={module.title}>
                    M{mIdx + 1}
                  </div>
                )}
                
                <div className={`${isSidebarCollapsed ? 'space-y-2 mt-2' : 'pl-4 space-y-1 mt-1'}`}>
                  {module.lessons.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      title={lesson.title}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-full mx-auto' : 'justify-between px-3 py-2 rounded-lg'} text-sm transition-colors ${
                        selectedLessonId === lesson.id
                          ? "bg-brand-green/10 text-brand-green font-medium"
                          : "text-slate-600 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="truncate">{lesson.title}</span>}
                      </div>
                    </button>
                  ))}
                  
                  {!isSidebarCollapsed && (
                    <button 
                      onClick={() => handleAddLesson(module.id, module.lessons?.length || 0)}
                      disabled={addingLessonToModuleId === module.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-brand-green w-full rounded hover:bg-brand-green/5 mt-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingLessonToModuleId === module.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Add Content
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 bg-surface overflow-y-auto">
        {selectedLesson ? (
          <div className="h-full">
            <LessonBuilder lesson={selectedLesson} onUpdate={onUpdate} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Layout className="w-8 h-8" />
            </div>
            <p>Select an item from the curriculum to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
