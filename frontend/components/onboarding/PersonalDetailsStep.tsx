import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function PersonalDetailsStep({ data, onNext, onBack, isSaving }: Props) {
  const [dob, setDob] = useState(data.date_of_birth || "");
  const [doj, setDoj] = useState(data.joining_date || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dob && doj) {
      onNext({ date_of_birth: dob, joining_date: doj });
    }
  };

  const isValid = dob && doj;
  
  // Basic validation: DOB shouldn't be in the future, DOj could be.
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} disabled={isSaving} className="self-start text-slate-400 hover:text-ink mb-6 transition-colors flex items-center text-sm font-medium">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <h2 className="text-3xl font-heading font-bold text-ink mb-3">
        A couple more details
      </h2>
      <p className="text-slate-500 mb-8">
        We need this information to complete your profile setup.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              max={today}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              required
            />
          </div>
          
          <div>
            <label htmlFor="doj" className="block text-sm font-medium text-slate-700 mb-1">
              Date of Joining
            </label>
            <input
              id="doj"
              type="date"
              value={doj}
              onChange={(e) => setDoj(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={!isValid || isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-brand-teal-deep text-white font-medium rounded-lg hover:bg-brand-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Continue
          {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
