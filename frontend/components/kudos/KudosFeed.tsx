import { KudosCard } from "./KudosCard";
import { Loader2 } from "lucide-react";

export function KudosFeed({ kudos, isLoading }: { kudos: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!kudos || kudos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div className="text-4xl mb-4">🌟</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Kudos yet</h3>
        <p className="text-slate-500 text-sm">Be the first to appreciate someone on the team!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {kudos.map((item) => (
        <KudosCard key={item.id} kudos={item} />
      ))}
    </div>
  );
}
