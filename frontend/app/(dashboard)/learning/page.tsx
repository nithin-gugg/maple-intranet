"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Clock, Search, ChevronRight } from "lucide-react";

export default function LearningCatalogPage() {
  const categories = [
    { name: "Database & Security", tagClass: "bg-accent-purple text-on-dark" },
    { name: "Search", tagClass: "bg-accent-orange text-on-dark" },
    { name: "Cloud", tagClass: "bg-brand-teal text-on-dark" },
    { name: "General Training", tagClass: "bg-brand-green text-on-dark" }
  ];

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/learning/courses`);
        const data = await res.json();
        setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-heading tracking-tight text-ink">Learning Hub</h1>
          <p className="mt-2 text-subtitle text-slate-500">Master new skills and complete your required training modules.</p>
        </div>
        
        {/* Large Search Pill from MongoDB University style */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            className="h-14 w-full rounded-md border border-hairline-strong bg-canvas pl-12 pr-4 text-base outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-ink text-on-dark text-sm font-medium">All Courses</button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-hairline text-slate-600 hover:bg-surface-soft text-sm font-medium">In Progress</button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-hairline text-slate-600 hover:bg-surface-soft text-sm font-medium">Completed</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No courses found.</div>
        ) : filteredCourses.map((course) => (
          <div key={course.id} className="bg-canvas rounded-lg border border-hairline overflow-hidden hover:shadow-subtle transition-shadow group flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-sm bg-brand-teal text-on-dark`}>
                  {course.category?.name || "General"}
                </span>
              </div>
              
              <h3 className="text-heading-5 font-semibold text-ink mb-2 group-hover:text-brand-green-dark transition-colors">
                {course.title}
              </h3>
              <p className="text-body-sm text-slate-600 mb-6 flex-1">
                {course.description || "No description provided."}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto">
                <div className="flex items-center">
                  <Clock className="mr-1.5 h-4 w-4" />
                  Self-paced
                </div>
                <div className="flex items-center">
                  <PlayCircle className="mr-1.5 h-4 w-4" />
                  Online
                </div>
              </div>
            </div>
            
            <div className="bg-surface-soft p-4 border-t border-hairline flex items-center justify-between">
              <span className={`text-sm font-medium text-slate-500`}>
                Not Started
              </span>
              <a href={`/learning/${course.id}`} className="flex items-center text-sm font-semibold text-brand-green-dark hover:underline group-hover:translate-x-1 transition-transform">
                Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
