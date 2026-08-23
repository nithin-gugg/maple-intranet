"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserCircle, BookOpen, ChevronRight, Settings } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assignments/users`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-canvas flex flex-col">
      <div className="p-8 border-b border-hairline bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-ink">Users & Assignments</h1>
              <p className="text-slate-500 mt-1">Manage employee training and course assignments.</p>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-canvas border border-input rounded-lg text-sm w-64 focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center p-12 text-slate-500">Loading users...</div>
          ) : (
            <div className="bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-hairline text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Assigned Courses</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-ink">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.email || user.employee_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {user.department}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-teal" />
                            <span className="font-medium text-brand-teal-deep">{user.assigned_courses}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/admin/users/${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-canvas border border-input rounded-md text-sm font-medium hover:bg-surface hover:text-brand-green transition-colors"
                          >
                            Manage <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
