"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

export default function AssignCourseModal({ 
  userId, 
  onClose, 
  onSuccess 
}: { 
  userId?: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses`);
        if (res.ok) {
          const data = await res.json();
          // Filter to only show published courses (if that flag exists) or just all courses for now
          setCourses(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedCourseId) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: selectedCourseId,
          user_ids: userId ? [userId] : [], // Extend this later for bulk assignments if needed
        })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to assign course.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          <h2 className="text-xl font-heading font-semibold text-ink">Assign Course</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-ink hover:bg-canvas rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 border-b border-hairline bg-canvas">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-input rounded-xl text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <label 
                  key={course.id} 
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCourseId === course.id 
                      ? "border-brand-green bg-brand-green/5 shadow-sm" 
                      : "border-hairline hover:border-brand-green/30 hover:bg-canvas"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="course" 
                    className="mt-1 w-4 h-4 text-brand-green focus:ring-brand-green"
                    checked={selectedCourseId === course.id}
                    onChange={() => setSelectedCourseId(course.id)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-ink">{course.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 rounded">{course.course_type}</span>
                      {course.category && <span>{course.category.name}</span>}
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center p-8 text-slate-500">
                No courses found matching your search.
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-hairline bg-surface flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-canvas border border-input rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!selectedCourseId || isSubmitting}
            onClick={handleAssign}
            className="px-5 py-2.5 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-teal-deep transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Assigning..." : "Assign Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
