import { Users, Star, Gift, Award, Loader2 } from "lucide-react";

export function RecognitionStats({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Organization Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kudos</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.total_kudos || 0}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stars Given</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.stars_given || 0}</span>
        </div>

        <div className="flex flex-col mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recognized</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.employees_recognized || 0}</span>
        </div>

        <div className="flex flex-col mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presents</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.presents_given || 0}</span>
        </div>
      </div>
    </div>
  );
}
