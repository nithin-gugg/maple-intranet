import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecognitionLeaderboard({ leaderboard, isLoading }: { leaderboard: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🏆</span> Top Recognized
        </h3>
      </div>

      {(!leaderboard || leaderboard.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No data available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div key={user.employee_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                  index === 0 ? "bg-amber-100 text-amber-600" :
                  index === 1 ? "bg-slate-200 text-slate-600" :
                  index === 2 ? "bg-orange-100 text-orange-600" :
                  "bg-transparent text-slate-400"
                )}>
                  {index + 1}
                </div>
                <img 
                  src={user.employee_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.employee_name)}`} 
                  alt={user.employee_name} 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-brand-teal transition-colors">
                    {user.employee_name}
                  </p>
                  <p className="text-xs text-slate-500">{user.designation || 'Employee'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full">
                <span className="font-bold text-amber-600 text-sm">{user.total_stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
