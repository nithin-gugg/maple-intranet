import { Star, Award, Gift, Loader2 } from "lucide-react";

export function MyRecognition({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h3 className="text-lg font-bold mb-6 relative z-10">My Recognition</h3>
      
      {stats?.total_received > 0 ? (
        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Star className="w-6 h-6 text-brand-green mx-auto mb-2" />
            <div className="text-2xl font-black">{stats.stars_received}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Stars</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Award className="w-6 h-6 text-brand-teal-light mx-auto mb-2" />
            <div className="text-2xl font-black">{stats.total_received}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Kudos</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Gift className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-black">{stats.presents_received}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Presents</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 relative z-10">
          <p className="text-slate-400 text-sm">No recognition received yet.</p>
          <p className="text-slate-500 text-xs mt-1">Your contributions will be celebrated here.</p>
        </div>
      )}
      
      {stats?.most_common_reason && (
        <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
          <p className="text-xs text-slate-400 mb-1">Top Strength</p>
          <p className="text-sm font-semibold text-brand-green">{stats.most_common_reason}</p>
        </div>
      )}
    </div>
  );
}
