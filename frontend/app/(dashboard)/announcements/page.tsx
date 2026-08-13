"use client";

import { Megaphone, AlertCircle, CalendarClock, ChevronRight } from "lucide-react";

export default function AnnouncementsPage() {
  const mockAnnouncements = [
    {
      id: "1",
      title: "Q3 Town Hall Meeting Scheduled",
      content: "Join us for the upcoming Q3 Town Hall where we will discuss our latest product launches, revenue milestones, and plans for the next quarter. All employees are expected to attend.",
      priority: "HIGH",
      date: "Oct 12, 2026",
      author: "Jane Doe (Leadership)"
    },
    {
      id: "2",
      title: "New Expense Policy Updates",
      content: "We have updated the travel and expense policy effective immediately. Please review the new guidelines in the Documents portal before submitting any new expense reports for October.",
      priority: "NORMAL",
      date: "Oct 10, 2026",
      author: "Michael Torres (HR)"
    },
    {
      id: "3",
      title: "Office Renovation - 3rd Floor",
      content: "The 3rd-floor breakroom will be closed for renovations starting next Monday. Please use the 2nd-floor facilities in the meantime. We expect the renovations to be completed within two weeks.",
      priority: "LOW",
      date: "Oct 05, 2026",
      author: "Facilities Team"
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-heading tracking-tight text-ink">Announcements</h1>
          <p className="mt-2 text-subtitle text-slate-500">Stay updated with the latest company news and broadcasts.</p>
        </div>
        <button className="hidden sm:inline-flex items-center rounded-full bg-brand-green text-on-dark hover:bg-brand-green-dark px-6 py-2.5 text-sm font-semibold transition-colors">
          New Broadcast
        </button>
      </div>

      <div className="space-y-4">
        {mockAnnouncements.map((announcement) => (
          <div key={announcement.id} className="bg-canvas p-6 rounded-lg border border-hairline shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  announcement.priority === 'HIGH' ? 'bg-semantic-warning-bg text-semantic-warning-text' : 
                  announcement.priority === 'NORMAL' ? 'bg-brand-green/10 text-brand-green-dark' : 'bg-surface text-slate-500'
                }`}>
                  {announcement.priority === 'HIGH' ? <AlertCircle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-heading-4 font-semibold text-ink">{announcement.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="font-medium">{announcement.author}</span>
                    <span>•</span>
                    <span className="flex items-center"><CalendarClock className="mr-1 h-3 w-3" /> {announcement.date}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              {announcement.content}
            </p>
            
            <div className="flex items-center justify-end border-t border-hairline-soft pt-4">
              <button className="flex items-center text-sm font-medium text-brand-green-dark hover:underline">
                Read Full Details <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
