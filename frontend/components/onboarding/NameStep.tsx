import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  isSaving: boolean;
}

export default function NameStep({ data, onNext, isSaving }: Props) {
  const [firstName, setFirstName] = useState(data.first_name || "");
  const [lastName, setLastName] = useState(data.last_name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onNext({ first_name: firstName, last_name: lastName });
    }
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-heading font-bold text-ink mb-3">
        What should we call you?
      </h2>
      <p className="text-slate-500 mb-8">
        Tell us your name so we can personalize your Maple experience.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              placeholder="e.g. John"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              placeholder="e.g. Doe"
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
