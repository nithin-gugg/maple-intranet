"use client";

import React, { useEffect, useState } from 'react';
import { AppDocumentation } from '@/data/apps-documentation';

interface OnThisPageProps {
  app: AppDocumentation;
}

export function OnThisPage({ app }: OnThisPageProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // If multiple are visible, pick the top one
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: 0.1,
      }
    );

    const sectionElements = document.querySelectorAll('section[data-spy="true"]');
    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, [app.id]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed header if any
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!app.sections || app.sections.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-12">
      <div className="flex items-center gap-2 mb-4 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
        <h3 className="text-xs font-semibold tracking-wider uppercase">
          On this page
        </h3>
      </div>
      <div className="space-y-1 text-sm border-l border-hairline">
        {app.sections.map((section) => {
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-full text-left pl-4 py-1.5 transition-colors border-l-[3px] -ml-[1px] ${
                isActive
                  ? 'border-brand-green text-ink font-medium'
                  : 'border-transparent text-slate-500 hover:text-ink dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
