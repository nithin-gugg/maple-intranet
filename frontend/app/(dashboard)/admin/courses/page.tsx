"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, GraduationCap, Loader2, Edit2 } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course? This will also remove any attached SCORM packages.")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}`, { method: "DELETE" });
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete course");
    }
  };

  const handleEdit = async (id: number, currentTitle: string) => {
    const newTitle = prompt("Edit Course Title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/learning/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to update course title");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-heading tracking-tight text-ink">Manage Courses</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage learning modules and SCORM packages.</p>
        </div>
        <Link 
          href="/admin/courses/new" 
          className="flex items-center gap-2 bg-brand-teal-deep text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-teal transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      <div className="bg-canvas border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-hairline text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No courses found.
                  </td>
                </tr>
              ) : courses.map((course) => (
                <tr key={course.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-brand-green/10 flex items-center justify-center text-brand-green-dark">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-ink">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{course.category?.name || `ID: ${course.category_id}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${course.is_published ? 'bg-brand-green/10 text-brand-green-dark' : 'bg-slate-100 text-slate-600'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(course.id, course.title)}
                        className="p-2 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded-md transition-colors"
                        title="Edit Title"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
