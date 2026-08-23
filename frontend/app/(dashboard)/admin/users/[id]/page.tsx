"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CheckCircle2, History, X } from "lucide-react";
import AssignCourseModal from "@/components/admin/courses/AssignCourseModal";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assignments/users/${userId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  const unassignCourse = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to unassign this course? Historical progress will be preserved, but it will be removed from their active learning list.")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assignments/${assignmentId}/unassign`, {
        method: "POST"
      });
      if (res.ok) {
        fetchUserData(); // refresh
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading user details...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-red-500">User not found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-canvas flex flex-col">
      <div className="p-8 border-b border-hairline bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <Link href="/admin/users" className="text-sm font-medium text-slate-500 hover:text-ink flex items-center gap-1 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Link>
          
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-2xl">
                U
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-ink">User Details</h1>
                <p className="text-slate-500 mt-1">ID: {userId}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setAssignModalOpen(true)}
              className="px-5 py-2.5 bg-brand-green text-white font-medium rounded-lg hover:bg-brand-teal-deep transition-colors"
            >
              + Assign Course
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Active Assignments */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-ink mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-teal" /> Active Assignments
            </h2>
            
            <div className="bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-hairline text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Course</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {data.assignments.length > 0 ? (
                    data.assignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-ink">{assignment.course_title}</td>
                        <td className="p-4 text-sm text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{assignment.course_type}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${
                            assignment.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                            assignment.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                          }`}>
                            {assignment.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                            {assignment.status === "IN_PROGRESS" && <Clock className="w-3 h-3" />}
                            {assignment.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-teal transition-all" style={{ width: `${assignment.progress_percent}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{assignment.progress_percent}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => unassignCourse(assignment.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Unassign Course"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No active assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Learning History */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-ink mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" /> Learning History (Attempts)
            </h2>
            
            <div className="bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-hairline text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Course</th>
                    <th className="p-4">Attempt #</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4 text-right">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {data.history.length > 0 ? (
                    data.history.map((attempt: any) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-ink">{attempt.course_title}</td>
                        <td className="p-4 text-sm text-slate-600">Attempt {attempt.attempt_number}</td>
                        <td className="p-4 text-sm capitalize text-slate-600">{attempt.status.replace("_", " ")}</td>
                        <td className="p-4 text-sm font-medium text-slate-600">{attempt.progress_percent || 0}%</td>
                        <td className="p-4 text-sm text-slate-500 text-right">
                          {new Date(attempt.started_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No learning history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
      
      {assignModalOpen && (
        <AssignCourseModal 
          userId={userId} 
          onClose={() => setAssignModalOpen(false)} 
          onSuccess={() => {
            setAssignModalOpen(false);
            fetchUserData();
          }} 
        />
      )}
    </div>
  );
}
