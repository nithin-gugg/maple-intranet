import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";

interface CourseProgressHeaderProps {
  title: string;
  progressPercent: number;
  totalLessons?: number;
  completedLessons?: number;
  onMenuClick?: () => void;
}

export default function CourseProgressHeader({
  title,
  progressPercent,
  totalLessons = 0,
  completedLessons = 0,
  onMenuClick,
}: CourseProgressHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-surface border-b border-hairline w-full h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      {/* Left side: Back Button & Title */}
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-ink rounded-md hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link
          href="/learning"
          className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="hidden lg:block w-px h-6 bg-hairline mx-2" />
        <h1 className="text-sm font-semibold text-ink truncate max-w-sm xl:max-w-xl">
          {title || "Loading Course..."}
        </h1>
      </div>

      {/* Right side: Progress Bar */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-700">
              {Math.round(progressPercent)}% Complete
            </span>
            {totalLessons > 0 && (
              <span className="text-xs text-slate-400">
                ({completedLessons} / {totalLessons} lessons)
              </span>
            )}
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
