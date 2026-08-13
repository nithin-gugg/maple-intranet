import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function EmployeeIdStep({ data, onNext, onBack, isSaving }: Props) {
  const [employeeId, setEmployeeId] = useState(data.employee_id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ employee_id: employeeId.trim() });
  };

  const handleSkip = () => {
    onNext({ employee_id: "" });
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} disabled={isSaving} className="self-start text-slate-400 hover:text-ink mb-6 transition-colors flex items-center text-sm font-medium">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <h2 className="text-3xl font-heading font-bold text-ink mb-3">
        Do you have an employee ID?
      </h2>
      <p className="text-slate-500 mb-8">
        You can add it now or skip this step and update it later.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">
            Employee ID (Optional)
          </label>
          <input
            id="employeeId"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all uppercase"
            placeholder="e.g. EMP-1024"
            autoFocus
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-brand-teal-deep text-white font-medium rounded-lg hover:bg-brand-teal transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Continue
            {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
          <button 
            type="button"
            onClick={handleSkip}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-canvas border border-hairline text-slate-600 font-medium rounded-lg hover:bg-surface-soft transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
