import { Star, Gift } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function KudosCard({ kudos }: { kudos: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={kudos.sender.avatar || `https://ui-avatars.com/api/?name=${kudos.sender.first_name}+${kudos.sender.last_name}`} 
            alt={kudos.sender.first_name} 
            className="w-10 h-10 rounded-full bg-slate-100" 
          />
          <div>
            <p className="text-sm">
              <span className="font-bold text-slate-900">{kudos.sender.first_name} {kudos.sender.last_name}</span>
              <span className="text-slate-500 mx-1">recognized</span>
              <span className="font-bold text-slate-900">{kudos.recipient.first_name} {kudos.recipient.last_name}</span>
            </p>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(kudos.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex bg-amber-50 px-2 py-1 rounded-full items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-amber-600">{kudos.stars}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 text-brand-teal-deep text-xs font-semibold mb-3">
          <span>{kudos.reason.icon}</span>
          <span>{kudos.reason.name}</span>
        </div>
        
        <p className="text-slate-700 text-sm italic leading-relaxed">
          "{kudos.message}"
        </p>
      </div>

      {kudos.present && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-medium text-slate-600">
          <Gift className="w-4 h-4 text-brand-teal" />
          Attached: <span className="text-slate-900">{kudos.present.icon} {kudos.present.name}</span>
        </div>
      )}
    </div>
  );
}
