import React from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { OnboardingData } from "@/app/onboarding/page";
import { useUser } from "@clerk/nextjs";

interface Props {
  data: OnboardingData;
  onComplete: () => void;
  onEditStep: (step: number) => void;
  isSaving: boolean;
}

export default function ProfileReviewStep({ data, onComplete, onEditStep, isSaving }: Props) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-heading font-bold text-ink mb-2">
        Your Maple Profile
      </h2>
      <p className="text-slate-500 mb-8">
        Review your details before completing setup.
      </p>
      
      <div className="bg-white rounded-xl border border-hairline shadow-subtle overflow-hidden mb-8">
        
        {/* Basic Info */}
        <div className="p-6 border-b border-hairline">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-ink">{data.first_name} {data.last_name}</h3>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
            <button onClick={() => onEditStep(2)} className="text-sm font-medium text-brand-green hover:text-emerald-500">Edit</button>
          </div>
        </div>
        
        {/* Work Info */}
        <div className="p-6 border-b border-hairline bg-surface-soft/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{data.department_name || "Department"}</p>
              <p className="text-sm text-slate-500">{data.designation}</p>
            </div>
            <button onClick={() => onEditStep(3)} className="text-sm font-medium text-brand-green hover:text-emerald-500">Edit</button>
          </div>
          
          <div className="flex justify-between items-start mt-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Employee ID</p>
              <p className="text-sm font-medium text-slate-700">{data.employee_id || "Not provided"}</p>
            </div>
            <button onClick={() => onEditStep(4)} className="text-sm font-medium text-brand-green hover:text-emerald-500">Edit</button>
          </div>
        </div>

        {/* Dates */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
              <p className="text-sm font-medium text-slate-700">{data.date_of_birth}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Date of Joining</p>
              <p className="text-sm font-medium text-slate-700">{data.joining_date}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => onEditStep(5)} className="text-sm font-medium text-brand-green hover:text-emerald-500">Edit Dates</button>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        disabled={isSaving}
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-brand-green text-brand-teal-deep font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-70"
      >
        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
        Complete Profile
        {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
      </button>
    </div>
  );
}
