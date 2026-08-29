import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AppDocumentation } from '@/data/apps-documentation';

interface DocumentationContentProps {
  app: AppDocumentation;
}

export function DocumentationContent({ app }: DocumentationContentProps) {
  const Icon = app.icon;

  return (
    <div className="flex-1 max-w-4xl min-w-0 pb-20">
      {/* Header section */}
      <div className="mb-12">
        <div className="flex items-center text-sm text-slate-500 mb-6">
          <span>Overview</span>
          <span className="mx-2 text-slate-400">›</span>
          <span>{app.name}</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-ink mb-4">{app.name}</h1>
        
        <p className="text-xl text-slate-500 leading-relaxed mb-6">
          {app.description}
        </p>

        {app.externalUrl && (
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-slate-500">2 min read</span>
            <a
              href={app.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-hairline hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open {app.name}
            </a>
          </div>
        )}

        {app.purpose && (
          <div className="text-slate-600 dark:text-slate-300 mb-8 prose prose-slate dark:prose-invert max-w-none prose-a:text-brand-green">
            {app.purpose}
          </div>
        )}
      </div>

      <hr className="border-hairline mb-12" />

      {/* Sections */}
      <div className="space-y-16">
        {app.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            data-spy="true"
            className="scroll-mt-24" // Accounts for fixed header when scrolling to hash
          >
            <h2 className="text-2xl font-semibold text-ink mb-6">
              {section.title}
            </h2>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate dark:prose-invert max-w-none prose-headings:text-ink prose-a:text-brand-green">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
