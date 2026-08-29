import React from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';

export type CalloutType = 'info' | 'tip' | 'warning' | 'important';

interface DocumentationCalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function DocumentationCallout({ type, title, children }: DocumentationCalloutProps) {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      defaultTitle: 'Info',
    },
    tip: {
      container: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-200',
      icon: <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />,
      defaultTitle: 'Tip',
    },
    warning: {
      container: 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      defaultTitle: 'Warning',
    },
    important: {
      container: 'bg-brand-green/10 border-brand-green/30 text-ink dark:bg-brand-green/20 dark:border-brand-green/50',
      icon: <AlertCircle className="w-5 h-5 text-brand-green" />,
      defaultTitle: 'Important',
    },
  };

  const style = styles[type];

  return (
    <div className={`my-6 flex gap-4 p-4 rounded-xl border ${style.container}`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="space-y-1 text-sm">
        <div className="font-semibold">{title || style.defaultTitle}</div>
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
