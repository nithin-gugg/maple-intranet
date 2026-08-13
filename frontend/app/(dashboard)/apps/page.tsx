"use client";

import { ExternalLink, BookOpen, Kanban } from "lucide-react";

export default function AppsHubPage() {
  const apps = [
    {
      id: "confluence",
      name: "Confluence",
      description: "Company Knowledge Base, wikis, and team workspaces.",
      icon: BookOpen,
      url: "https://confluence.atlassian.com/",
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      id: "trello",
      name: "Trello",
      description: "Project management, task tracking, and kanban boards.",
      icon: Kanban,
      url: "https://trello.com/",
      color: "text-brand-teal",
      bg: "bg-brand-teal/10",
      border: "border-brand-teal/20"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-lg font-heading tracking-tight text-ink">Applications</h1>
        <p className="mt-2 text-subtitle text-slate-500">Access connected third-party tools and internal platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="h-full bg-canvas p-6 rounded-xl border border-hairline shadow-sm hover:shadow-subtle transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${app.bg} ${app.border}`}>
                  <app.icon className={`h-6 w-6 ${app.color}`} />
                </div>
                <div className="p-2 bg-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              <h3 className="text-heading-5 font-semibold text-ink mb-2 group-hover:text-brand-green-dark transition-colors">{app.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{app.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
