import React from 'react';
import { AppDocumentation } from '@/data/apps-documentation';

interface AppSidebarProps {
  apps: AppDocumentation[];
  selectedAppId: string;
  onSelectApp: (id: string) => void;
}

export function AppSidebar({ apps, selectedAppId, onSelectApp }: AppSidebarProps) {
  return (
    <div className="hidden lg:block w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 h-[calc(100vh-18rem)] overflow-y-auto no-scrollbar pb-12 border-r border-hairline pr-6">
      <div className="hidden lg:block mb-6">
        <h2 className="text-heading-6 font-semibold text-ink">Apps & Tools</h2>
      </div>

      <div className="space-y-1">
        {apps.map((app) => {
          const isActive = app.id === selectedAppId;

          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`w-full flex items-center py-2 relative transition-all text-left text-sm ${isActive
                ? 'text-ink font-medium bg-surface rounded-lg shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-slate-200'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand-green rounded-r-full" />
              )}
              <span className={isActive ? 'pl-4' : 'pl-4'}>{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
