"use client";

import { BookOpen, Calendar as CalendarIcon, FileText, ArrowRight, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const upcomingEvents = [
    { id: 1, title: "Company All-Hands Q3", time: "Tomorrow, 10:00 AM", type: "MEETING" },
    { id: 2, title: "Security Compliance Training", time: "Friday, 2:00 PM", type: "TRAINING" }
  ];

  const continueLearning = [
    { id: 1, title: "Information Security 2026", progress: 65 },
    { id: 2, title: "Advanced React Patterns", progress: 30 }
  ];

  return (
    <div className="space-y-10 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-teal-deep to-brand-teal rounded-2xl p-8 shadow-sm flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-display-lg font-heading font-semibold text-white tracking-tight">
            Good morning, Nitin 👋
          </h1>
          <p className="mt-2 text-brand-teal-light text-lg">
            Welcome to Maple Intranet. Here's your overview for today.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 top-0 h-full w-1/3 bg-brand-green/20" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Continue Learning */}
          <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-5 font-semibold text-ink flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-teal" />
                Continue Learning
              </h2>
              <Link href="/learning" className="text-sm font-medium text-brand-green-dark hover:text-brand-green transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {continueLearning.map(course => (
                <div key={course.id} className="p-4 rounded-lg border border-hairline hover:border-brand-teal/30 bg-surface flex items-center justify-between transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink text-sm group-hover:text-brand-teal transition-colors">{course.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="w-32 h-1.5 bg-canvas rounded-full overflow-hidden">
                          <div className="h-full bg-brand-green rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-brand-teal bg-brand-teal/10 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Resume
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Important Documents */}
          <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-5 font-semibold text-ink flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-purple" />
                Important Documents
              </h2>
              <Link href="/documents" className="text-sm font-medium text-brand-green-dark hover:text-brand-green transition-colors flex items-center gap-1">
                Browse Library <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-lg bg-surface border border-hairline hover:border-accent-purple/30 transition-colors cursor-pointer group">
                <h4 className="font-semibold text-ink group-hover:text-accent-purple transition-colors">Employee Handbook 2026</h4>
                <p className="text-sm text-slate-500 mt-1">Updated 2 days ago</p>
              </div>
              <div className="p-5 rounded-lg bg-surface border border-hairline hover:border-accent-orange/30 transition-colors cursor-pointer group">
                <h4 className="font-semibold text-ink group-hover:text-accent-orange transition-colors">Remote Work Policy</h4>
                <p className="text-sm text-slate-500 mt-1">Mandatory Review</p>
              </div>
            </div>
          </section>

        </div>

        {/* Side Column */}
        <div className="space-y-8">
          
          {/* Upcoming Events */}
          <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-5 font-semibold text-ink flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-accent-orange" />
                Upcoming Events
              </h2>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="relative pl-4 border-l-2 border-brand-green">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-brand-green ring-4 ring-canvas"></div>
                  <h4 className="font-semibold text-ink text-sm">{event.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm">
             <h2 className="text-heading-5 font-semibold text-ink mb-4">Quick Links</h2>
             <div className="space-y-2">
               <Link href="/documents" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors text-sm font-medium text-slate-700">
                 Find a Policy
                 <ArrowRight className="h-4 w-4 text-slate-400" />
               </Link>
               <Link href="/employees" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors text-sm font-medium text-slate-700">
                 Employee Directory
                 <ArrowRight className="h-4 w-4 text-slate-400" />
               </Link>
               <Link href="/ai" className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors text-sm font-medium text-slate-700">
                 Ask AI Assistant
                 <ArrowRight className="h-4 w-4 text-slate-400" />
               </Link>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}
